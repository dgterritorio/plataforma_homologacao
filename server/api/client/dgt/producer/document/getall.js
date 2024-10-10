const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

const queries = Object.freeze({
    4: {
        head: "select *, 'application/pdf' as mime_type ",
        body: 'from producers.entity_documents ',
        where: ' where entity_id = $1 ',
        keys: ['requestId']
    },
    5: {
        head: "select *, 'application/pdf' as mime_type ",
        body: 'from producers.entity_documents ',
        where: ' where entity_id = $1',
        keys: ['requestId']
    },
});

async function getRequestInfo(params) {
    const userId = params.userId;
    const userGroup = params.userGroup;
    const requestId = params.requestId;

    let result;

    if (userGroup === 5) {
        // Check if we have permission for documents
        result = await db.query('select * from producers.entities where user_id = $1 and id = $2', [params.userId, params.requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { data: [], error: null, total: 0 };
        }
    }


    const { paging, sorting, filters } = parseMetadata(params);

    let { head, body, where, keys } = queries[userGroup];
    const values = keys.map(k => params[k]);

    if (where) {
        body += where;
    }

    if (filters.length) {
        body += where ? ' and ' + filters : ' where ' + filters;
    }

    const mainSql = head + body + sorting + paging;

    result = await db.query(mainSql, values);

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
    console.log("> Request documents");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
        };

        if (body.stateId) {
            if (!params.hasOwnProperty('filter')) {
                params.filter = [];
            }

            params.filter.push({
                operator: 'eq',
                property: 'state_id',
                value: body.stateId
            });
        }

        if (body.lastState) {
            if (!params.hasOwnProperty('filter')) {
                params.filter = [];
            }

            params.filter.push({
                operator: '==',
                property: 'state_id',
                value: '(select id from producers.states where entity_id = $1 order by ord desc offset 1 limit 1)'
            });
        }

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);

    } catch (e) {
        next(e);
    }
}