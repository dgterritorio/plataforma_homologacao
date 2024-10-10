const { aquireTransaction } = require(__basedir + 'modules/db/base');
const emails = require(__basedir + '/modules/emails/main');
const { createFolderHierarchy, shareFolder, unshareFolder } = require(__basedir + 'modules/nextcloud/main');
const uploadAux = require('../aux/homologation-uploads')
const { v4 } = require('uuid');

const baseUrl = global.App.url;

const vectorial_columns = Object.freeze([
    'data_type',
    'data_type_custom',
    'acquisition_type',
    'data_specification',
    'data_specification_custom',
    'data_specification_version',
    'data_structure',
    'epsg',
    'number_sheets',
    'planimetric_error',
    'planimetric_point_percent',
    'planimetric_deviation',
    'altimetric_error',
    'altimetric_point_percent',
    'altimetric_deviation',
    'semantic_completude',
    'semantic_classification',
    'max_semantic_incoherent',
    'max_semantic_duplicates',
    'max_discontinuity_number',
    'max_discontinuity_sheets',
    'pontual_elements',
    'linear_elements',
    'request_id'
]);

const imagery_columns = Object.freeze([
    'data_type',
    'data_type_custom',
    'data_specification',
    'data_specification_custom',
    'data_specification_version',
    'spatial_resolution',
    'epsg',
    'bands_number',
    'orto_number',
    'orto_resolution',
    'orto_radiometric',
    'orto_radiometric_custom',
    'orto_radiometric_resolution',
    'dimension_x',
    'dimension_y',
    'planimetric_error',
    'planimetric_point_percent',
    'planimetric_deviation',
    'altimetric_model_error',
    'is_digital_terrain',
    'is_digital_surface',
    'model_band',
    'model_resolution',
    'request_id'
]);

async function assignEvaluator(db, params) {
    const requestId = params.requestId;
    const userId = params.userId;

    let result;

    result = await db.query('select id from homologation.evaluation_owners where request_id = $1', [requestId]);

    if (result.error) {
        return result.error;
    }

    if (result.data.length) {
        return { error: null, data: [], total: result.data.length };
    }


    result = await db.query('insert into homologation.evaluation_owners(request_id, user_id) values($1, $2)', [requestId, userId], { userId: userId });

    return result;
}

async function revokeNextcloudAccess(db, params) {
    let result;
    let sql;

    const requestId = params.requestId;

    result = await db.query('select vectorial from homologation.requests where id = $1', [requestId]);

    if (result.error || !result.data.length) {
        return result.error;
    }

    const vectorial = result.data[0].vectorial;

    sql = 'select id, upload_link_id from homologation.' + (vectorial ? 'request_vectorial' : 'request_image') + ' where request_id = $1';

    result = await db.query(sql, [requestId])

    if (result.error || !result.data.length) {
        return result.error;
    }

    const cartography = result.data[0];

    const uploadLinkId = cartography.upload_link_id;
    const cartoId = cartography.id;

    // TODO: Não devia de chegar aqui a null, com exceção do estado 8 -> 50
    if (uploadLinkId === undefined || uploadLinkId === null) {
        console.log("   [WARN] Nextcloud link was null");
        console.log("       State: ", params ? params.code : '');

        return { error: null };
    }

    const error = await unshareFolder(uploadLinkId);

    // if (error) {
    //     throw error;
    // }

    sql = 'update homologation.' + (vectorial ? 'vectorial_carto' : 'imagery_carto');
    sql += ' set upload_link_id = null, upload_link = null, upload_password = null where id = ' + cartoId;

    result = await db.query(sql, [], { userId: params.userId });

    return result;
}

