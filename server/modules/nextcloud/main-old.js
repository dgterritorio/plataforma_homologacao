const {Client, Server} = require("nextcloud-node-client");

let client = null;

async function initialize(params) {
    try {
        client = new Client(new Server(params));


        const quota = await client.getQuota();  

        console.log("> [NextCloudAPI] Initialized to:", params.url, "Quota: ", quota);

        return true;
    } catch (e) {
        console.log("> [NextCloudAPI] Error initializing nextcloud...", e);

        return false;
    }
}

/**
 * Create folder/folders if not existing
 * @param {structure path} path 
 */
async function createFolderStructure(path) {
    try {
        const folder = await client.createFolder(path);

        return folder;
    } catch (e) {
        console.log("> [NextCloudAPI] Error creating folder structure...", e);

        return null;
    }
}

/**
 * Shares a folder and returns the sharing link
 * @param {*} folder: folder to share
 * @param {*} password: password for the share
 */
async function shareFolder(folder, password, expiration) {
    try {
        const share = await client.createShare({ fileSystemElement: folder, publicUpload: true });

        if (password) {
            await share.setPassword(password);
        }

        if (expiration) {
            await share.setExpiration(expiration);
        }

        // use the url to access the share 
        const shareLink = share.url;
        const shareId = share.id;

        return { url: shareLink, id: shareId, password: password };
    } catch (e) {
        console.log("> [NextCloudAPI] Error creating share link...", e);

        return null;
    }
}

// Remove share folder
async function unshareFolder(shareId) {
    try {
        await client.deleteShare(shareId);

        return true;
    } catch (e) {
        console.log("> [NextCloudAPI] Error creating share link...", e);

        return false;
    }
}


module.exports = {
    initialize: initialize,
    createFolderStructure: createFolderStructure,
    shareFolder: shareFolder,
    unshareFolder: unshareFolder
}