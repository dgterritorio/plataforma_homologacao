const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

async function getRequestInfo(params) {
    let sql = "select code, description from homologation.data_types";

    const { filters } = parseMetadata(params);

    if(filters.length){
        sql += ' where ' + filters
    }

    let result = await db.query(sql);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get data types");
    try {
        const body = req.body;

        const params = {
            limit: null,
            start: null,
            sortBy: null,
            sortOrder: null,
            filter: body.filter
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}