async function duplicateCartography(db, params, forceDuplicate) {
    let result;

    const requestId = params.requestId;
    const stateId = params.stateId;
    const userId = params.userId;

    result = await db.query('select vectorial, applicant_id from homologation.requests where id = $1', [requestId]);

    if (result.error || !result.data.length) {
        return result.error;
    }

    const vectorial = result.data[0].vectorial;
    const nextcloudUserId = result.data[0].applicant_id;

    let sql = '';

    // Check if need duplicate
    const viewtable = vectorial ? 'request_vectorial' : 'request_image';
    const table = vectorial ? 'vectorial_carto' : 'imagery_carto';

    result = await db.query('select (invalid = true or work_area_recovered = false) as is_invalid, id from homologation.' + viewtable + ' where request_id = $1', [requestId]);

    if (result.error || !result.data.length) {
        return result.error;
    }

    const invalidData = result.data[0];

    const isInvalid = invalidData.is_invalid;

    // If not invalid, do nothing
    if (!isInvalid && !forceDuplicate) {
        return { data: [], error: null, total: 0 };
    }

    // Set last cartogrophy to invalid
    const invalidId = invalidData.id;

    result = await db.query('update homologation.' + table + ' set invalid = true where id = $1', [invalidId], { userId: params.userId });

    if (result.error) {
        throw result.error;
    }

    // Get last version number
    if (vectorial) {
        result = await db.query('select version from homologation.request_vectorial where request_id = $1', [requestId]);
    } else {
        result = await db.query('select version from homologation.request_image where request_id = $1', [requestId]);
    }

    if (result.error || !result.data.length) {
        return result.error;
    }

    const oldVersion = result.data[0].version;

    const extra = [
        'version',
        'state_id',
        'upload_link_id',
        'upload_link',
        'upload_password',
        'upload_folder'
    ];

    const uploadPassword = v4();

    const version = oldVersion + 1;

    const uploadFolder = uploadAux.genNextcloudFolder(nextcloudUserId, requestId, version); //'/homologacao/u' + userId + '/r' + requestId + '/carto' + version + '/';

    // Next cloud create folder
    await createFolderHierarchy(uploadFolder);

    // Ask for shared link (applicant)
    const shareInfo = await shareFolder({ path: uploadFolder, password: uploadPassword, publicUpload: true });

    const uploadLinkId = shareInfo.id;
    const uploadLink = shareInfo.url;

    if (vectorial) {
        sql += 'insert into homologation.vectorial_carto(' + vectorial_columns.join(',') + ',' + extra.join(',') + ') ';
        sql += 'select ' + vectorial_columns.join(',') + ', $2, $3, $4, $5, $6, $7 ' + 'from homologation.request_vectorial where request_id = $1';
    } else {
        sql += 'insert into homologation.imagery_carto(' + imagery_columns.join(',') + ',' + extra.join(',') + ') ';
        sql += 'select ' + imagery_columns.join(',') + ', $2, $3, $4, $5, $6, $7 ' + 'from homologation.request_image where request_id = $1';
    }

    // console.log(sql)
    // console.log([requestId, stateId, uploadLinkId, uploadLink, uploadPassword, uploadFolder])

    result = await db.query(sql, [requestId, version, stateId, uploadLinkId, uploadLink, uploadPassword, uploadFolder], { userId: params.userId });

    return result;
}


async function executePreStateOperations(db, params) {
    let result = { error: null }

    const codeResult = await db.query('select code, id from homologation.states s where s.request_id = $1 and id = homologation.get_request_current_state_id($1)', [params.requestId]);

    if (codeResult.error) {
        return { error: codeResult.error };
    }

    const data = codeResult.data;
    const code = data.length ? data[0].code : null;

    console.log("Executing pre-state operations: ", params, data)

    switch (code) {
        case 2:
            // Sanity check if the user is an evaluator
            if (params.userGroup === 4) {
                result = await assignEvaluator(db, params);
            }
            break;
    }

    return result;
}

async function executeStateOperations(db, params) {
    const code = params.code;
    const previousStateCode = params.previousStateCode;

    let result = { error: null }

    switch (code) {
        case 2:
        case 4:
        case 57:
        case 50:
        case 53:
            result = await revokeNextcloudAccess(db, params);
            break;
        case 3:
        case 51:
            result = await duplicateCartography(db, params);
            break;
        case 55:
            // Force if we came from state code 52 (Análise Prévia)
            result = await duplicateCartography(db, params, previousStateCode === 52);
            break;
    }

    return result;
}

