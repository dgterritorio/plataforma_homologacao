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
    let result;
    let vectorialIds;
    let imageryIds;
    // let sql = '';

    let onlyUser = params.onlyUser;
    let onlyFinished = params.onlyFinished;

    let sql = 'with carto as (select id, vectorial, finished, code, carto_id from homologation.request_states '

    if (onlyUser || onlyFinished) {
        sql += ' where ';
    }

    if (onlyUser) {
        sql += ' applicant_id = ' + params.userId + ' '
    }

    if (onlyFinished) {
        sql += onlyUser ? ' and finished = true ' : ' finished = true ';
    }

    sql += ' ) '

    sql += "select st_asgeojson(vc.bbox) as geom, area, st_perimeter(vc.bbox) as perimeter, c.finished, c.code ";
    sql += "from homologation.vectorial_carto vc, carto c ";
    sql += " where vc.bbox is not null and vc.id = c.carto_id and c.vectorial = true ";

    sql += " union all "

    sql += "select st_asgeojson(vc.bbox) as geom, area, st_perimeter(vc.bbox) as perimeter, c.finished, c.code ";
    sql += "from homologation.imagery_carto vc, carto c ";
    sql += " where vc.bbox is not null and vc.id = c.carto_id and c.vectorial = false ";

    result = await db.query(sql);

    if (result.error) {
        throw result.error;
    }

    const data = result.data;

    for (let i = 0; i < data.length; i++) {
        const d = data[i];

        d.type = setType(d.finished, d.code);
    }

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get bbox");
    try {
        const body = req.body;
        const user = res.locals.user;

        const params = {
            onlyUser: body.onlyUser,
            onlyFinished: body.onlyFinished,
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