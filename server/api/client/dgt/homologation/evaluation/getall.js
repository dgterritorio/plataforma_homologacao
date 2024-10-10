const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const requestId = params.requestId,
        stateId = params.stateId,
        userId = params.userId,
        userGroup = params.userGroup;

    let result;

    let head = 'select * ';

    if (userGroup === 2) {
        // Check if we have permission for state transition
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { data: [], error: null, total: 0 };
        }

        head = 'select evaluation_type, creation_date, modify_date, end_date, accordingly, percentage_errors, percentage_accepted, state_id, request_id '
    }

    const sql = !!stateId ?
        head + " from homologation.evaluations where request_id = $1 and state_id = $2 order by evaluation_type asc" :
        head + " from homologation.evaluations where request_id = $1 order by evaluation_type asc";

    const values = !!stateId ?
        [requestId, stateId] :
        [requestId]

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