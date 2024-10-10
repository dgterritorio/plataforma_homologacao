const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const userId = params.userId;
    const userGroup = params.userGroup;
    const requestId = params.requestId;
    const stateId = params.stateId;
    const beforeCode = params.beforeCode;

    let result, values;

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

    // let sql = 'with document_types as (select * from homologation.document_types) ';
    // sql += ' select d.*, dt.description, dt.mime_type from homologation.documents d, document_types dt ';
    // sql += ' where request_id = $1 and dt.code = d.type '

    let sql = '';
    sql += 'select d.*, s.code, dt.description, dt.mime_type '
    sql += ' from homologation.documents d '
    sql += ' inner join homologation.states s on s.id = d.state_id '
    sql += ' inner join homologation.document_types dt on dt.code = d.type '
    sql += ' where d.request_id = $1 '

    values = [requestId];

    if (stateId) {
        sql += ' and d.state_id = $2 ';

        values.push(stateId);
    }

    if(beforeCode){
        const qidx = values.length;

        sql += ' and s.code < $' + (qidx + 1) + ' ';

        values.push(beforeCode);
    }

    sql += ' order by type asc, version desc ';

    result = await db.query(sql, values);

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
            stateId: body.stateId,
            beforeCode: body.beforeCode
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