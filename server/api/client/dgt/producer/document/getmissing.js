const db = require(__basedir + 'modules/db/base');


const queries = Object.freeze({
    4: {
        head: 'select max(version), * ',
        body: 'from producers.entity_documents ',
        where: ' where entity_id = $1 ',
        keys: ['requestId']
    },
    5: {
        head: 'select max(version), * ',
        body: 'from producers.entity_documents ',
        where: ' where entity_id = $1 and user_id = $2',
        keys: ['requestId', 'userId']
    },
});

async function getRequestInfo(params) {
    const userId = params.userId;
    const userGroup = params.userGroup;
    const requestId = params.requestId;
    const onlyInvalid = !!params.onlyInvalid;

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
 
    result = await db.query("select *, 'application/pdf' as mime_type from producers.get_missing_documents($1, $2) order by mandatory;", [requestId, onlyInvalid]);

    return result;
}

export default async function (req, res, next) {
    console.log("> Document: Get missing documents");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            onlyInvalid: body.onlyInvalid,
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