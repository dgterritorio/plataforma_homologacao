const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const applicantId = params.applicantId;
    const requestId = params.requestId;
    
    let values = [],
        sql = '';

    if (applicantId !== 100) {
        sql = "select id, name, email, vat, nic, phone, address, locality, zipcode, avatar, creation_date from webapp.users where id = $1;";

        values = [applicantId]
    } else {
        sql = "select 100 as id, name, '' as email, '' as vat, '' as nic, '' as phone, '' as address, '' as locality, '' as zipcode, '' as avatar, null as creation_date from homologation.history_applicants where request_id = $1;";

        values = [requestId]
    }

    return await db.query(sql, values);
}

export default async function (req, res, next) {
    console.log("> Request: Get applicant info");
    try {
        const body = req.body;

        const params = {
            applicantId: body.applicantId,
            requestId: body.requestId
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