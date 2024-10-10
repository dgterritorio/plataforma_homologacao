const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {

    let result;

    if (params.userGroup === 2) {
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [params.userId, params.requestId])

        if (result.error) {
            return { error: 'Erro ao obter cartografia' };
        }

        if (result.data && !result.data.length) {
            return { error: 'Permissão negada' }
        }
    }

    let sql = "select * from homologation.";

    if (params.vectorial) {
        sql += "request_vectorial ";
    } else {
        sql += "request_image ";
    }

    sql += "where request_id = " + params.requestId + ";";

    result = await db.query(sql);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get document");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            vectorial: body.vectorial,
            requestId: body.requestId,
            userId: user.id,
            userGroup: user.group
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}