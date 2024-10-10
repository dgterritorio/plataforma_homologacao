const db = require(__basedir + 'modules/db/base');

function setType(finished, code) {
    if (!finished) {
        // In progress
        return 0;
    } else {
        if (code > 55 && code < 100) {
            // Sucess
            return 1;
        } else {
            // Cancelled
            return 2;
        }
    }
}

async function getRequestInfo(params) {

    let sql = "select request_id, st_asgeojson(bbox) as geom, area, st_perimeter(bbox) as perimeter from homologation.";
    let values = [params.cartographyId];

    if (params.vectorial) {
        sql += "vectorial_carto ";
    } else {
        sql += "imagery_carto ";
    }

    sql += "where id = $1;";

    console.log(sql, values)

    let result = await db.query(sql, values);

    if (result.error) {
        throw result.error;
    }

    if (!result.data.length) {
        throw new VError(204, 'Nenhuma cartografia encontrada');
    }

    const cartoData = result.data[0];

    const requestId = cartoData.request_id;

    values = [requestId];
    sql = 'select finished, code from homologation.request_states where id = $1 ';

    if (params.userGroup === 2) {
        sql += " and applicant_id = $2";
        values.push(params.userId);
    }

    result = await db.query(sql, values);

    if (result.error) { throw result.error; }

    if (!result.data.length) {
        throw new VError(409, 'Permissão negada.');
    }

    const requestData = result.data[0];

    cartoData.type = setType(requestData.finished, requestData.code)

    return { error: null, data: [cartoData], total: 1 };
}

export default async function (req, res, next) {
    console.log("> Request: Get bbox");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            vectorial: body.vectorial,
            cartographyId: body.cartographyId,
            userId: user.id,
            userGroup: user.group
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