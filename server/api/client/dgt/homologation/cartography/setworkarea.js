const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;

        const table = params.vectorial ? 'vectorial_carto' : 'imagery_carto';

        result = await db.query("update homologation." + table + " set work_area_recovered = " + params.recovered + " where id = " + params.cartographyId, [], { userId: params.userId });

        if (result.error) {
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
    console.log("> Document: Update work area recovered");

    try {
        const body = req.body;
        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            cartographyId: body.cartographyId,
            recovered: body.recovered,
            vectorial: body.vectorial
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