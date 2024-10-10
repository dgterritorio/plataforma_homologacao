const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const requestId = params.requestId,
        stateId = params.stateId,
        userId = params.userId,
        userGroup = params.userGroup;

    let result;

    if (userGroup === 2) {
        // Check if we have permission for state transition
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { data: [], error: null, total: 0 };
        }
    }

    const sql = !!stateId ?
        "select * from homologation.request_payments where request_id = $1 and (creation_state_id = $2 or paid_state_id = $2 or emitted_state_id = $2 or acceptance_state_id = $2) order by creation_date asc" :
        "select * from homologation.request_payments where request_id = $1 order by creation_date asc";

    const values = !!stateId ?
        [requestId, stateId] :
        [requestId];

    console.log(sql, values)

    return await db.query(sql, values);
}

export default async function (req, res, next) {
    console.log("> Request: get receipt");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            stateId: body.stateId
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