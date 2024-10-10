const db = require(__basedir + 'modules/db/base');

async function deleteRows(table, data, key) {
    let ids = [];
    let params = [];

    data.forEach(dt => {
        params.push(dt[key]);
        ids.push('$' + params.length);
    });

    let sql = `DELETE FROM ${table} WHERE ${key} IN (` + ids.join(',') + ')';

    console.log(sql);
    let result = await db.query({ text: sql, values: params });

    return result;
};

export default async function (req, res, next) {
    console.log("> Request: Update Admin User Groups");
    try {
        if (!req.session || !req.session.groupid || req.session.groupid !== 1 ) {
            throw(new VError(401, 'Unauthorized'));
        }

        const body = req.body;
        console.log(body)
        let result = await deleteRows(body.entity, body.data, body.key);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}
