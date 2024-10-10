function genBaseFolder() {
    return global.App.serverConfig.fileUploadFolder + 'homologacao';
}

function genUploadFolder(applicantId, homologationId) {
    return '/u' + applicantId + '/r' + homologationId + '/';;
}

function genNextcloudFolder(applicantId, homologationId, version) {
    return '/homologacao/u' + applicantId + '/r' + homologationId + '/carto' + version + '/';
}

module.exports = {
    genBaseFolder: genBaseFolder,
    genUploadFolder: genUploadFolder,
    genNextcloudFolder: genNextcloudFolder
}