async function getRequestInfo(params) {

    const userId = params.userId;
    const userGroup = params.userGroup;
    const requestId = params.requestId;
    const stateId = params.stateId;

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;
        let previousStateCode;

        if (userGroup === 2) {
            // Check if we have permission for state transition
            result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

            if (result.error) {
                throw result.error;
            }

            if (!result.data.length) {
                await db.rollback();

                await db.release();

                return { data: [], error: null, total: 0 };
            }

            console.log("> User is an applicant and has permission over the request: ", userId, userGroup, requestId)
        }

        /**
         * Sanity check to avoid advancing state safelly
         */
        result = await db.query('select homologation.get_request_current_state_id($1) as state_id;', [requestId]);

        if (result.error) {
            throw result.error;
        }

        if (result.data[0].state_id !== stateId) {
            throw new VError(429, 'Cliente contém dados desatualizados. Deve refrescar a página de modo obter a versão mais recente dos dados do processo.')
        }

        /**
        * Sanity check to avoid advancing state safelly
        */
        result = await db.query('select code from homologation.states where id = $1;', [stateId]);

        if (result.error) {
            throw result.error;
        }

        // Previous state code
        previousStateCode = result.data[0].code;

        console.log("> From state: ", result.data);

        // Check if the groupId can act over this state change
        result = await db.query('select intervening from homologation.state_types where code = $1;', [previousStateCode]);

        if (result.error) {
            throw result.error;
        }

        // If state is an end state
        if (result.data[0].intervening === null) {
            throw new VError(429, 'Não é possível atuar sobre o estado atual');
        }

        // If intervening must be an evaluator and group is not, return error
        if (result.data[0].intervening === true && userGroup !== 4) {
            throw new VError(429, 'Utilizador não tem permissões para atuar sobre o estado atual');
        }

        // If intervening must be an applicant and group is not, return error
        if (result.data[0].intervening === false && userGroup !== 2) {
            throw new VError(429, 'Utilizador não tem permissões para atuar sobre o estado atual');
        }

        result = await db.query('select name, applicant_id from homologation.requests where id = $1', [requestId]);

        if (result.error) {
            throw result.error;
        }


        const applicantIdRes = result.data[0];

        const applicantId = applicantIdRes.applicant_id;
        const requestName = applicantIdRes.name;

        result = await db.query('select name, email from webapp.users where id = $1', [applicantId]);

        if (result.error) {
            throw result.error;
        }

        const userRes = result.data[0];

        const { name, email } = userRes;

        const advance = params.advance;
        const observations = params.observations;

        result = await db.query('update homologation.states set intervening_id = ' + userId + ', observations = \'' + observations + '\' where id = ' + stateId, [], { userId: params.userId });

        if (result.error) {
            throw result.error;
        }

        const preopRes = await executePreStateOperations(db, {
            ...params
        });

        if (preopRes.error) {
            throw preopRes.error;
        }

        const sql = "insert into homologation.states(code, request_id) values(homologation.predict_next_state($1, $2),$1) returning id, code, start_date;";

        result = await db.query(sql, [requestId, advance], { userId: params.userId });

        if (result.error) {
            throw result.error;
        }

        const data = result.data[0];

        const opRes = await executeStateOperations(db, {
            ...params,
            code: data.code,
            stateId: data.id,
            previousStateCode: previousStateCode
        });

        if (opRes.error) {
            throw opRes.error;
        }

        /**
         * Get state description
         */
        const stateRes = await db.query('select applicant_description as description, deadline, intervening from homologation.state_types where code = $1', [data.code]);

        if (stateRes.error) {
            throw stateRes.error;
        }

        const stateData = stateRes.data[0];

        const stateCode = data.code;
        const stateStart = new Date(data.start_date);
        const stateStartStr = stateStart.toISOString().split('T')[0];
        const stateDescription = stateData.description;
        const intervening = stateData.intervening; // TODO: enviar emails para avaliadores
        const deadline = stateData.deadline; // TODO: enviar emails para avaliadores

        const host = baseUrl;

        const content = stateCode < 56 ?
            {
                must_intervene: intervening !== null && !intervening ? 'Sim' : 'Não',
                start_date: stateStartStr,
                deadline: deadline ? deadline : 'Sem deadline',
                token: requestId,
                state: stateDescription,
                name: name,
                site: host,
                request_id: requestId,
                request_name: requestName
            } :
            {
                start_date: stateStartStr,
                token: requestId,
                state: stateDescription,
                name: name,
                site: host,
                request_id: requestId,
                request_name: requestName
            };

        emails.send({
            userId: applicantId,
            template: 'homologation-advance-' + stateCode,
            email: email,
            subject: 'Registo por Comunicação Prévia: Transição de Estado',
            content: content
        });


        await db.commit();

        await db.release();

        return result;
    } catch (e) {
        if (db) {
            await db.rollback();

            await db.release();
        }

        return { error: e }
    }
}

export default async function (req, res, next) {
    console.log("> State: advance");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            advance: body.advance,
            stateId: body.stateId,
            observations: body.observations ? body.observations : ''
        };

        console.log("> params: ", params)

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            // console.log("> Err: ", result.error)
            // res.send({ error: 'Error..' });

            throw result.error;
        }

        res.send(result);

    } catch (e) {
        next(e);
    }
}