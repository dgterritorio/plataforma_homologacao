function genBaseFolder() {
    return global.App.serverConfig.fileUploadFolder + 'producers';
}

function genUploadFolder(producerId) {
    return '/r' + producerId + '/';
}

module.exports = {
    genBaseFolder: genBaseFolder,
    genUploadFolder: genUploadFolder
}