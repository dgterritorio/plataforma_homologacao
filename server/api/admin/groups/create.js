const db = require(__basedir + 'modules/db/base');

async function insertRows(table, items, columns, pred, returning) {
    let params = [];
    let chunks = [];
    let ecolumns = columns.map(f => '"' + f + '"');
    items.forEach(row => {
        let valuesClause = [];
        columns.forEach(c => {
            if (Object.keys(pred).includes(c)) {
                params.push(pred[c]);
            } else {
                if (typeof row[c] !== "undefined" && row[c] !== null) {
                    params.push(row[c]);
                } else params.push(null);
            }
            // ecolumns.push('"' + c + '"');
            valuesClause.push('$' + params.length);
        });
        chunks.push('(' + valuesClause.join(', ') + ')');
    });

    let sql = 'INSERT INTO ' + table + '(' + ecolumns.join(', ') + ') VALUES '
        + chunks.join(', ') + ' ON CONFLICT DO NOTHING ' + returning + ';';

    let result = await db.query({ text: sql, values: params });

    return result;
};

export default async function (req, res, next) {
    console.log("> Request: Create Admin User Groups");
    try {
        if (!req.session || !req.session.groupid || req.session.groupid !== 1 ) {
            throw(new VError(401, 'Unauthorized'));
        }

        const body = req.body;
        let fields = Object.keys(body.data[0]).filter(c => c != body.key);

        let result = await insertRows(body.entity, body.data, fields, {}, 'RETURNING *');

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}
