const { v4 } = require('uuid');

const { aquireTransaction } = require(__basedir + 'modules/db/base');
const { parseData, parseDataArr } = require(__basedir + 'modules/requestUtils');
// const { Uploads } = require(__basedir + 'modules/upload/main')
const { createFolderHierarchy, shareFolder } = require(__basedir + 'modules/nextcloud/main')
const uploadAux = require('../aux/homologation-uploads');

const emails = require(__basedir + 'modules/emails/main')

const baseUrl = global.App.url;
// const multerFields = Object.freeze([{ name: 'form', maxCount: 1 }]);
// let uploads;

const schema = 'homologation'

const model = Object.freeze(
    {
        request: [
            "name",
            "county",
            "vectorial",
            "product_type",
            "has_themes",
            "purpose",

            // "cartography_type",

            "collective_name",
            "flight_date",
            "conclusion_date",
            "supervisory_date",
            "accepted_date",

            "observations",

            "applicant_id",
            "applicant_is_owner"
        ],

        // documents: [
        //     "type", "file", "original_name", "signed", "signer_name", "request_id"
        // ],

        vectorial_carto: [
            "upload_link_id",
            "upload_link",
            "upload_password",
            "upload_folder",

            "bbox",
            "area",

            "acquisition_type",
            "data_type",
            "data_specification",
            "data_specification_custom",
            "data_specification_version",
            "data_structure",
            "epsg",

            // "flight_date",
            // "conclusion_date",
            // "supervisory_date",
            // "accepted_date",

            "number_sheets",

            "planimetric_error",
            "planimetric_point_percent",
            "planimetric_deviation",

            "altimetric_error",
            "altimetric_point_percent",
            "altimetric_deviation",

            "semantic_completude",
            "semantic_classification",
            "max_semantic_incoherent",
            "max_semantic_duplicates",

            "max_discontinuity_number",
            "max_discontinuity_sheets",
            "pontual_elements",
            "linear_elements",

            "request_id"
        ],

        imagery_carto: [
            "upload_link_id",
            "upload_link",
            "upload_password",
            "upload_folder",

            "bbox",
            "area",

            "data_type",
            "data_specification",
            "data_specification_custom",
            "data_specification_version",
            "epsg",

            "spatial_resolution",
            "bands_number",
            "orto_resolution",

            "orto_radiometric",
            "orto_radiometric_resolution",
            "orto_number",
            "dimension_x",
            "dimension_y",

            "planimetric_error",
            "planimetric_point_percent",
            "planimetric_deviation",

            "is_digital_terrain",
            "is_digital_surface",

            "altimetric_model_error",

            "model_resolution",
            "model_band",

            "request_id"
        ],

        entities: [
            "supervisor",
            "producer_id",
            "request_id"
        ],

        entity_members: [
            "supervisor",
            "name",
            "professional_order",
            "certificate",
            "certificate_validaty",
            "producer_id",
            "request_id"
        ],

        owners: [
            "name",
            "email",
            "vat",
            "phone",
            "address",
            "locality",
            "zipcode",
            "request_id"
        ]
    }
);

const sqls = Object.freeze({
    insertRequest: `insert into ${schema}.requests(${model.request.toString()}) values(${model.request.map((k, i) => '$' + (i + 1)).toString()}) returning id`,
    // insertDocument: `insert into ${schema}.documents(${model.documents.toString()}) values(${model.documents.map((k, i) => '$' + (i + 1)).toString()})`,
    insertVectorial: `insert into ${schema}.vectorial_carto(${model.vectorial_carto.toString()}) values(${model.vectorial_carto.map((k, i) => '$' + (i + 1)).toString()})`,
    insertImage: `insert into ${schema}.imagery_carto(${model.imagery_carto.toString()}) values(${model.imagery_carto.map((k, i) => '$' + (i + 1)).toString()})`,
    insertEntities: `insert into ${schema}.entities(${model.entities.toString()}) values(${model.entities.map((k, i) => '$' + (i + 1)).toString()})`,
    insertEntityMembers: `insert into ${schema}.entity_members(${model.entity_members.toString()}) values(${model.entity_members.map((k, i) => '$' + (i + 1)).toString()})`,
    insertOwner: `insert into ${schema}.owners(${model.owners.toString()}) values(${model.owners.map((k, i) => '$' + (i + 1)).toString()})`,
    selectUser: 'select name, email from webapp.users where id = $1'
});

