const db = require(__basedir + 'modules/db/base');

async function checkPermission(user, requestUserId) {
    try {
        if (user.id !== requestUserId) {
            return { error: new VError(409, 'Permissão negada') };
        }

        const result = await db.query('select * from webapp.users where id = $1', [user.id])

        if (result.error) {
            console.log("Error gettting user");

            throw result.error;
        }

        if (!result.data.length) {
            return { error: new VError(409, 'Permissão negada') };
        }

        return { error: null }

    } catch (e) {
        return { error: e };
    }
}


async function updateRow(table, data, cond, ignore, returning) {
    let sets = [];
    let params = [];

    Object.keys(data).forEach(k => {
        if (ignore.indexOf(k) == -1 && typeof data[k] !== 'undefined') {
            params.push(data[k]);
            sets.push('"' + k + '"=$' + params.length);
        }
    });

    let sql = 'UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE '
        + cond + ' ' + returning + ';';

    console.log(sql);
    let result = await db.query({ text: sql, values: params });

    return result;
};

export default async function (req, res, next) {
    console.log("> Request: Update User");
    try {
        const body = req.body;

        let cond = body.key + '=' + body.data[body.key];
        let returning = "";

        const user = res.locals.user;
        const requestUserId = body.data[body.key];

        let permission = await checkPermission(user, requestUserId);

        if (permission.error) {
            throw permission.error;
        }

        let result = await updateRow('webapp.users', body.data, cond, [body.key, 'password', 'email'], returning);
        console.log(result)

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}
