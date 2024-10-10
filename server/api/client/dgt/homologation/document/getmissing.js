const db = require(__basedir + 'modules/db/base');
const { requireSupervisoryReport } = require('./util')

async function getRequestInfo(params) {
    const userId = params.userId;
    const userGroup = params.userGroup;
    const requestId = params.requestId;
    const onlyInvalid = !!params.onlyInvalid;

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
 
    result = await db.query("select * from homologation.get_missing_documents($1, $2) order by type;", [requestId, onlyInvalid]);

    await requireSupervisoryReport(requestId, result.data);

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
            onlyInvalid: body.onlyInvalid
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