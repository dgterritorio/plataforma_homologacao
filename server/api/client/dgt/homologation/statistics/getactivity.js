const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const days = params.days;

    let sql = "select * from homologation.get_global_activity_statistics();";

    let result = await db.query(sql);

    return result;
}

export default async function (req, res, next) {
    console.log("> Statisitcs: get activity");

    try {
        const body = req.body;

        const params = {
            days: body.days
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