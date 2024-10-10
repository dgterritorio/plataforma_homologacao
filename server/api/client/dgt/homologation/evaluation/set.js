const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        const
            stateId = params.stateId,
            evaluationType = params.evaluationType,
            endDate = params.endDate,
            userId = params.userId,
            userGroup = params.userGroup,
            accordingly = params.accordingly,
            percentageErrors = params.percentageErrors,
            percentageAccepted = params.percentageAccepted,
            budget = params.budget,
            observations = params.observations;

        let requestId = params.requestId;

        let result;
        let row = null;

        if (userGroup === 2) {
            // Check if we have permission for state transition
            result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

            if (result.error) {
                await db.rollback();

                await db.release();

                throw result.error;
            }

            if (!result.data.length) {
                await db.rollback();

                await db.release();
                
                return { data: [], error: null, total: 0 };
            }
        }


        result = await db.query("select * from homologation.evaluations where request_id = $1 and state_id = $2 and evaluation_type = $3", [requestId, stateId, evaluationType]);

        if (result.error) {
            await db.rollback();

            await db.release();

            throw result.error;
        }

        row = result.data.length ? result.data[0] : null;

        let sql;

        if (!row) {
            sql = "insert into homologation.evaluations(request_id, state_id, evaluation_type, end_date, accordingly, percentage_errors, percentage_accepted, budget, observations) values($1, $2, $3, $4, $5, $6, $7, $8, $9)"

            result = await db.query(sql, [requestId, stateId, evaluationType, endDate, accordingly, percentageErrors, percentageAccepted, budget, observations], { userId: params.userId });
        } else {
            sql = "update homologation.evaluations set modify_date = now(), end_date = " + endDate + ", accordingly = '" + accordingly + "', percentage_errors = " + percentageErrors + ", percentage_accepted = " + percentageAccepted + ", budget = " + budget + ", observations = '" + observations + "'";
            sql += " where state_id = " + stateId + " and request_id = " + requestId + " and evaluation_type = " + evaluationType;

            result = await db.query(sql, [], { userId: params.userId });
        }

        if (result.error) {
            await db.rollback();

            await db.release();

            throw result.error;
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
    console.log("> Request: get receipt");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            stateId: body.stateId,
            evaluationType: body.evaluationType,
            endDate: body.endDate ? "'" + body.endDate + "'" : null,
            percentageErrors: body.percentageErrors !== undefined ? body.percentageErrors : null,
            percentageAccepted: body.percentageAccepted !== undefined ? body.percentageAccepted : false,
            accordingly: body.accordingly,
            budget: body.budget,
            observations: body.observations ? body.observations : ''
        };

        console.log(params)

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}