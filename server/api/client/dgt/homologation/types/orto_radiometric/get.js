const db = require(__basedir + 'modules/db/base');

async function getRequestInfo() {
    let sql = "select code, description from homologation.orto_radiometric_types;";

    let result = await db.query(sql);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get orto radiometric types");
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