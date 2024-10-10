const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const userId = params.userId;
    const requestId = params.requestId;
    const type = params.type;

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;

        // Get previous state
        result = await db.query('select get_request_current_state_id as previous_id from homologation.get_request_current_state_id($1);', [requestId])

        if (result.error) {
            throw result.error;
        }

        let data = result.data;

        const suspensionStateId = data[0].previous_id;

        // If suspensionStateId = null, error
        if (!suspensionStateId) {
            throw new VError(429, 'Operação negada. Não foi possível alterar o tipo de homologação.')
        }

        result = await db.query('select * from homologation.states where id = $1;', [suspensionStateId]);

        if (result.error) {
            throw result.error;
        }

        data = result.data;

        const suspensionState = data[0];

        // If suspensionState was a reverted state, inconsistency
        if (suspensionState.code !== 305) {
            throw new VError(429, 'Operação inconsistente.')
        }

        // Get suspended state
        result = await db.query('select * from homologation.states where id = homologation.get_request_previous_state_id($1);', [requestId])

        if (result.error) {
            throw result.error;
        }

        data = result.data;

        const revert_to = data[0].id;
        const revertToCode = data[0].code;

        // Get state info for suspended state
        result = await db.query('select * from homologation.state_types where code = $1;', [revertToCode])

        if (result.error) {
            throw result.error;
        }

        // Check if suspended state has a deadline
        const hasDeadline = !!result.data[0].deadline;

        // Update suspension state with dates and intervening and return its duration
        result = await db.query('update homologation.states set revert_to = $1, end_date = now(), deadline_date = now(), duration = webapp.count_business_days(start_date::date, now()::date)::integer where id = $2 returning duration', [revert_to, suspensionStateId], { userId: userId });

        if (result.error) {
            throw result.error;
        }

        const suspendDuration = result.data[0].duration;

        // If the suspended state has a deadline,
        if (hasDeadline && suspendDuration > 0) {
            // then we increment the deadline date
            result = await db.query('update homologation.states set deadline_date = webapp.add_business_days(deadline_date::date, $1) where id = $2', [suspendDuration, revert_to], { userId: userId });

            if (result.error) {
                throw result.error;
            }
        }

        await db.commit();

        await db.release();

        return { data: [{ code: revert_to }], total: 1, error: null };
    } catch (e) {
        if (db) {
            await db.rollback();

            await db.release();
        }

        return { error: e }
    }
}

export default async function (req, res, next) {
    console.log("> State: revert");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            type: body.type
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            // console.log("> Err: ", result.error)
            // res.send({ error: 'Error..' });

            throw result.error;
        }

        res.send(result);

    } catch (e) {
        next(e);
    }
}