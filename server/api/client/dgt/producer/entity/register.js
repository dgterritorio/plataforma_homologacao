import VError from '../../../../../modules/errors/verror';

const { aquireTransaction } = require(__basedir + 'modules/db/base');
const crypto = require('crypto');
const emails = require(__basedir + 'modules/emails/main');
const { parseData } = require(__basedir + 'modules/requestUtils');
const { Uploads } = require(__basedir + 'modules/upload/main')
const uploadAux = require('../aux/producer-uploads');

const baseUrl = global.App.url;
const multerFields = Object.freeze([{ name: 'form', maxCount: 1 }, { name: 'doc1', maxCount: 1 }, { name: 'doc2', maxCount: 1 }, { name: 'doc3', maxCount: 1 }, { name: 'doc4', maxCount: 1 }]);

let uploads;

const schema = 'producers'

const model = Object.freeze(
    {
        user: [
            'name',
            'email',
            'group_id',
            'password',
            'vat',
            'address',
            'locality',
            'zipcode',
            'phone',
            'active',
            'confirmed'
        ],

        entity: [
            "name",
            "email",
            "is_collective",
            "is_comercial",
            "vat",
            "address",

            "locality",
            "county",
            "zipcode",
            "phone",
            "cae",
            "cpr_code",
            "carto_vectorial",
            "carto_imagery",
            "carto_aerial",
            "login_hash",
            // "password",
            "observations",
            "url",
            "user_id"
        ],

        documents: [
            "type", "file", "original_name", "signed", "signer_name", "entity_id"
        ],

        activity: [
            "activity_code", "entity_id"
        ],

        staff: [
            "type", "name", "skills", "entity_id"
        ],

        equipment: [
            "name", "entity_id"
        ]
    }
);

const sqls = Object.freeze({
    insertUser: `insert into webapp.users(${model.user.toString()}) values(${model.user.map((k, i) => '$' + (i + 1)).toString()}) returning id`,
    insertEntity: `insert into ${schema}.entities(${model.entity.toString()}) values(${model.entity.map((k, i) => '$' + (i + 1)).toString()}) returning id`,
    insertDocument: `insert into ${schema}.documents(${model.documents.toString()}) values(${model.documents.map((k, i) => '$' + (i + 1)).toString()})`,
    insertActivity: `insert into ${schema}.activities(${model.activity.toString()}) values(${model.activity.map((k, i) => '$' + (i + 1)).toString()})`,
    insertStaff: `insert into ${schema}.staff(${model.staff.toString()}) values(${model.staff.map((k, i) => '$' + (i + 1)).toString()})`,
    insertEquipment: `insert into ${schema}.equipments(${model.equipment.toString()}) values(${model.equipment.map((k, i) => '$' + (i + 1)).toString()})`
});


// Initialize the upload folders
initialize();

function initialize() {
    const base = uploadAux.genBaseFolder();//global.App.serverConfig.fileUploadFolder + 'producers';

    uploads = new Uploads(base, multerFields);

    uploads.initialize();
}

async function insertUser(db, user) {
    const keys = model.user;

    const values = keys.map(k => user[k]);

    return await db.query(sqls.insertUser, values);
}

async function insertEntity(db, entity, logging) {
    const keys = model.entity;

    const values = keys.map(k => entity[k]);

    return await db.query(sqls.insertEntity, values, logging);
}

async function insertDocuments(db, documents, logging) {

    const keys = model.documents;

    let result;

    for (let i = 0; i < documents.length; i++) {
        const document = documents[i];

        const values = keys.map(k => document[k]);

        result = await db.query(sqls.insertDocument, values, logging);

        if (result.error) {

            result = { error: 'Error inserting documents' };
            break;
        }
    }

    return result;
}

async function insertStaff(db, staff, logging) {
    if (!staff.length) {
        return {};
    }

    const keys = model.staff;

    let result;

    for (let i = 0; i < staff.length; i++) {
        const member = staff[i];

        const values = keys.map(k => member[k]);

        result = await db.query(sqls.insertStaff, values, logging);

        if (result.error) {

            result = { error: 'Error inserting staff' };
            break;
        }
    }

    return result;
}

async function insertActivities(db, activities, logging) {
    if (!activities.length) {
        return {};
    }

    const keys = model.activity;

    let result;

    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];

        const values = keys.map(k => activity[k]);

        result = await db.query(sqls.insertActivity, values, logging);

        if (result.error) {

            result = { error: 'Error inserting activity' };
            break;
        }
    }

    return result;
}


