const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    try {
        const start = params.timestart ? params.timestart : null;
        const end = params.timeend ? params.timeend : null;
        const userGroup = params.userGroup;
        let userId = null;
        const onlyPublic = params.onlyPublic;


        // let sql = "select * from homologation.get_public_statistics" + (start && end ? "($1, $2)" : "()");

        if (!onlyPublic) {
            if (userGroup === 2) {
                userId = params.userId;
            } else if (userGroup === 4 || userGroup === 6) {
                // Ignore
            } else {
                throw new VError(409, 'Permissão Negada')
            }
        }

        let values = [start, end, userId];

        let result = await db.query('select * from homologation.get_general_statistics($1, $2, $3)', values);

        if (result.error) {
            throw result.error;
        }

        const statistics = result.data[0];

        // Applicant && Evalutor && Inspector only
        if (userGroup === 2 || userGroup === 4 || userGroup === 6) {
            // Scalers
            result = await db.query('select * from homologation.get_scale_statistics($1, $2, $3) order by data_specification asc', values);

            if (result.error) {
                throw result.error;
            }

            statistics.scales = result.data;
        }

        if (userGroup === 4 || userGroup === 6) {
            // States
            result = await db.query('select *, evaluator_description as description from homologation.get_states_statistics($1, $2, $3)', values);

            if (result.error) {
                throw result.error;
            }

            statistics.states = result.data;
        }


        return { error: null, data: [statistics], total: 1 };
    } catch (e) {
        return { error: e }
    }
}

export default async function (req, res, next) {
    console.log("> Statisitcs: get general statistics");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            timestart: body.timestart,
            timeend: body.timeend,
            userGroup: user.group,
            userId: user.id,
            onlyPublic: body.onlyPublic
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            // console.log("> Err: ", result.error)
            // res.send({ error: 'Error..' });

            throw result.error;
        }

        res.send(result);

    } catch (e) {
        next(e);
    }
}