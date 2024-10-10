const db = require(__basedir + 'modules/db/base');
const { Client } = require('pg');

async function connectExternalDB(params) {
    try {
        const client = new Client(params);

        const error = await client.connect();

        if (error) { throw error; }

        return client;
    } catch (e) {
        console.log(e)
        return null;
    }
}

async function getRequestInfo(params) {
    const requestId = params.requestId,
        userId = params.userId,
        userGroup = params.userGroup;

    let version = params.version;

    let result;

    if (userGroup === 2) {
        // Check if we have permission for state transition
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { data: [], error: null, total: 0 };
        }
    }


    result = await db.query('select date_part(\'year\', start_date) as year, vectorial from homologation.requests where id = $1', [requestId]);

    if (result.error) {
        throw result.error;
    }

    if (!result.data.length) {
        return { error: null, data: [], total: 0 }
    }

    const request = result.data[0];

    const year = request.year;
    const vectorial = request.vectorial;

    // Get the last version if no version available
    if (!version) {
        result = await db.query('select version from homologation.' + (vectorial ? 'request_vectorial' : 'request_image') + ' where request_id = $1', [requestId]);

        if (result.error) {
            throw result.error;
        }

        const carto = result.data[0];

        version = carto.version;
    }

    // year, id, version
    const database = 'homologacao_' + year + '_' + requestId + '_' + version;
    // const database = 'homologacao_' + year + '_' + 8/*requestId*/ + '_' + 1;//version;

    const dbParams = global.App.dbParams;
    const splittingIdx = dbParams.lastIndexOf('/');
    const baseConnection = dbParams.slice(0, splittingIdx);

    const connection = baseConnection + '/' + database;

    console.log("> Connecting to: " + connection);

    const client = await connectExternalDB(connection);

    // const client = await connectExternalDB({
    //     host: 'project.geomaster.pt',
    //     database: database,
    //     user: 'dgt',
    //     password: 'omffibJ5eVpLS3jea7UY',
    //     port: 5432
    // });

    // Validation is async. Need to account that the db may not yet exist.. but it's not an error too...
    if (!client) {
        // throw new VError(424, 'Não foi possível obter resultado da análise de consistência');// result.error;
        return { data: [], total: 0, error: null };
    }

    const sql = 'select code, name, total, good, bad from validation.rules order by substring(code from  1 for 2) desc, substring(code from  3) ASC';

    let data = [];

    result = null;

    try {
        result = await client.query(sql);

        if (result.error) {
            throw result.error;
        }

        data = result.rows;

        await client.end();
    } catch (e) {
        await client.end();

        throw new VError(424, 'Erro ao obter resultado da análise de consistência');// result.error;
    }

    return { data: data, error: null, total: data.length };
}

export default async function (req, res, next) {
    console.log("> Request: get consistency analysis results");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            version: body.version
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