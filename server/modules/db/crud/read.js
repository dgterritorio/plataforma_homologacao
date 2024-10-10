const { query } = require('../base');
const {
    parseMetadata,
    parseFilters,
    parsePaging,
    parseSort
} = require('./helpers')


const read = async function (params) {

    console.log('\n[Select]');
    // console.log(params);

    const meta = parseMetadata(params);

    // Parse metadata (defaultTable, service, id, geomColumn, etc...
    if (!meta) {
        return { err: 'Missing metadata', result: [], total: 0 };
    }

    let sql = '';

    const sqlPrefix = 'SELECT * ';
    const sqlBody = ' FROM ' + meta.table + ' ';

    let where = parseFilters(params);
    let order = parseSort(params);
    let paging = parsePaging(params);

    sql += sqlPrefix;
    sql += sqlBody;
    sql += where;
    sql += order;
    sql += paging;

    const res = await query(sql, [], false, params.service);

    if(paging.length){
        const res_total = await query('SELECT count(*) ' + sqlBody + where, [], false, params.service);

        if(res_total.data.length){
            res.total = parseInt(res_total.data[0].count);
        }
    }

    return res;
}

module.exports = {
    read: read
}