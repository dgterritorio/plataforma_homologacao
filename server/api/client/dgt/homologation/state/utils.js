const { createFolderHierarchy, shareFolder, unshareFolder } = require(__basedir + 'modules/nextcloud/main');

async function revokeNextcloudAccess(db, params) {
    let result;
    let sql;

    const requestId = params.requestId;

    result = await db.query('select vectorial from homologation.requests where id = $1', [requestId]);

    if (result.error || !result.data.length) {
        return result.error;
    }

    const vectorial = result.data[0].vectorial;

    sql = 'select id, upload_link_id from homologation.' + (vectorial ? 'request_vectorial' : 'request_image') + ' where request_id = $1';

    result = await db.query(sql, [requestId])

    if (result.error || !result.data.length) {
        return result.error;
    }

    const cartography = result.data[0];

    const uploadLinkId = cartography.upload_link_id;
    const cartoId = cartography.id;

    // TODO: Não devia de chegar aqui a null, com exceção do estado 8 -> 50
    if (uploadLinkId === undefined || uploadLinkId === null) {
        console.log("   [WARN] Nextcloud link was null");
        console.log("       State: ", params ? params.stateId : '');

        return { error: null };
    }

    const error = await unshareFolder(uploadLinkId);

    // if (error) {
    //     throw error;
    // }

    sql = 'update homologation.' + (vectorial ? 'vectorial_carto' : 'imagery_carto');
    sql += ' set upload_link_id = null, upload_link = null, upload_password = null where id = ' + cartoId;

    result = await db.query(sql, [], { userId: params.userId });

    return result;
}

module.exports = {
    revokeNextcloudAccess: revokeNextcloudAccess
}