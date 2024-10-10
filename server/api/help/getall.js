const db = require(__basedir + 'modules/db/base');

async function getRequestInfo() {
    return await db.query('select hs.*, json_agg(row_to_json(h.*)) as subsections from webapp.help_sections hs, webapp.help h where hs.id = h.help_section_id group by hs.id;');
}

export default async function (req, res, next) {
    console.log("> Request: Get helps");
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