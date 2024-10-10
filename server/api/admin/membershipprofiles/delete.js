const db = require(__basedir + 'modules/db/base');
const redisManager = require(__basedir + 'modules/redis/manager')

async function deleteRows(table, data, key) {
    let params = [data.user_id, data.group_id, data.profile_id];

    let sql = `DELETE FROM ${table} WHERE user_id = $1 and group_id = $2 and profile_id = $3`;

    let result = await db.query({ text: sql, values: params });

    redisManager.deleteActiveSessions({
        user_id: data.user_id
    });

    return result;
};

export default async function (req, res, next) {
    console.log("> Request: Update Admin User Membership Profile");
    try {
        if (!req.session || !req.session.groupid || req.session.groupid !== 1 ) {
            throw(new VError(401, 'Unauthorized'));
        }

        const user = res.locals.user;
        
        const body = req.body;
        const data = body.data;

        const row = data && data.length ? data[0] : null;

        if(user.id === row.user_id){
            throw new VError(403, 'Proibida a modificação do próprio utilizador');
        }

        let result = await deleteRows(body.entity, row);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}
