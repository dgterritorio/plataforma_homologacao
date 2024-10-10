const db = require(__basedir + 'modules/db/base');
const nextcloud = require(__basedir + 'modules/nextcloud/main');

async function readdir(folder) {

    const files = await nextcloud.readDir(folder);

    console.log("Files: ", files);

    return files;
}

async function getRequestInfo(params) {
    let sql = "select upload_folder from homologation.";


    if (params.vectorial) {
        sql += "vectorial_carto ";
    } else {
        sql += "imagery_carto ";
    }

    sql += "where request_id = $1 and version = $2;";

    console.log(params, sql);

    let result = await db.query(sql, [params.requestId, params.version]);

    return result;
}

async function checkPermission(params) {
    const userGroup = params.userGroup;
    const userId = params.userId;
    const requestId = params.requestId;

    // If applicant
    if (userGroup === 2) {
        const sql = 'select * from homologation.requests where applicant_id = $1 and id = $2';

        const result = await db.query(sql, [userId, requestId]);

        if (result.error || !result.data.length) {
            return false
        }
    }

    return true;
}


async function process(params) {

    // Check permissions
    if (!await checkPermission(params)) {
        return { data: [], error: null, total: 0 };
    }

    const res = await getRequestInfo(params);

    if (res.error) {
        throw { error: res.error };
    }

    console.log("Processing: ", res, res.data);

    const carto = res.data[0];

    const folder = carto.upload_folder;

    console.log("Carto: ", carto)
    console.log("Got this folder: ", folder);

    const result = await readdir(folder);

    console.log("Got this folder: ", result);

    return { error: result.error, data: result.data, total: result.total };

}


export default async function (req, res, next) {
    console.log("> Request: Get document");
    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            vectorial: body.vectorial,
            requestId: body.requestId,
            version: body.version
        };

        let result = await process(params);

        if (!result || result.error) {
            //throw result.error;
            res.send({ error: 'Could not read nextcloud directory' });
        } else {
            res.send(result);
        }
    } catch (e) {
        next(e);
    }
}