// Initialize the upload folders
// initializeFolder();

// function initializeFolder() {
//     // Create upload images folder
//     const base = uploadAux.genBaseFolder();//global.App.serverConfig.fileUploadFolder + 'homologacao';

//     uploads = new Uploads(base, multerFields);

//     uploads.initialize();
// }

/**
 * Queries
 * @param {*} request 
 */
async function insertRequest(db, userId, request) {
    const keys = model.request;

    const values = keys.map(k => request[k]);

    const result = await db.query(sqls.insertRequest, values, { userId: userId });

    return result;
}

async function insertCartographyInfo(db, userId, cartography, vectorial) {
    const keys = vectorial ? model.vectorial_carto : model.imagery_carto;

    const sql = vectorial ? sqls.insertVectorial : sqls.insertImage;

    const values = keys.map(k => cartography[k]);

    const result = await db.query(sql, values, { userId: userId });

    return result;
}

// async function insertDocument(db, userId, document) {
//     const keys = model.documents;

//     const values = keys.map(k => document[k]);

//     let result = await db.query(sqls.insertDocument, values, { userId: userId });

//     return result;
// }


async function insertEntities(db, userId, entities) {
    const keys = model.entities;

    let result;

    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];

        const values = keys.map(k => entity[k]);

        result = await db.query(sqls.insertEntities, values, { userId: userId });

        if (result.error) {

            result = { error: 'Error inserting entities' };
            break;
        }
    }

    return result;
}

async function insertEntityMembers(db, userId, members) {
    const keys = model.entity_members;

    let result;

    for (let i = 0; i < members.length; i++) {
        const member = members[i];

        const values = keys.map(k => member[k]);

        result = await db.query(sqls.insertEntityMembers, values, { userId: userId });

        if (result.error) {

            result = { error: 'Error inserting entity member' };
            break;
        }
    }

    return result;
}

async function insertOwners(db, userId, owner) {
    const keys = model.owners;

    let result;

    const values = keys.map(k => owner[k]);

    console.log(sqls.insertOwner, values, { userId: userId })

    result = await db.query(sqls.insertOwner, values, { userId: userId });

    console.log(result.error)
    if (result.error) {

        result = { error: 'Error inserting owner' };
    }

    return result;
}

async function getUserInfo(db, id) {
    let result = await db.query(sqls.selectUser, [id]);

    return result;
}

/**
 * Handle Request
 * @param {*} params 
 * @param {*} files 
 */
