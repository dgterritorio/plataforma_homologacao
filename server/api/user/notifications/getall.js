const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

const queries = Object.freeze({
    '-1': {
        head: 'select id, user_id, user_name, from_contact, to_contact, subject, creation_date, send_date, read_date, template_id, category_id, category_name, category_color ',
        body: 'from notifications.user_messages ',
        where: ' where user_id = $1 ',
        keys: ['userId']
    }
});


async function getRequestInfo(params) {
    let { head, body, where, keys } = queries['-1'];

    const values = keys ? keys.map(k => params[k]) : [];

    const { paging, sorting, filters } = parseMetadata(params);

    if (where) {
        body += where;
    }

    if (filters.length) {
        body += where ? ' and ' + filters : ' where ' + filters;
    }

    const mainSql = head + body + sorting + paging;

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
    console.log("> Request: Get document");
    try {
        const user = res.locals.user;

        const userId = user.id;
        const userGroup = user.group;

        const body = req.body;

        const params = {
            userId: userId,
            userGroup: userGroup,
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