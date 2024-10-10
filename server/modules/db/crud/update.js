const { query } = require('../base');
const { parseMetadata } = require('./helpers');

const update = async function (params) {
    console.log('\n[Update]');
    // console.log(params);

    const meta = parseMetadata(params);

    // Parse metadata (defaultTable, service, id, geomColumn, etc...
    if (!meta) {
        return { err: 'Missing metadata', result: [], total: 0 };
    }

    const rows = [].concat(params.values); // even if we receive just one object, we create an array with that object

    const update_sql = [];
    const update_values = [];
    const update_ids = [];

    // const updatesToDo = rows.length;
    // const updatesDone = [];

    // For each row to update
    function prepare(element, index, array) {
        var i = 1, fields = [], values = [];

        const id = element[meta.pkey];

        // Remove the id assuming that the table has a serial id
        delete element[meta.pkey];

        for (var key in element) {
            // fields.push(key + '= $' + i);
            if (key !== 'geojson') {
                fields.push('"' + key + '" = $' + i);
                values.push(element[key]);
            } else {
                fields.push('"' + meta.geomColumn + '" = ST_GeomFromGeoJSON($' + i + ')');
                values.push(element[key]);
            }

            i = i + 1;
        }

        const sql = `UPDATE ${meta.table} SET ${fields.join()} WHERE ` + meta.pkey + ` = ${id}`;

        update_sql.push(sql);
        update_values.push(values);
        update_ids.push(id);
    }

    rows.forEach(prepare);

    const batch = update_sql.length > 1;

    const update_res = await query(
        batch ? update_sql : update_sql[0],
        batch ? update_values : update_values[0],
        batch,
        params.service
    );

    if(update_res.error){
        return update_res;
    }

    const fetch_updates = `SELECT * FROM ${meta.table} where ` + meta.pkey + ` IN (${update_ids.toString()})`;

    return await query(
        fetch_updates,
        [],
        false,
        params.service
    );
}

module.exports = {
    update: update
}