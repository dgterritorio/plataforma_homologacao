const { aquireTransaction } = require(__basedir + 'modules/db/base');
const { unshareFolder } = require(__basedir + 'modules/nextcloud/main');

//TODO: Invalidate Cartography + documents?
async function invalidateDocuments(db, params, stateId) {
    // Get current state
    return db.query('update homologation.documents set invalid = true where state_id = $1;', [stateId]);
}

async function invalidateCartography(db, params, stateId) {
    let result;
    let sql;

    const requestId = params.requestId;

    result = await db.query('select vectorial from homologation.requests where id = $1', [requestId]);

    if (result.error || !result.data.length) {
        return result.error;
    }

    const vectorial = result.data[0].vectorial;

    sql = 'select upload_link_id from homologation.' + (vectorial ? 'request_vectorial' : 'request_image') + ' where request_id = $1';

    result = await db.query(sql, [requestId])

    if (result.error || !result.data.length) {
        return result.error;
    }

    const cartography = result.data[0];

    const uploadLinkId = cartography.upload_link_id;

    // TODO: Não devia de chegar aqui a null, com exceção do estado 8 -> 50
    if (uploadLinkId === undefined || uploadLinkId === null) {
        console.log("  Nextcloud link was null");

        return { error: null };
    }

    const error = await unshareFolder(uploadLinkId);

    // if (error) {
    //     throw error;
    // }

    sql = 'update homologation.' + (vectorial ? 'vectorial_carto' : 'imagery_carto');
    sql += ' set upload_link_id = null, upload_link = null, upload_password = null, invalid = true where state_id = ' + stateId;

    result = await db.query(sql, [], { userId: params.userId });

    return result;
}


async function postProcessState(db, params, stateId) {

    let result;

    result = await invalidateDocuments(db, params, stateId);

    if (result.error) {
        return result;
    }

    result = await invalidateCartography(db, params, stateId);

    if (result.error) {
        return result;
    }

    return result;
}


async function getRequestInfo(params) {
    const userId = params.userId;
    const requestId = params.requestId;

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;

        // Get current state
        result = await db.query('select * from homologation.states where id = homologation.get_request_current_state_id($1);', [requestId]);

        if (result.error) {
            throw result.error;
        }

        const currentStateId = result.data[0].id;

        // console.log(result.data)

        // // Check who intervenes
        // result = await db.query('select intervening from homologation.state_types where code = $1;', [currentState]);

        // if (result.error) {
        //     throw result.error;
        // }
        // console.log(result.data)

        // const interveningIsEvaluator = result.data[0].intervening;

        // // If is not evaluator, then deny
        // if (!interveningIsEvaluator) {
        //     throw new VError(429, 'Operação negada. Não foi possível reverter o estado atual.')
        // }

        // Get previous state
        result = await db.query('select get_request_previous_state_id as previous_id from homologation.get_request_previous_state_id($1);', [requestId])

        if (result.error) {
            throw result.error;
        }

        let data = result.data;

        const previous_id = data[0].previous_id;

        // If previous_state = null, error
        if (!previous_id) {
            throw new VError(429, 'Operação negada. Não foi possível encontrar o estado anterior.')
        }

        result = await db.query('select * from homologation.states where id = $1;', [previous_id]);

        if (result.error) {
            throw result.error;
        }

        data = result.data;

        const previous_state = data[0];

        // If previous_state was a reverted state, inconsistency
        if (previous_state.code === 300) {
            throw new VError(429, 'Operação inconsistente.')
        }

        result = await db.query('select * from homologation.state_types where code = $1;', [previous_state.code]);

        if (result.error) {
            throw result.error;
        }

        const stateInfo = result.data[0];

        if (!stateInfo.intervening) {
            throw new VError(429, 'Operação negada. Não é possível reverter para um estado que não pertence ao mesmo grupo de utilizadores.');
        }

        // TODO: Observações de revert?
        const observations = '';

        // Update last state
        result = await db.query('update homologation.states set end_date = now(), duration = webapp.count_business_days(start_date::date, now()::date)::integer, observations = $2 where id = $1', [currentStateId, observations], { userId: userId });

        if (result.error) {
            throw result.error;
        }

        // Update last state
        result = await db.query('update homologation.states set end_date = NULL where id = $1', [previous_id], { userId: userId });

        if (result.error) {
            throw result.error;
        }

        // Insert reverted state
        result = await db.query('insert into homologation.states(code, request_id, revert_to, intervening_id, end_date, deadline_date, observations) values($1, $2, $3, $4, now(), now(), \'\') returning code', [300, requestId, previous_id, userId], { userId: userId });

        if (result.error) {
            await db.rollback();

            await db.release();

            throw result.error;
        }

        result = await postProcessState(db, params, currentStateId);

        if (result.error) {
            throw result.error;
        }

        await db.commit();

        await db.release();

        return { data: [{ id: previous_id }], total: 1, error: null };
    } catch (e) {
        if (db) {
            await db.rollback();

            await db.release();
        }

        return { error: e }
    }
}

export default async function (req, res, next) {
    console.log("> State: revert");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId
        };

        let result = { error: new VError(429, 'Funcionalidade não suportada.') }//await getRequestInfo(params);

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