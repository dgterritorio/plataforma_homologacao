const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;

        const receiptId = params.receiptId,
            accepted = params.accepted,

            userId = params.userId,
            userGroup = params.userGroup;


        if (userGroup === 2) {

            result = await db.query('select request_id from homologation.payments where id = $1', [receiptId]);

            if (result.error) {
                await db.rollback();

                await db.release();

                throw result.error;
            }

            const receipt = result.data[0];

            const requestId = receipt.request_id;

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

        const acceptedStateText = accepted ? "homologation.get_request_current_state_id(request_id)" : "null";

        result = await db.query("update homologation.payments set applicant_accepted = " + accepted + ", acceptance_state_id = " + acceptedStateText + " where id = " + receiptId, [], { userId: params.userId });

        if (result.error) {
            await db.rollback();

            await db.release();

            return result.error;
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
            receiptId: body.receiptId,
            accepted: body.accepted
        };

        console.log(params);

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}