const { query } = require('../base');
const { parseMetadata } = require('./helpers');

const destroy = async function (params) {
    console.log('\n[Destroy]');
    // console.log(params);

    const meta = parseMetadata(params);

    // Parse metadata (defaultTable, service, id, geomColumn, etc...
    if (!meta) {
        return { err: 'Missing metadata', result: [], total: 0 };
    }

    const rows = [].concat(params.values);

    const ids = rows.map(function (row) {
        return row[meta.pkey];
    });

    const sql = `DELETE FROM ${meta.table} WHERE ` + meta.pkey + ` IN (${ids.toString()})`;

    return await query(
        sql,
        [],
        false,
        params.service
    );
}

module.exports = {
    destroy: destroy
}