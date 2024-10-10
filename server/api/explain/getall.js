const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const fieldsArr = params.fields.map(x => "'" + x + "'").toString();;

    const fieldsStr = fieldsArr;//.substring(1, fieldsArr.length);
    console.log(fieldsStr)

    return await db.query('select field_key, body from webapp.explain_fields ef where ef.field_key in (' + fieldsStr + ')');
}

export default async function (req, res, next) {
    console.log("> Request: Get explains");
    try {
        const body = req.body;

        const params = {
            fields: body.fields
        }

        const result = await getRequestInfo(params);

        // if (!result || result.error) {
        //     throw result.error;
        // }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}