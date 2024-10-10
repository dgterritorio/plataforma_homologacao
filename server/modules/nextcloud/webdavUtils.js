const webdav = require('webdav-client');
const util = require('util');


const request = util.promisify(webdav.Connection.prototype.request);
const mkdir = util.promisify(webdav.Connection.prototype.mkdir);
// const exists = util.promisify(webdav.Connection.prototype.exists);

function unnest(path) {
    return path
        .slice(1)
        .split('/')
        .map((folder, position, folders) => `/${folders.slice(0, position + 1).join('/')}`);
}

const exists = async function (conn, path) {
    const result = await request.call(conn, {
        url: path,
        method: 'PROPFIND',
        headers: {
            depth: '0'
        }
    });

    if (result) {
        return result.statusCode <= 400;
    } else {
        return null;
    }
}

function nextcloudRoot(url, username) {
    const lastUrlCharacterIsSlash = url.slice(-1)[0] === '/';

    const terminatedUrl = lastUrlCharacterIsSlash ? url : `${url}/`;

    return `${terminatedUrl}remote.php/dav/files/${username}`;
}

module.exports = {
    unnest: unnest,
    exists: exists,
    mkdir: mkdir,
    nextcloudRoot: nextcloudRoot
}