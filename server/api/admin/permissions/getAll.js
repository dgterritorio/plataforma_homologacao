const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');


async function getRequestInfo(params) {
    const { paging, sorting, filters } = parseMetadata(params);
    let menu_id = -1;
    if (params && params.filter) {
        params.filter.forEach(element => {
            if (element.property == 'menu_id') {
                menu_id = element.value;
            }
        });
    }
    console.log(params);
    let dfltr = ' where menu_id=' + menu_id;

    let head = "with p as (select group_id from webapp.permissions";
    head = (filters.length) ?
        head + ' where ' + filters + ')' :
        head + dfltr + ')';
    head += " select " + menu_id + " as menu_id, usergroups.id as group_id, usergroups.\"name\" as groupname, usergroups.id in (select * from p) as \"permission\"";
    let body = " from webapp.usergroups";

    const mainSql = head + body + sorting + paging;
    console.log(mainSql);
    let result = await db.query(mainSql);

    if (params.limit) {
        let count = await db.query("select count(*) as total " + body);
        if (count.hasOwnProperty('data') && count.data.length) {
            let total = parseInt(count.data[0].total);
            result.total = total;
        }
    } else {
        result.total = result.data.length;
    }

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get Admin Permissions");
    try {
        const body = req.body;

        const params = {
            limit: body.limit,
            start: body.start,
            sortBy: body.sortBy,
            sortOrder: body.sortOrder,
            filter: body.filter
        };

        let result = await getRequestInfo(params);
        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}
