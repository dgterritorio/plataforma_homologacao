const db = require(__basedir + 'modules/db/base');

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
    console.log("> Request: Update Admin User");
    try {
        if (!req.session || !req.session.groupid || req.session.groupid !== 1 ) {
            throw(new VError(401, 'Unauthorized'));
        }

        const body = req.body;
        if (!body.data || (body.data.avatar && body.data.avatar.startsWith('http'))) {
            throw(new VError(400, 'Bad Request'));
        }

        delete body.data['empresas'];

        let cond = body.key + '=' + body.data[body.key];
        let returning = "RETURNING id, name, group_id, email, active, confirmed, creation_date, mod_date, '' as password";

        let result = await updateRow(body.entity, body.data, cond, [body.key, 'password'], returning);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}
