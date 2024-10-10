const { Pool, Client } = require('pg');
const os = require('os');
const fs = require('fs');

const str_regex = '[\\w\\.\\-\\_]+';

let DBPool = null;

const extractServiceField = function (fieldname, service) {
    const matches = service.match(new RegExp(fieldname + '\\=' + str_regex, 'g'));

    if (matches && matches.length) {
        const match_arr = matches[0].split('=');

        if (match_arr && match_arr.length === 2) {
            return match_arr[1];
        }
    }

    return null;
}

const fetchServiceDetails = function (service, appName) {
    let user,
        password,
        dbname,
        host,
        port;

    if (!service) {
        return null;
    }

    const home = os.homedir();

    const services = fs.readFileSync(home + '/.pg_service.conf', "utf8");

    const ServiceRegex = new RegExp('\\[' + service + '\\]\\n' + str_regex + '\\=' + str_regex + '\\n' + str_regex + '\\=' + str_regex + '\\n' + str_regex + '\\=' + str_regex + '\\n' + str_regex + '\\=' + str_regex + '\\n' + str_regex + '\\=' + str_regex + '', 'g');

    const matches = services.match(ServiceRegex);

    if (matches) {
        const target_service = matches[0];

        host = extractServiceField('host', target_service);
        port = extractServiceField('port', target_service);
        user = extractServiceField('user', target_service);
        password = extractServiceField('password', target_service);
        dbname = extractServiceField('dbname', target_service);

        if (!host || !port || !user || !password || !dbname) {
            console.log("[Err] Could not extract service info... null value");

            return null;
        }

        const details = {
            user: user,
            password: password,
            database: dbname,
            host: host,
            port: port,
            application_name: appName
        };

        return details;
    } else {
        console.log("[Err] Could not extract service info...");
        return null;
    }
}

const readDbCfg = function () {
    const cfg = global.App.dbParams.split('/');

    const params = {
        user: cfg[2].split('@')[0].split(':')[0],
        password: cfg[2].split('@')[0].split(':')[1], // 'geobox',
        database: cfg[3], // 'geotuga',
        host: cfg[2].split('@')[1].split(':')[0], // 'localhost',
        port: cfg[2].split('@')[1].split(':')[1] ? cfg[2].split('@')[1].split(':')[1] : "5432",
        max: 50 // TODO: dynamic allocation of connections
    };

    return params;
}

const readServiceCfg = function (service) {
    params = fetchServiceDetails(service);

    return params;
}

const connect = async function () {

    const conn_details = readDbCfg();

    DBPool = new Pool(conn_details);

    try {
        const conn = await DBPool.connect();

        console.log("> DB connection to:", conn_details.database);
        console.log("> Max. pool:", conn_details.max);

        return conn;
    } catch (e) {
        console.error('Error acquiring client', err.stack)

        return e;
    }
}

const connectService = async function (service) {
    const conn_details = readServiceCfg(service);

    const client = new Client(conn_details);

    // Connect pg client
    let err = await client.connect();

    if (!err) {
        return client
    } else {
        return null;
    }
}

const queryPool = async function (sql, params) {
    try {
        const res = await DBPool.query(sql, params);

        return { error: null, data: res.rows, total: res.rowCount };
    } catch (e) {
        return { error: e, data: [], total: 0 };
    }
}

const transacPool = async function (sqls, params, service) {
    try {
        await DBPool.query('BEGIN');

        let results = [];

        for (let i = 0; i < sqls.length; i++) {
            const res = await DBPool.query(sqls[i], params[i]);

            results.push(res);
        }

        await DBPool.query('COMMIT');

        return { error: null, data: results, total: results.length };
    } catch (e) {
        await DBPool.query('ROOLBACK');

        return { error: e, data: [], total: 0 };
    }
}

const transacPoolLogged = async function (sql, params, service, logInfo) {
    try {
        await DBPool.query('BEGIN');

        const split = sql.split(' ');

        let type = null;
        let table = null;
        let userId = logInfo.userid;
        let returning = '';

        switch (split[0].toLowerCase()) {
            case 'insert':
                type = 'I';
                table = split[2].split('(')[0];
                returning = 'returning *;'
                break;
            case 'update':
                type = 'U';
                table = split[2];
                returning = 'returning *;'
                break;
            case 'delete':
                type = 'D';
                table = split[2];
                returning = 'returning *;'
                break;
            default:
                break;
        }

        if (sql.endsWith(';')) {
            sql = sql.slice(0, -1);
        }

        const res = await DBPool.query(sql + ' ' + returning, params);

        const row = res.rows[0];

        let rowId = res.rows[0].id;

        delete row.id;

        const strRow = JSON.stringify(row);

        if (res.rowCount) {
            let logsql = "insert into webapp.logging(operation, table_id, row_id, user_id, val) values";

            logsql += "(";
            logsql += "'" + type + "',";
            logsql += "'" + table + "',";
            logsql += "" + rowId + ",";
            logsql += "" + userId + ",";
            logsql += "'" + strRow + "'";
            logsql += ")";

            await DBPool.query(logsql, params);
        }

        await DBPool.query('COMMIT');

        return { error: null, data: res, total: res.length };
    } catch (e) {
        // console.log("Rollback error: ");
        await DBPool.query('ROOLBACK');

        return { error: e, data: [], total: 0 };
    }
}

const queryService = async function (sql, params, service) {
    // Connect pg client
    let client = await connectService(service);

    if (!client) {
        return { error: err, data: [], total: 0 };
    }

    try {
        const res = await client.query(sql, params);

        client.end();

        return { error: null, data: res.rows, total: res.rowCount };
    } catch (e) {

        client.end();

        return { error: e, data: [], total: 0 };
    }
}

const transacService = async function (sqls, params, service) {
    // Connect pg client
    let client = await connectService(service);

    if (!client) {
        return { error: err, data: [], total: 0 };
    }

    try {
        await client.query('BEGIN');

        let results = [];

        for (let i = 0; i < sqls.length; i++) {
            const res = await client.query(sqls[i], params[i]);

            results.push(res);
        }

        await client.query('COMMIT');

        client.end();

        return { error: null, data: results, total: results.length };
    } catch (e) {

        await client.query('ROLLBACK');

        client.end();

        return { error: e, data: [], total: 0 };
    }
}

const query = async function (sql, params = [], batch = false, service, logInfo) {
    console.log('> Query: ', sql);

    try {
        if (!batch) {

            if (!service && !logInfo) {
                return await queryPool(sql, params);
            } else if (!logInfo) {
                return await queryService(sql, params, service);
            } else {
                return await transacPoolLogged(sql, params, service, logInfo)
            }

        } else {
            if (!service && !logInfo) {
                return await transacPool(sql, params);
            } else if (!logInfo) {
                return await transacService(sql, params, service);
            } else {
                return await transacPoolLogged(sql, params, service, logInfo);
            }
        }

    } catch (e) {
        console.log("> [Error] Error in db query api: ", e);

        return { error: 'Database error', data: [], total: 0 }
    }
}

module.exports = {
    connect: connect,
    query: query
}
