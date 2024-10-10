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

    let sql = "select homologation.predict_next_state($1, $2)";

    result = await db.query(sql, [params.requestId, params.advance]);

    return result;
}

export default async function (req, res, next) {
    console.log("> State: Get all");

    try {
        const body = req.body;

        const user = res.locals.user;
        const userGID = user.group;

        const params = {
            requestId: body.requestId,
            advance: body.advance,
            userId: user.id,
            userGroup: user.group
        }

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}