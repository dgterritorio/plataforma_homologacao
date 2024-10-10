const { Pool, Client } = require('pg');
const TransactionHelper = require('./pgtransaction.js');

// Database pool
let pool = null;

/**
 * Builds authentication object for pgconnect
 */
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

/**
 * Connects to pg and creates a pool
 */
const connect = async function () {

    const conn_details = readDbCfg();

    pool = new Pool(conn_details);

    try {
        const conn = await pool.connect();

        console.log("> DB connection to:", conn_details.database);
        console.log("> Max. pool:", conn_details.max);

        return conn;
    } catch (e) {
        console.error('Error acquiring client', e)

        return e;
    }
}

/**
 * Queries the pg pool
 * @param {string} sql: statement to execute
 * @param {array} values: array of values to replace in the statement
 */
const query = async function (sql, values) {
    let error,
        data,
        total;

    try {
        // console.log(sql);
        const res = await pool.query(sql, values);

        error = null;
        data = res.rows;
        total = res.rowCount;
    } catch (e) {
        console.log("> [DBError] Error in query db api:\n", e)

        error = 'Database error';
        data = [];
        total = 0;
    } finally {
        return {
            error: error,
            data: data,
            total: total
        };
    }
}

/**
 * Queries the pg pool
 * @param {string} sql: statement to execute
 * @param {array} values: array of values to replace in the statement
 */
const queryadv = async function (sql, values) {
    try {
        const res = await pool.query(sql, values);

        return {
            error: null,
            data: res.rows,
            total: res.rowCount
        };
    } catch (e) {
        console.log("> [DBError] Error in query db api:\n", e)

        throw e;
    }
}

/**
 * Aquires a transaction object with automatic query roolback and client release
 */
const aquireTransaction = async function () {
    try {
        const client = await pool.connect();

        if (!client) {
            throw 'Could not aquire client from the pg pool';
        }

        return new TransactionHelper(client);
    } catch (e) {
        console.log("[DBError] Could not get client from pool:\n", e)
        return null;
    }
}

/**
 * Aquires a client from the pool
 */
const aquireClient = async function () {
    try {
        const client = await pool.connect();

        if (!client) {
            throw 'Could not aquire client from the pg pool';
        }

        return client
    } catch (e) {
        console.log("[DBError] Could not get client from pool:\n", e)
        return null;
    }
}


module.exports = {
    connect: connect,
    query: query,
    queryadv: queryadv,

    aquireTransaction: aquireTransaction,
    aquireClient: aquireClient
}
