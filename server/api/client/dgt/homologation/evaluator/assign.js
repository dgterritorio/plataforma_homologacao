const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const requestId = params.requestId,
        evaluatorId = params.evaluatorId,
        userId = params.userId,
        userGroup = params.userGroup;

    let db, result;

    try {
        db = await aquireTransaction();

        await db.begin();

        result = await db.query("insert into homologation.evaluation_owners(user_id, request_id) values($1, $2)", [evaluatorId, requestId], { userId: userId });

        await db.commit();

        await db.release();
    } catch (e) {
        if (db) {
            db.roolback();

            db.release();
        }

        throw e;
    }

    return result;
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
            evaluatorId: body.evaluatorId
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