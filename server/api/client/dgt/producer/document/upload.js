const { aquireTransaction } = require(__basedir + 'modules/db/base');
const uploadAux = require('../aux/producer-uploads');
const { Uploads } = require(__basedir + 'modules/upload/main')
const multerFields = Object.freeze([{ name: 'document', maxCount: 1 }]);
const { applyTextWatermark } = require(__basedir + 'modules/pdf/watermark');

const schema = 'producers'
let uploads;

const model = Object.freeze({
    documents: [
        "type", "file", "original_name", "signed", "signer_name", "entity_id", "state_id"
    ]
});

// Initialize the upload folders
initialize();

function initialize() {
    const base = uploadAux.genBaseFolder()//global.App.serverConfig.fileUploadFolder + 'producers';

    uploads = new Uploads(base, multerFields);

    uploads.initialize();
}

async function insertDocuments(db, id, documents, stateId, logging) {
    let keys = model.documents;

    let sql = `insert into ${schema}.documents`;
    sql += "(" + keys.toString() + ") values";

    documents.forEach(function (doc, idx) {
        const type = doc.type;
        const path = doc.path;
        const name = doc.name;
        const signed = !!doc.signature ? 'true' : 'false';
        const signer_name = !!doc.signature ? doc.signature : '';

        sql += "(" + type + ",'" + path + "','" + name + "'," + signed + ",'" + signer_name + "'," + id + "," + stateId + ")";

        if (idx + 1 < documents.length) {
            sql += ',';
        } else {
            sql += ' returning id;'
        }
    });

    let result = await db.query(sql, [], logging);

    return result;
}



async function getRequestInfo(params, files) {

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        const userGroup = params.userGroup;
        const requestId = params.requestId;

        let result;

        if (userGroup === 5) {
            // Check if we have permission for documents
            result = await db.query('select * from producers.entities where user_id = $1 and id = $2', [params.userId, params.requestId]);

            if (result.error) {
                db.rollback();

                db.release();

                throw result.error;
            }

            if (!result.data.length) {
                db.rollback();

                db.release();

                return { data: [], error: null, total: 0 };
            }
        }

        if (!files) {

            db.rollback();

            db.release();

            return { error: 'No file uploaded' };
        }

        const document = files.document;

        if (!document || !document.length) {
            db.rollback();

            db.release();

            return { error: "Missing form" };
        }

        // let file = files.document[0];

        const producerId = params.requestId;
        const producerStateId = params.stateId;
        const documentType = params.documentType;

        /**
         * Process File upload
         */

        const uploadFolder = uploadAux.genUploadFolder(producerId);

        const fileInfo = uploads.savePdfs(files, uploadFolder, true);

        const saved = fileInfo[0];

        const docInfo = {
            name: saved.name,
            path: saved.path,
            signature: saved.sigName ? saved.sigName : null,
            type: documentType
        };

        const watermarkPath = docInfo.path + '_wm';

        if (applyTextWatermark(docInfo.path, watermarkPath, `Proc. Nº ${producerId}`)) {
            docInfo.path = watermarkPath;

            console.log("Wrote watermark from : ", docInfo.path, watermarkPath, producerId);
        }

        result = insertDocuments(db, producerId, [docInfo], producerStateId, { userId: params.userId });

        if (result.error) {
            db.rollback();

            db.release();

            throw result.error;
        }

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
    console.log("> Request documents");

    let error;

    try {
        // error = await uploadMiddleware(req, res);
        error = await uploads.parseUpload(req, res);

        if (error) {
            throw error;
        }


        const params = req.body;
        const user = res.locals.user;
        // params.applicantId = req.session.userid;

        params.userGroup = user.group;
        params.userId = user.id;

        let result = await getRequestInfo(params, req.files);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}