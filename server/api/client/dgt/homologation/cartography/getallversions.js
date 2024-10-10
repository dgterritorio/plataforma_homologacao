const db = require(__basedir + 'modules/db/base');

const queries = Object.freeze({
    6: {
        head: 'select vectorial ',
        body: 'from homologation.requests ',
        where: ' where id = $1 ',
        keys: ['requestId']
    },
    4: {
        head: 'select vectorial ',
        body: 'from homologation.requests ',
        where: ' where id = $1 ',
        keys: ['requestId']
    },
    2: {
        head: 'select vectorial ',
        body: 'from homologation.requests ',
        where: ' where applicant_id = $1 and id = $2 ',
        keys: ['userId', 'requestId']
    }
});

async function getRequestInfo(params) {

    const { userGroup } = params;

    let { head, body, where, keys } = queries[userGroup];
    const values = keys.map(k => params[k]);


    let result;

    result = await db.query(head + body + where, values)

    if (result.error) {
        return { error: 'Erro ao obter requerimento' };
    }

    if (params.userGroup === 2) {
        if (result.data && !result.data.length) {
            return { error: 'Permissão negada' }
        }
    }

    const data = result.data;

    const vectorial = data[0].vectorial;

    result = await db.query('select code from homologation.states where id = $1', [params.stateId]);

    if (result.error) {
        return { error: 'Erro ao obter estado' };
    }

    const stateData = result.data;

    const code = stateData[0].code;

    const condition = code === 1 ? ' state_id is null and version = 1 ' : ' state_id = $2 ';
    const coniditonValues = code === 1 ? [params.requestId] : [params.requestId, params.stateId];

    let sql = "select * from homologation.";

    if (vectorial) {
        sql += "vectorial_carto ";
    } else {
        sql += "imagery_carto ";
    }

    sql += "where request_id = $1 and " + condition;

    result = await db.query(sql, coniditonValues);

    if (result.data.length) {
        result.data[0].vectorial = vectorial;
    }

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get cartography version");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            stateId: body.stateId,
            requestId: body.requestId,
            userId: user.id,
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