const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

async function getRequestInfo(params) {
    let head = 'select id, concelho ',
        body = 'from homologation.concelhos ',
        keys = [];

    const values = keys ? keys.map(k => params[k]) : [];

    const { paging, sorting, filters } = parseMetadata(params);

    if (filters.length) {
        body += ' where ' + filters;
    }

    const mainSql = head + body + sorting + paging;

    console.log(mainSql)

    let result = await db.query(mainSql, values);

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
    console.log("> Request: Get all counties");
    try {
        const user = res.locals.user;

        const userId = user.id;
        const userGroup = user.group;

        const body = req.body;

        const params = {
            limit: body.limit,
            start: body.start,
            sortBy: body.sortBy,
            sortOrder: body.sortOrder,
            filter: body.filter
        };

        console.log(params)

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}