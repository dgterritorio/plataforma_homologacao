const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;

        result = await db.query("update producers.documents set invalid = " + params.invalid + " where id = " + params.documentId, [], { userId: params.userId });

        if (result.error) {
            db.rollback();

            db.release();

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
    console.log("> Document: Get missing documents");

    try {
        const body = req.body;
        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            documentId: body.documentId,
            invalid: body.invalid
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