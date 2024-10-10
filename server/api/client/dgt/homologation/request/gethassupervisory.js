const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const requestId = params.requestId;

    try {
        // type = 14 -> Relatorio Entidade Fiscalizadora
        let result = await db.query("select (count(*) = 1) as has_supervisory from homologation.documents where request_id = $1 and type = 14", [requestId]);

        if (result.error) {
            return result.error;
        }

        return result;
    } catch (e) {
        return { error: e }
    }
}

export default async function (req, res, next) {
    console.log("> Request: Get Request Has Supervisory Report");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            requestId: body.requestId,
            userId: user.id,
            userGroup: user.group
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}