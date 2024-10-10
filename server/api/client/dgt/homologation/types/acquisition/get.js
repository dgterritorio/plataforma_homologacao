const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    let sql = "select code, description from homologation.acquisition_types";
        
    let result = await db.query(sql);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get acquisition types");
    try {
        let result = await getRequestInfo();

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}