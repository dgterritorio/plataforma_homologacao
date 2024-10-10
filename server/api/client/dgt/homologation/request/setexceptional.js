const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const requestId = params.requestId;
    const exceptional = params.exceptional;

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result = await db.query("update homologation.requests set exceptional_regime = " + exceptional + " where id = " + requestId, [], { userId: params.userId });


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
    console.log("> Request: Get Request");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            exceptional: body.exceptional,
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