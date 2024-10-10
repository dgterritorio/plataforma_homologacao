const db = require(__basedir + 'modules/db/base');

async function getRequestInfo() {
    let sql = "select * from homologation.state_types";

    let result = await db.query(sql);

    return result;
}

export default async function (req, res, next) {
    console.log("> State: Get all");

    try {
        let result = await getRequestInfo();

        const user = res.locals.user;
        const userGID = user.group;

        if (!result || result.error) {
            throw result.error;
        }

        result.data.forEach(function (row) {

            if (userGID === 4) {
                row.description = row.evaluator_description;
            } else {
                row.description = row.applicant_description;
            }

            // If user = evaluator
            if (row.intervening && userGID === 4) {
                row.must_intervene = true;

                // If user = applicant
            } else if (!row.intervening && userGID === 2) {
                row.must_intervene = true;

                // else set false
            } else {
                row.must_intervene = false;
            }
        });

        res.send(result);
    } catch (e) {
        next(e);
    }
}