async function insertEquipments(db, equipments, logging) {
    if (!equipments.length) {
        return {};
    }

    const keys = model.equipment;

    let result;

    for (let i = 0; i < equipments.length; i++) {
        const equipment = equipments[i];

        const values = keys.map(k => equipment[k]);

        result = await db.query(sqls.insertEquipment, values, logging);

        if (result.error) {
            result = { error: 'Error inserting equipment' };
            break;
        }
    }

    return result;
}

async function deleteOldRegistration(db, entityId) {
    let res;

    res = await db.query('delete from producers.activities where entity_id = $1', [entityId]);

    if (res.error) { throw res.error; }

    res = await db.query('delete from producers.equipments where entity_id = $1', [entityId]);

    if (res.error) { throw res.error; }

    res = await db.query('delete from producers.staff      where entity_id = $1', [entityId]);

    if (res.error) { throw res.error; }

    res = await db.query('delete from producers.documents  where entity_id = $1', [entityId]);

    if (res.error) { throw res.error; }

    res = await db.query('delete from producers.states     where entity_id = $1', [entityId]);

    if (res.error) { throw res.error; }

    res = await db.query('delete from producers.entities   where id = $1 returning id', [entityId]);

    if (res.error) { throw res.error; }

    if (res.data.length !== 1) {
        throw new VError(421, "Ocorreu um erro ao processar o pedido");
    }
}

/**
 * Returns true if we allow rewrite the request
 * @param {*} db 
 * @param {*} user 
 * @param {*} params 
 * @returns 
 */
async function processUserExists(db, user, params) {
    const inputPassword = params.password;

    const { id, password, active } = user;

    // console.log("Passowrd check: ", id, active, password, inputPassword, password === inputPassword)

    // If the password is the same, we delete the old registration
    if (
        active &&
        password && inputPassword &&
        typeof password === 'string' && typeof inputPassword === 'string' &&
        password.length > 0 && inputPassword.length > 0 &&
        password === inputPassword) {

        console.log("Password check: true");

        const res = await db.query("SELECT id, code FROM producers.entity_states WHERE user_id = $1", [id]);

        if (res.error) {
            throw res.error;
        }

        console.log("How many registrations: ", res.data.length);

        // If we get more than one registration, some went wrong...
        if (res.data.length !== 1) {
            throw new VError(421, "Ocorreu um erro a processar o pedido");
        }

        const oldRegistration = res.data[0];

        console.log("Old request code < 3 || === 101: ", oldRegistration.code < 3 || oldRegistration.code === 101);

        // Check the state of the registration
        // state < than official
        if (oldRegistration.code < 3 || oldRegistration.code === 101) {
            console.log("Permission accepted.. rewriting old registration...");

            await deleteOldRegistration(db, oldRegistration.id)
        } else {
            console.log("Permission denied to rewrite registration. Code >= 3")

            return false;
        }

        return true;
    } else {
        return false;
    }
}

/**
 * Returns inserted user id
 * @param {*} db 
 * @param {*} entityUser 
 * @returns 
 */
async function processUserCreate(db, entityUser) {
    /**
     * Insert entity
     */
    const res = await insertUser(db, entityUser);

    if (res.error) {
        throw new VError(421, 'Error inserting user');
    }

    const user = res.data[0];

    return user.id;
}

