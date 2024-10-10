const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {

    const { requestId, userGroup } = params;

    let result;

    if (userGroup === 5) {
        // Check if we have permission for state transition
        result = await db.query('select * from producers.entities where user_id = $1 and id = $2', [params.userId, params.requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { data: [], error: null, total: 0 };
        }
    }


    let sql = 'select * from producers.states s inner join producers.state_types st on st.code = s.code where entity_id = $1 order by ord asc'

    result = await db.query(sql, [params.requestId]);

    return result;
}

export default async function (req, res, next) {
    console.log("> State: Get all");

    try {
        const body = req.body;

        const user = res.locals.user;
        const userGID = user.group;

        const params = {
            requestId: body.requestId,
            userId: user.id,
            userGroup: user.group
        };

        if(params.requestId === -1){
            throw new VError(409, 'Permissão Negada');
        }

        let result = await getRequestInfo(params);

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
            } else if (!row.intervening && userGID === 5) {
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