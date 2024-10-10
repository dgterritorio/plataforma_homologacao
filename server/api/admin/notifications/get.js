const db = require(__basedir + 'modules/db/base');

const queries = Object.freeze({
    1: {
        head: 'select * ',
        body: 'from notifications.user_messages ',
        where: ' where id = $1',
        keys: ['emailId']
    },
    4: {
        head: 'select * ',
        body: 'from notifications.user_messages ',
        where: ' where id = $1 and (category_id = 2 or category_id = 3)',
        keys: ['emailId']
    },
    // '-1': {
    //     head: 'select * ',
    //     body: 'from notifications.user_messages ',
    //     where: ' where id = $1 and user_id = $2 ',
    //     keys: ['emailId', 'userId']
    // }
});

async function getRequestInfo(params) {
    let group = params.userGroup;

    if(!queries.hasOwnProperty(group)){
        group = -1;
    }

    const { head, body, where, keys } = queries[group];

    const sql = head + body + where;
    const values = keys ? keys.map(k => params[k]) : [];

    let result = await db.query(sql, values);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get Request");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            emailId: body.emailId,
            userId: user.id,
            userGroup: user.group
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