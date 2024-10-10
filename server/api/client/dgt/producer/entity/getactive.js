const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

async function getRequestInfo(params) {
    let head = "select id, name, email, address, locality, phone, zipcode, carto_vectorial, carto_imagery, carto_aerial ";
    let body = "from producers.official_producers where id != -1 ";

    const { paging, sorting, filters } = parseMetadata(params);

    if (filters.length) {
        body += ' and ' + filters
    }

    const mainSql = head + body + sorting + paging;

    let result = await db.query(mainSql);

    if (params.limit) {

        let count = await db.query("select count(*) as total " + body);

        if (count.hasOwnProperty('data') && count.data.length) {
            let total = parseInt(count.data[0].total);

            result.total = total;
        }
    } else {
        result.total = result.data.length;
    }

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get all active producers");
    try {

        const body = req.body;

        const params = {
            limit: body.limit,
            start: body.start,
            sortBy: body.sortBy,
            sortOrder: body.sortOrder,
            filter: body.filter
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