const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {


    let result = await db.query("select applicant_is_owner, applicant_id from homologation.requests where id = $1;", [params.requestId]);

    if (result.error) {
        return { error: result.error };
    }

    const data = result.data;

    if (params.userGroup === 2) {
        if (!data.length) {
            return { error: new VError(409, 'Permissão negada.') };
        }
    }

    const applicantIsOwner = data[0].applicant_is_owner;
    const applicantId = data[0].applicant_id;

    let sql = '';//"select id, name, email, vat, phone, address, locality, zipcode from ";
    let values = [];

    if (applicantIsOwner) {
        if(applicantId !== 100){
            sql = "select id, name, email, vat, phone, address, locality, zipcode from webapp.users where id = $1";
            values = [applicantId];
        } else {
            sql = "select 100 as id, name, '' as email, '' as vat, '' as phone, '' as address, '' as locality, '' as zipcode from homologation.history_applicants where request_id = $1";
            values = [params.requestId];
        }
    } else {
        sql = "select id, name, email, vat, phone, address, locality, zipcode from homologation.owners where request_id = $1";
        values = [params.requestId];
    }

    console.log(sql)

    return await db.query(sql, values);
}

export default async function (req, res, next) {
    console.log("> Request: Get applicant info");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            requestId: body.requestId,
            userGroup: user.group
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