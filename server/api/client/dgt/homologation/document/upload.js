const { aquireTransaction } = require(__basedir + 'modules/db/base');
const { Uploads } = require(__basedir + 'modules/upload/main');
const uploadAux = require('../aux/homologation-uploads');
const multerFields = Object.freeze([{ name: 'document', maxCount: 1 }]);
const { applyTextWatermark } = require(__basedir + 'modules/pdf/watermark');

const schema = 'homologation'

const model = Object.freeze({
    documents: [
        "type", "file", "original_name", "signed", "signer_name", "request_id", "state_id"
    ]
});

let uploads;


initializeFolder();

function initializeFolder() {
    // Create upload images folder
    const base = uploadAux.genBaseFolder();//global.App.serverConfig.fileUploadFolder + 'homologacao';

    uploads = new Uploads(base, multerFields);

    uploads.initialize();
}

async function insertDocuments(db, id, documents, stateId, userId) {
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
            sql += ' returning id, original_name, signed, signer_name, version;'
        }
    });

    let result = await db.query(sql, [], { userId: userId });

    return result;
}



async function getRequestInfo(params, files) {
    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

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

        let file = files.document[0];

        const homologationId = params.requestId;
        const homologationStateId = params.stateId;
        const applicantId = params.applicantId;
        const documentType = params.documentType;

        /**
         * Test mime types
         */
        const docResult = await db.query('select * from homologation.document_types where code = $1', [documentType]);

        if (docResult.error) {
            throw new VError(429, 'Erro ao obter tipo de ficheiro');
        }

        if (!docResult.data.length) {
            throw new VError(429, 'Não foi possível validar o tipo de ficheiro para o documento submetido.')
        }

        const mimeType = docResult.data[0].mime_type;

        const uploadedFiles = files.document;

        for (let i = 0; i < uploadedFiles.length; i++) {
            if (!uploads.validateMimeType(uploadedFiles[i], mimeType)) {
                throw new VError(429, 'Tipo de ficheiro inválido');
            }
        }

        /**
         * Process File upload
         */

        let uploadFolder = uploadAux.genUploadFolder(applicantId, homologationId);

        const fileInfo = uploads.savePdfs(files, uploadFolder, true);

        const saved = fileInfo[0];

        const docInfo = {
            name: saved.name,
            path: saved.path,
            signature: saved.sigName ? saved.sigName : null,
            type: documentType
        };

        const watermarkPath = docInfo.path + '_wm';

        if (mimeType === 'application/pdf' && applyTextWatermark(docInfo.path, watermarkPath, `Proc. Nº ${homologationId}`)) {
            docInfo.path = watermarkPath;

            console.log("Wrote watermark from : ", mimeType, docInfo.path, watermarkPath, homologationId);
        }

        let result = insertDocuments(db, homologationId, [docInfo], homologationStateId, params.userId);

        if (result.error) {
            db.rollback();
            db.release();

            return { error: result.error };
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

        const params = req.body;

        const user = res.locals.user;

        params.applicantId = req.session.userid;
        params.userId = user.id;
        params.userGroup = user.group;

        let result = await getRequestInfo(params, req.files);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}