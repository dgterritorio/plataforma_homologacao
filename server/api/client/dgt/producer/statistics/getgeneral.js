const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    try {
        const start = params.timestart ? params.timestart : null;
        const end = params.timeend ? params.timeend : null;
        const userGroup = params.userGroup;

        let values = [start, end, null];

        let result = await db.query('select * from producers.get_general_statistics($1, $2, $3)', values);

        if (result.error) {
            throw result.error;
        }

        const statistics = result.data[0];

        if (userGroup === 4 || userGroup === 6) {
            // States
            result = await db.query('select *, evaluator_description as description from producers.get_states_statistics($1, $2, $3)', values);

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