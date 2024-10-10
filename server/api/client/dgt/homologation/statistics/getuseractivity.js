const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const days = params.days;
    const userId = params.userId;

    let sql = "select * from homologation.get_user_activity_statistics($1);";

    let result = await db.query(sql, [userId]);

    return result;
}

export default async function (req, res, next) {
    console.log("> Statisitcs: get activity");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            days: body.days,
            userId: user.id
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