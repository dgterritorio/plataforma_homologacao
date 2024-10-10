const db = require(__basedir + 'modules/db/base');
const fs = require('fs');

const allowedProfiles = Object.freeze([4, 5])

async function getRequestInfo(params) {

    if (!allowedProfiles.includes(params.userGroup)) {
        return { error: new VError(403, 'Permissão negada') };
    }

    let result;

    // If anonymous
    if (params.userGroup === 5) {
        result = await db.query('select * from producers.entities where user_id = $1 and id = $2', [params.userId, params.requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { error: new VError(403, 'Permissão negada') };
        }
    }

    return await db.query("select file, original_name from producers.documents where id = $1;", [params.docId]);
}

export default async function (req, res, next) {
    try {
        console.log("> Download document");

        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            docId: body.documentId,
            requestId: body.requestId,
        };

        let result = await getRequestInfo(params);

        if (result.error) {
            throw result.error;
        }

        const filePath = result.data[0].file;
        const name = result.data[0].original_name;

        const file = fs.readFileSync(filePath);

        const stat = fs.statSync(filePath);

        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'file.pdf')
        res.setHeader('Content-Type', 'application/pdf');
        res.send({ data: [{ stream: file.toString('base64'), name: name }], error: null, total: 1 });

    } catch (e) {
        next(new VError(409, 'Erro ao descarregar documento'));
    }
}