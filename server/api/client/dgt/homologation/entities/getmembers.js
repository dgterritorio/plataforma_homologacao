const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    let result;

    if (params.userGroup === 2) {
        // Check if we have permission for state transition
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [params.userId, params.requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { data: [], error: null, total: 0 };
        }
    }
    
    let sql = "select * from homologation.entity_members where request_id = " + params.requestId + ";";

    result = await db.query(sql);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get entities members");
    try {
        const body = req.body;
        const user = res.locals.user;

        const params = {
            requestId: body.id,
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