const { NextcloudClient, OcsSharePermissions, OcsShareType } = require("nextcloud-link");
const webdav = require('webdav-client');
const { exists, mkdir, unnest, nextcloudRoot } = require('./webdavUtils');
const { file } = require("nconf");

let client = null;
let auxClient = null;

async function initialize(params) {
    try {
        client = new NextcloudClient(params);

        auxClient = new webdav.Connection({
            url: nextcloudRoot(params.url, params.username),
            authenticator: new webdav.BasicAuthenticator(),
            username: params.username,
            password: params.password
        })

        const connectivity = await client.checkConnectivity();

        // const quota = await client.getQuota();  
        console.log("> [NextCloudAPI] Initialized to:", params.url);
        console.log("                 Connection: ", connectivity);

        return connectivity;
    } catch (e) {
        console.log("> [NextCloudAPI] Error initializing nextcloud...", e.message);

        return false;
    }
}


/**
 * Creates folder if does not exists
 * @param {*} path 
 */
async function createFolder(path) {
    try {
        const exist = await exists(auxClient, path);

        if (!exist) {
            await mkdir.call(auxClient, path);
        }

        return null;
    } catch (e) {
        return e;
    }
}

/**
 * Create folder/folders if not existing
 * @param {structure path} path 
 */
async function createFolderHierarchy(path) {
    try {
        const paths = unnest(path);

        for (const saneSubfolder of paths) {
            let error = await createFolder(saneSubfolder);

            if (error) {
                throw error;
            }
        }
    } catch (e) {
        console.log("> [NextCloudAPI] Create folder hierarchy: ", e.message);

        return e.message;
    }
}

/**
 * Shares a folder and returns the sharing link
 * @param {*} folder: folder to share
 * @param {*} password: password for the share
 */
async function shareFolder(params) {
    try {
        // folder to share
        const path = params.path;

        /**
         *  Type of Share: 
         *      user = 0;
         *      group = 1;
         *      publicLink = 3;
         *      federatedCloudShare = 6
         */
        const type = params.type ? params.type : 3;

        // User/group to share with
        const target = params.shareWith ? params.shareWith : '';

        /**
         * Permissions:
         * default = -1,
         * read    =  1,
         * update  =  2,
         * create  =  4,
         * delete  =  8,
         * share   = 16,
         * all     = 31,
         */
        const permissions = params.permissions ? params.permissions : -1;

        // Password for the share
        const password = params.password ? params.password : null;

        // Allow public upload (upload without user)
        const publicUpload = params.publicUpload ? params.publicUpload : false;

        const shareDetails = await client.shares.add(path, type, target, permissions, password, publicUpload);

        // If the share link requires an expiration date
        if (params.expiration) {
            const date = params.expiration;

            const expirationDetails = await client.shares.edit.expireDate(info.id, date);
        }

        return shareDetails;
    } catch (e) {
        console.log("> [NextCloudAPI] Share folder: ", e.message);

        return null;
    }
}

// Remove share folder
async function unshareFolder(shareId) {
    try {
        await client.shares.delete(shareId);

        return null;
    } catch (e) {
        console.log("> [NextCloudAPI] Unshare folder: ", e.message);

        return e.message;
    }
}


async function addUser(params) {
    try {
        const userDetails = {
            userid: params.email,
            password: params.password,
            email: params.email,
            displayName: params.name,
            groups: params.groups,
            quota: params.quota ? params.quota : 0
            // language: params.lang
        }

        const created = await client.users.add(userDetails);

        return created ? null : 'Could not create user';
    } catch (e) {
        console.log("> [NextCloudAPI] Add user: ", e.message);

        return e.message;
    }
}

async function removeUser(userId) {
    try {
        const deleted = await client.users.delete(userId);

        return deleted ? null : 'Could not delete user';
    } catch (e) {
        console.log("> [NextCloudAPI] Delete user: ", e.message);

        return e.message;
    }
}

function getExtension(name) {
    if (!name || !name.length || name.indexOf('.') === -1) {
        return '';
    }

    const parts = name.split('.');

    return parts[parts.length - 1];
}

async function recursiveReadDir(dir) {
    try {

        let count = 0;

        const files = await client.getFolderFileDetails(dir);

        if (!files) {
            throw { error: 'Could not list files' }
        }

        const parsedFiles = files.map(f => { return { name: f.name, isDirectory: f.isDirectory, modified: f.lastModified } })

        for (let i = 0; i < parsedFiles.length; i++) {
            const file = parsedFiles[i];

            if (file.isDirectory) {
                const result = await recursiveReadDir(dir + file.name);

                if(result.error){
                    return {error: result.error};
                }

                const subfiles = result.data;
                const total = result.total;

                if (!subfiles) {
                    throw { error: 'Could not list files' }
                }

                count += total;

                file.children = subfiles
            } else {
                file.extension = getExtension(file.name);
            }

        }

        count += parsedFiles.length;

        return {error: null, data: parsedFiles, total: count };

    } catch (e) {
        console.log("> [NextCloudAPI] Error recursive readdir: ", e.message);

        return { error: 'Error reading directory' };
    }
}


async function readDir(dir) {
    try {
        // const files = await client.getFiles(dir);
        return await recursiveReadDir(dir);
    } catch (e) {
        console.log("> [NextCloudAPI] Error readir: ", e.message);

        return { error: 'Error reading directory' };
    }
}

// async function addGroup(groupId) {
//     try {
//         return await client.groups.add(groupdId);
//     } catch (e) {
//         console.log("> [NextCloudAPI] Error creating share link...", e);

//         return null;
//     }
// }


module.exports = {
    initialize: initialize,
    createFolderHierarchy: createFolderHierarchy,
    shareFolder: shareFolder,
    unshareFolder: unshareFolder,
    addUser: addUser,
    removeUser: removeUser,
    readDir: readDir
}