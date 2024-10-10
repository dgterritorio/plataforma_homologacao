const db = require(__basedir + 'modules/db/base');
const redis = require("redis");
const redisClient = redis.createClient();

// Searchs for session_id and delete keys from rows
async function deleteSessionKeys(rows) {
    for (let i = 0; i < rows.length; i++) {
        const { session_id } = rows[i];

        redisClient.del(`sess:${session_id}`);
    }
}

async function updateRow(table, data, cond, ignore, returning) {
    let sets = [];
    let params = [];

    Object.keys(data).forEach(k => {
        if (ignore.indexOf(k) == -1 && typeof data[k] !== 'undefined') {
            params.push(data[k]);
            sets.push('"' + k + '"=$' + params.length);
        }
    });

    let sql = 'UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE '
        + cond + ' ' + returning + ';';

    console.log(sql);
    let result = await db.query({ text: sql, values: params });

    return result;
};

export default async function (req, res, next) {
    console.log("> Request: Update Admin Sessions");
    try {
        if (!req.session || !req.session.groupid || req.session.groupid !== 1 ) {
            throw(new VError(401, 'Unauthorized'));
        }

        const body = req.body;
        let cond = body.key + '=' + body.data[body.key];
        let returning = "RETURNING *";

        console.log(body)

        const data = {}

        data[body.key] = body.data[body.key];
        data['ativo'] = false;
        data['logout'] = new Date();

        console.log(data)

        let result = await updateRow(body.entity, data, cond, [body.key, 'password'], returning);

        if (!result || result.error) {
            throw result.error;
        }

        const rows = result.data;

        // Access redis and delete keys
        await deleteSessionKeys(rows);

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}
