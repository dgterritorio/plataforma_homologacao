const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

async function getRequestInfo(params) {
    const userId = params.userId,
        userGroup = params.userGroup;

    const { paging, sorting, filters } = parseMetadata(params);

    let head = "select id, name, email ",
        body = "from webapp.users ",
        where = "where group_id = 4 and id != $1";

    const values = [userId];

    if (where) {
        body += where;
    }

    if (filters.length) {
        body += where ? ' and ' + filters : ' where ' + filters;
    }

    const mainSql = head + body + sorting + paging;

    const result = await db.query(mainSql, values);

    if (params.limit) {

        let count = await db.query("select count(*) as total " + body, values);

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
    console.log("> Request: get possible evaluators");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
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

        res.send(result);
    } catch (e) {
        next(e);
    }
}