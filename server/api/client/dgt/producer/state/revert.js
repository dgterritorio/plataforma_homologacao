const { aquireTransaction } = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const userId = params.userId;
    const { requestId, userGroup } = params;

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

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

        result = await db.query('insert into producers.states(code, intervening_id, entity_id) values($1, $2, $3) returning code;', [300, userId, requestId], params.userId ? { userId: params.userId } : null);

        if (result.error) {
            throw result.error;
        }

        result = await db.query('select code from producers.states where entity_id = $1 order by ord desc limit 1;', [requestId]);

        if (result.error) {
            return result.error;
        }

        await db.commit();

        await db.release();

        return result;
    } catch (e) {
        if (db) {
            await db.rollback();

            await db.release();
        }

        return { error: e }
    }
}

export default async function (req, res, next) {
    console.log("> State: revert");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
        };

        if(params.requestId === -1){
            throw new VError(409, 'Permissão Negada');
        }

        // let result = await getRequestInfo(params);
        let result = { error: new VError(429, 'Funcionalidade não suportada.') }//await getRequestInfo(params);

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