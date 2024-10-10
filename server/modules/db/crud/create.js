const { query } = require('../base');
const { parseMetadata } = require('./helpers');

const create = async function (params) {
    console.log('\n[Create]');
    // console.log(params);

    const meta = parseMetadata(params);

    // Parse metadata (defaultTable, service, id, geomColumn, etc...
    if (!meta) {
        return { err: 'Missing metadata', result: [], total: 0 };
    }

    const rows = [].concat(params.values); // even if we receive just one object, we create an array with that object

    let insert_sql = [];
    let insert_values = [];
    let insert_ids = [];

    function prepare(element, index, array) {
        const fields = [], values = [];
        const buracos = [];

        let i = 1;

        for (let key in element) {
            switch (key) {
                case "id":
                case meta.pkey:
                    break;
                case 'geojson':
                    fields.push('"' + meta.geomColumn + '"');
                    values.push(element[key]);
                    buracos.push("ST_GeomFromGeoJSON($" + i + ")");

                    i++;
                    break;
                default:

                    fields.push('"' + key + '"');
                    values.push(element[key]);
                    buracos.push('$' + i);
                    i++;

                    break;
            }
        }

        const sql = `INSERT INTO ${meta.table} (${fields.join()}) VALUES (${buracos.join()}) RETURNING ` + meta.pkey;

        insert_sql.push(sql);
        insert_values.push(values);
    }

    rows.forEach(prepare);

    const batch = insert_sql.length > 1;

    const insert_res = await query(
        batch ? insert_sql : insert_sql[0],
        batch ? insert_values : insert_values[0],
        batch,
        params.service
    );

    if(insert_res.error){
        return insert_res;
    }

    const inserted_ids = insert_res.data.map(function(el){
        return el.id;
    })

    const fetch_inserts = `SELECT * FROM ${meta.table} where ` + meta.pkey + ` IN (${inserted_ids.toString()})`;

    return await query(
        fetch_inserts,
        [],
        false,
        params.service
    );}

module.exports = {
    create: create
}