async function processRequest(params, files) {
    console.log("> Begin processing request");

    let db;

    try {
        let entityUser,
            entity,
            form = files.form,
            equipments = [],
            staff = [],
            activities = [],
            documents = [],
            signatures = [];

        // If for any reason the registration form didnt arrive, refuse request
        if (!form || !form.length) {
            return { error: "Missing registration form" };
        }

        entityUser = parseData(params, model.user);

        // Set default data for entity
        entityUser.active = true;
        entityUser.confirmed = true;
        entityUser.group_id = 5; // Producer Group ID

        // Fetch fields for entity
        entity = parseData(params, model.entity);

        entity.login_hash = crypto.randomBytes(20).toString('hex');

        /**
         * Equipments/Staff/Activity
         */
        const equipmentArr = params.equipment ? JSON.parse(params.equipment) : [];
        const staffArr = params.staff ? JSON.parse(params.staff) : [];
        const activityArr = params.activity ? JSON.parse(params.activity) : [];


        // Aquire Transation object
        db = await aquireTransaction();

        if (!db) {
            throw { error: VError(409, 'Servidor ocupado. Por favor tente mais tarde') };
        }

        await db.begin();

        /**
         * Check if email exists
         */
        const emailExists = await db.query("SELECT id, active, password FROM webapp.users WHERE email = $1", [params.email]);

        if (emailExists.error) {
            throw emailExists.error;
        }

        // Check the email already exists
        if (emailExists.data.length) {
            console.log("Email is in use...");

            const oldUser = emailExists.data[0];

            const allowRewrite = await processUserExists(db, oldUser, params);

            if (!allowRewrite) {
                const userExistsMsg = oldUser.active ?
                    'O email ' + params.email + ' já se encontra em uso' :
                    'O email ' + params.email + ' está associado a uma conta desativada. Por favor contacte a administração para a reativação.';

                throw new VError(409, userExistsMsg);
            }

            // Set the entity user = old user id
            entity.user_id = oldUser.id;

            // else, insert the user
        } else {
            console.log("Creating new user...");

            entity.user_id = await processUserCreate(db, entityUser);
        }

        let res;

        /**
         * Insert entity
         */
        res = await insertEntity(db, entity, { userId: entity.user_id });

        if (res.error) {
            return { error: 'Error inserting entity' };
        }

        const rowsInserted = res.data;

        entity.id = rowsInserted[0].id;

        /**
         * Insert Activities
         */
        activityArr.forEach(function (activity) {
            activities.push(parseData({ activity_code: activity, entity_id: entity.id }, model.activity));
        });

        res = await insertActivities(db, activities, { userId: entity.user_id });

        if (res.error) {
            return { error: 'Error inserting activities' };
        }

        /**
         * Insert Equipments
         */
        equipmentArr.forEach(function (equip) {
            equip.entity_id = entity.id;
            equipments.push(parseData(equip, model.equipment));
        });

        res = await insertEquipments(db, equipments, { userId: entity.user_id });

        if (res.error) {
            return { error: 'Error inserting equipments' };
        }

        /**
         * Insert Staff
         */
        staffArr.forEach(function (member) {
            member.entity_id = entity.id;
            staff.push(parseData(member, model.staff));
        });


        res = await insertStaff(db, staff, { userId: entity.user_id });

        if (res.error) {
            return { error: 'Error inserting staff' };
        }

        /**
         * Insert/Save files uploaded
         */
        const uploadFolder = uploadAux.genUploadFolder(entity.id);

        let uploadInfo = uploads.savePdfs(files, uploadFolder, true);

        documents = uploadInfo.map(function (details) {
            const fileType = details.type;
            let type = null;

            switch (fileType) {
                case 'form':
                    type = 0;
                    break;
                case 'doc1':
                    type = 1;
                    break;
                case 'doc2':
                    type = 2;
                    break;
                case 'doc3':
                    type = 3;
                    break;
                case 'doc4':
                    type = 4;
                    break;
            }

            if (details.signed) {
                signatures.push(details.sigName);
            }

            return {
                type: type,
                original_name: details.name,
                file: details.path,
                signer_name: details.sigName,
                signed: details.signed,
                entity_id: entity.id
            }
        });

        res = await insertDocuments(db, documents, { userId: entity.user_id });

        if (res.error) {
            return { error: 'Error inserting document' };
        }

        /**
         * Send Email
         */
        console.log("> Sending email");

        const host = baseUrl;

        const content = {
            token: entity.login_hash,
            name: entity.name,
            site: host
        };

        await db.commit();

        await db.release();

        emails.send({
            userId: entity.user_id,
            template: 'producer-register',
            email: entity.email,
            subject: 'Registo por Comunicação Prévia',
            content: content
        });

        return {
            data: signatures,
            error: ''
        };

    } catch (error) {
        if (db) {
            await db.rollback();

            await db.release();
        }

        return { error: error };
    }
}

export default async function (req, res, next) {
    console.log("> Register Producer");

    let result,
        error;

    // Parse multipart-form
    try {
        error = await uploads.parseUpload(req, res);

        if (error) {
            throw error;
        }

        const params = req.body;

        /**
         * Convert booleans and nulls from strings (formData)
         */
        const keys = Object.keys(params);

        keys.forEach(function (key) {
            const value = params[key];

            switch (value) {
                case 'null':
                    params[key] = null;
                    break;
                case 'true':
                    params[key] = true;
                    break;
                case 'false':
                    params[key] = false;
                    break;
                default:
                    break;
            }
        });

        // TODO: Solving a bug here. Remove later
        if (params['carto_vectorial'] === null) params['carto_vectorial'] = false;
        if (params['carto_imagery'] === null) params['carto_imagery'] = false;
        if (params['carto_aerial'] === null) params['carto_aerial'] = false;

        // Process request
        if (req.hasOwnProperty('files')) {
            result = await processRequest(params, req.files);
        }

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}