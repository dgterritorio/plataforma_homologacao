const db = require(__basedir + 'modules/db/base');
const fs = require('fs');

async function getRequestInfo(params) {

    let result;

    result = await db.query("select type, file, original_name, request_id from homologation.documents where id = $1;", [params.docId]);

    if (result.error) {
        throw result.error;
    }

    const document = result.data[0];
    const requestId = document.request_id;
    const type = document.type;
    const userId = params.userId;
    const userGroup = params.userGroup;

    if (userGroup === 2) {
        // Check if we have permission for documents
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { error: new VError(403, 'Permissão negada') };
        }
    }

    result = await db.query("select mime_type from homologation.document_types where code = $1;", [type]);

    if (result.error) {
        throw result.error;
    }

    const mimeType = result.data[0].mime_type;

    document.mime_type = mimeType;

    return { data: [document], error: null, total: 1 };
}

export default async function (req, res, next) {
    try {
        console.log("> Download document");

        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            docId: body.documentId
        };

        let result = await getRequestInfo(params);

        if (result.error) {
            throw result.error;
        }

        const document = result.data[0];

        const filePath = document.file;
        const name = document.original_name;
        const mimeType = document.mime_type;

        const file = fs.readFileSync(filePath);

        // const stat = fs.statSync(filePath);

        // res.setHeader('Content-Length', stat.size);
        // res.setHeader('Content-Disposition', 'attachment; filename=' + name)
        // res.setHeader('Content-Type', mimeType);

        // const stream = fs.createReadStream(filePath);
        // stream.pipe(res);

        res.send({ data: [{ stream: file.toString('base64'), name: name, mime: mimeType }], error: null, total: 1 });
    } catch (e) {
        next(new VError(409, 'Erro ao descarregar documento'));
    }
}