const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');
const { requireSupervisoryReport } = require('./util')

const queries = Object.freeze({
    6: {
        head: 'select * ',
        body: 'from homologation.request_documents ',
        where: ' where request_id = $1 ',
        keys: ['requestId']
    },
    4: {
        head: 'select * ',
        body: 'from homologation.request_documents ',
        where: ' where request_id = $1 ',
        keys: ['requestId']
    },
    2: {
        head: 'select * ',
        body: 'from homologation.request_documents ',
        where: ' where request_id = $1 ',
        keys: ['requestId']
    }
});

async function getRequestInfo(params) {
    const userId = params.userId;
    const userGroup = params.userGroup;
    const requestId = params.requestId;

    let result;

    if (userGroup === 2) {
        // Check if we have permission for documents
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

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

    // console.log(mainSql)

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

    await requireSupervisoryReport(requestId, result.data);


    // let sql = "select sub.*, dt.description as name ";
    // sql += "from (select distinct on (d.\"type\") d.\"type\", d.version, d.original_name, d.file, d.id from homologation.documents d ";

    // sql += " where ";

    // if (params.hasOwnProperty('requestId')) {
    //     sql += "request_id = ";
    //     sql += params.requestId;

    //     if (params.hasOwnProperty('state')) {
    //         sql += "and state = homologation.get_previous_state(" + params.requestId + ")";
    //     }
    // } else if (params.hasOwnProperty('state')) {
    //     sql += "state = " + params.state;
    // }

    // sql += " order by d.\"type\", version desc) sub "
    // sql += "inner join homologation.document_types  dt on sub.type = dt.code";

    // result = await db.query(sql);

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
            filter: body.filter
        };

        if (!params.hasOwnProperty('filter') || !params.filter) {
            params.filter = [];
        }

        if (body.stateId) {
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
                value: '(select id from homologation.states where request_id = $1 order by ord desc offset 1 limit 1)'
            });
        }

        if (body.onlyInvalid) {
            if (!params.hasOwnProperty('filter')) {
                params.filter = [];
            }

            params.filter.push({
                operator: '==',
                property: 'invalid',
                value: 'true'
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