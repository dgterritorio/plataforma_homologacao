const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

async function getRequestInfo(params) {
    const requestId = params.requestId,
        userId = params.userId,
        userGroup = params.userGroup;


    const { paging, sorting, filters } = parseMetadata(params);

    let head = "select e.*, u.name as name, u.email as email, s.code ",
        body = "from homologation.evaluation_owners e \
                inner join webapp.users u on u.id = e.user_id and e.request_id = $1 \
                inner join homologation.states s on s.id = e.state_id \
                inner join homologation.state_types st on st.code = s.code ",
        where = null;

    if (where) {
        body += where;
    }

    if (filters.length) {
        body += where ? ' and ' + filters : ' where ' + filters;
    }

    const mainSql = head + body + sorting + paging;

    const result = await db.query(mainSql, [requestId]);

    if (params.limit) {

        let count = await db.query("select count(*) as total " + body, values);

        if (count.hasOwnProperty('data') && count.data.length) {
            let total = parseInt(count.data[0].total);

            result.total = total;
        }
    } else {
        result.total = result.data.length;
    }

    const data = result.data;

    for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const date = d.date_added;

        // Parse date
        if (date) {
            d.date_added = date.toISOString().split('T')[0];
        }

        // Set who is owner (always the first)
        d.owner = (i === 0);
    }

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: get all evaluation owners");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            limit: body.limit,
            start: body.start,
            sortBy: 'ord',
            sortOrder: false,
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