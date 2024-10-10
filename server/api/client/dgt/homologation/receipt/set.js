const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;

        const value = params.value,
            paidDate = params.paidDate,
            emittedDate = params.emittedDate,
            userId = params.userId,
            userGroup = params.userGroup;


        let receipt = null;
        let receiptId = params.receiptId;
        let requestId = params.requestId;

        if (!requestId && !receiptId) {
            throw new VError(423, 'Inconsistencia de dados.')
        }

        if (receiptId) {
            result = await db.query('select * from homologation.payments where id = $1', [receiptId]);
        } else {
            result = await db.query('select * from homologation.payments where request_id = $1', [requestId]);
        }

        if (result.error) {
            throw result.error;
        }

        receipt = result.data.length ? result.data[0] : null;

        if (!requestId && receipt) {
            requestId = receiptId.request_id;
        }

        if (userGroup === 2) {
            // Check if we have permission for state transition
            result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

            if (result.error) {
                throw result.error;
            }

            if (!result.data.length) {
                await db.rollback();

                await db.release();

                return { data: [], error: null, total: 0 };
            }
        }

        if (!receipt) {
            result = await db.query("insert into homologation.payments(request_id, creation_state_id, value, paid_date) values($1, homologation.get_request_current_state_id($1), $2, $3) returning id ", [requestId, value, paidDate], { userId: params.userId });
        } else {
            if (value) {
                result = await db.query("update homologation.payments set value = " + value + ", creation_state_id = homologation.get_request_current_state_id(" + requestId + ") where id = " + receiptId, [], { userId: params.userId });
            } else if (emittedDate) {
                result = await db.query("update homologation.payments set emitted_date = '" + emittedDate + "', emitted_state_id = homologation.get_request_current_state_id(request_id) where id = " + receiptId, [], { userId: params.userId });
            } else if (paidDate) {
                result = await db.query("update homologation.payments set paid_state_id = homologation.get_request_current_state_id(request_id), paidDate = now() where id = " + receiptId, [], { userId: params.userId });
            } else {
                result = { error: 'No parameters supplied' };
            }
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
            receiptId: body.receiptId,
            value: body.value,
            paidDate: body.paidDate ? body.paidDate : null,
            emittedDate: body.emittedDate ? body.emittedDate : null
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