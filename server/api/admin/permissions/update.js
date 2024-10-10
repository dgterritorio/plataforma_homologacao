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

    // console.log(sql);
    let result = await db.query({ text: sql, values: params });

    return result;
};

export default async function (req, res, next) {
    console.log("> Request: Update Admin Permissions");
    try {
        if (!req.session || !req.session.groupid || req.session.groupid !== 1 ) {
            throw(new VError(401, 'Unauthorized'));
        }

        const body = req.body;
        console.log(req.body);

        let menu_id, group_id;
        if (body.hasOwnProperty('data') && body.data.hasOwnProperty('menu_id')
            && body.data.hasOwnProperty('group_id') && body.data.hasOwnProperty('permission')) {

            menu_id = body.data["menu_id"];
            group_id = body.data["group_id"];

            let selQuery = 'SELECT * from webapp.permissions WHERE menu_id=$1 and group_id=$2'
            let selr = await db.query({ text: selQuery, values: [menu_id, group_id] });

            if (!selr || selr.error) {
                throw selr.error;
            }

            let result, returnData;
            if (selr.total == 0 && body.data["permission"]) {
                result = await insertRows('webapp.permissions', [body.data], ['menu_id', 'group_id'], {}, 'RETURNING *');
            } else if (selr.total !== 0 && !body.data["permission"]) {
                let delQuery = 'DELETE from webapp.permissions WHERE menu_id=$1 and group_id=$2'
                result = await db.query({ text: delQuery, values: [menu_id, group_id] });
            }

            // console.log(selr);
            // console.log(result);
            if (!result || result.error) {
                throw result.error;
            }

            // console.log(result);
            if (result.data.length > 0) {
                returnData = {
                    'menu_id': result.data[0]['menu_id'],
                    'group_id': result.data[0]['group_id'],
                    'groupname': body.data['groupname'],
                    'permission': true
                };
            } else {
                returnData = {
                    'menu_id': body.data['menu_id'],
                    'group_id': body.data['group_id'],
                    'groupname': body.data['groupname'],
                    'permission': false
                };
            }

            console.log(returnData)
            res.send({ data: returnData, error: null, total: 1 });
        } else {
            throw 'Unexpected request';
        }
    } catch (e) {
        next(e);
    }
}
