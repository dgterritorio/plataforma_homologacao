import { emit } from "nodemon";

const db = require(__basedir + 'modules/db/base');

const allowedProfiles = Object.freeze([4, 5]);

async function getRequestInfo(params) {
    if (!allowedProfiles.includes(params.userGroup)) {
        return { error: 'Permission denied' };
    }

    let result;

    // If anonymous
    if (params.userGroup === 5) {
        result = await db.query('select * from producers.entities where user_id = $1 and id = $2', [params.userId, params.requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { error: 'Permission denied' };
        }
    }

    let sql = "select * from producers.equipments where entity_id = $1;";

    result = await db.query(sql, [params.requestId]);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get equipment");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            requestId: body.requestId,
            userId: user.id,
            userGroup: user.group,
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