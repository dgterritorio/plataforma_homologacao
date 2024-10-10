const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');


async function getRequestInfo(params) {
    let head = "select user_id, group_id ";
    let body = "from webapp.usermemberships";

    const { paging, sorting, filters } = parseMetadata(params);

    if (filters.length) {
        body += ' where ' + filters
    }

    const mainSql = head + body + sorting + paging;
    let result = await db.query(mainSql);

    // console.log(mainSql);
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
    console.log("> Request: Get Admin Memberships");
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