async function handleRequest(params) {//, files) {
    let db;

    try {
        let request,
            cartography,
            user = {
                id: null,
                name: null
            };
        // ,
        // signatures = [],
        // document = {};
        // ,
        // form = files.form;

        db = await aquireTransaction();

        await db.begin();

        // Parse user data
        user.id = params.applicant_id;

        // Parse data for the request object
        request = parseData(params, model.request);

        // Parse data for the cartography object
        if (request.vectorial) {
            cartography = parseData(params, model.vectorial_carto);
        } else {
            cartography = parseData(params, model.imagery_carto);
        }

        /**
         * Insert request
         */
        let res = await insertRequest(db, user.id, request);

        if (res.error) {
            await db.rollback();

            await db.release();

            console.log(res.error)

            return { error: 'Error inserting request' };
        }

        const rowsInserted = res.data;

        // Set the request ID
        request.id = rowsInserted[0].id;

        const producersStr = params.producers;
        let producers = [];

        if (producersStr) {
            producers = JSON.parse(producersStr);
        }

        const entities = parseDataArr(producers, model.entities);

        entities.forEach(e => e.request_id = request.id);

        res = await insertEntities(db, user.id, entities);

        if (res.error) {
            await db.rollback();

            await db.release();

            console.log(res.error)

            return { error: 'Error inserting entities' };
        }

        const membersStr = params.producerMembers;
        let members = [];

        if (membersStr) {
            members = JSON.parse(membersStr);
        }

        const entity_members = parseDataArr(members, model.entity_members);

        entity_members.forEach(e => e.request_id = request.id);

        res = await insertEntityMembers(db, user.id, entity_members);

        if (res.error) {
            await db.rollback();

            await db.release();

            console.log(res.error)

            return { error: 'Error inserting entity members' };
        }

        if (!params.applicant_is_owner) {
            // Parse data for the request object
            console.log("Begin parsing owner")
            const owner = parseData(params.owner, model.owners);

            console.log(owner)
            owner.request_id = request.id;

            /**
             * Insert owner
             */
            res = await insertOwners(db, user.id, owner);

            console.log(res)
            if (res.error) {
                await db.rollback();

                await db.release();

                console.log(res.error)

                return { error: 'Error inserting owner' };
            }
        }

        // Generate NextCloud folders and shares
        const applicantPassword = v4();

        const nextcloudFolder = uploadAux.genNextcloudFolder(user.id, request.id, 1);//'/homologacao/u' + user.id + '/r' + request.id + '/carto' + 1 + '/';

        // Next cloud create folder
        await createFolderHierarchy(nextcloudFolder);

        // Ask for shared link (applicant)
        const applicantSharedInfo = await shareFolder({ path: nextcloudFolder, password: applicantPassword, publicUpload: true });

        // Request shared link (evaluator)
        cartography = {
            ...cartography,
            upload_link_id: applicantSharedInfo.id,
            upload_link: applicantSharedInfo.url,
            upload_password: applicantPassword,
            upload_folder: nextcloudFolder,

            request_id: request.id
        }

        // Insert cartography
        res = await insertCartographyInfo(db, user.id, cartography, request.vectorial);

        if (res.error) {
            await db.rollback();

            await db.release();

            console.log(res.error);
            return { error: 'Error inserting cartography' };
        }

        /**
         * Process File upload
         */
        // let uploadFolder = uploadAux.genUploadFolder(user.id, request.id);

        // const fileInfo = uploads.savePdfs(files, uploadFolder, true);

        // const saved = fileInfo[0];

        // document = {
        //     original_name: saved.name,
        //     file: saved.path,
        //     signer_name: saved.sigName,
        //     signed: saved.signed,
        //     type: 0,
        //     request_id: request.id
        // }

        // if (saved.signed) {
        //     signatures.push(saved.sigName);
        // }

        // res = await insertDocument(db, user.id, document);

        // if (res.error) {
        //     await db.rollback();

        //     await db.release();

        //     return { error: 'Error inserting document' };
        // }

        res = await getUserInfo(db, user.id);

        if (res.error) {
            await db.rollback();

            await db.release();

            console.log(res.error)

            return { error: 'Error getting user info' };
        }

        const userInfo = res.data;

        user.name = userInfo[0].name;
        user.email = userInfo[0].email;

        /**
         * Process Emails
         */
        console.log("> Send email");

        const host = baseUrl;

        const content = {
            name: user.name,
            site: host,
            token: request.id,
            request_name: request.name,
            request_id: request.id
        };

        emails.send({
            userId: user.id,
            template: 'homologation-new',
            email: user.email,
            subject: 'Registration',
            lang: 'pt',
            content: content
        });

        // Notify DGT
        emails.sendUnregistered({
            template: 'homologation-evaluator-notification',
            email: global.App.from,
            subject: 'Novo Requerimento de Homologação',
            lang: 'pt',
            content: {
                site: host,
                token: content.token,
                request_name: content.request_name,
                request_id: content.request_id,
            }
        });

        await db.commit();

        await db.release();

        return {
            data: [{ id: request.id, email: user.email }],
            error: '',
            total: 1
        };

    } catch (e) {
        if (db) {
            await db.rollback();

            await db.release();
        }

        return { error: e.message };
    }
    // End.
}

export default async function (req, res, next) {
    console.log("> Homologation: new request");

    let result = {},
        error;

    try {
        const userInfo = res.locals.user;

        // Parse multipart-form
        // error = await uploads.parseUpload(req, res);

        // if (error) {
        //     throw error;
        // }

        const params = req.body;

        params.applicant_id = userInfo.id;

        // Process request
        // if (req.hasOwnProperty('files')) {
        result = await handleRequest(params);//, req.files);
        // }

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}