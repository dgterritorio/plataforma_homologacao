const util = require('util');
const multer = __multer;
const { checkSignature } = require(__basedir + 'modules/pdfSignature');
const { saveFile, createFolder } = require('./utils');

class Uploads {
    constructor(folder, fields) {
        this.middleware = null,
            this.folder = folder;
        this.fields = fields;
    }

    //[{ name: 'form', maxCount: 1 }, { name: 'doc1', maxCount: 1 }, { name: 'doc2', maxCount: 1 }, { name: 'doc3', maxCount: 1 }, { name: 'doc4', maxCount: 1 }]
    initialize() {
        const fields = this.fields,
            uploadFolder = this.folder;

        this.middleware = util.promisify(multer.fields(fields));

        this.folder = this.createUploadFolder(__basedir, uploadFolder);
    }

    createUploadFolder(base, path) {
        const parts = this.unnestPath(path);

        parts.forEach(function (part) {
            const partialPath = base + part;

            createFolder(partialPath);
        }, this)

        return base + path;
    }

    async parseUpload(req, res) {
        let error = null;

        try {
            error = await this.middleware(req, res);
        } catch (e) {
            return e;
        } finally {
            return error;
        }
    }

    unnestPath(path) {
        return path
            .split('/')
            .map((folder, position, folders) => `${folders.slice(0, position + 1).join('/')}`);
    }


    savePdfs(files, folder, verifySignatures) {
        const saved = [];
        const targetFolder = this.createUploadFolder(this.folder, folder);

        const keys = Object.keys(files);

        keys.forEach(function (key) {
            const arr = files[key];

            for (let i = 0; i < arr.length; i++) {

                const file = arr[i];

                let sigInfo = {};

                if (verifySignatures) {
                    sigInfo = checkSignature(file.path);
                    console.log("SIG: ", sigInfo)
                }

                const details = saveFile(targetFolder, file);

                details.type = key;
                details.signed = sigInfo.signed;
                details.sigName = sigInfo.name;


                saved.push(details);
            }
        }, this);

        return saved;
    }

    savePdf(key, files, folder, verifySignatures) {
        const saved = {};

        const targetFolder = this.createUploadFolder(this.folder, folder);

        if (!files[key]) {
            return null;
        }

        const arr = files[key];

        if (arr && Array.isArray(arr) && arr.length) {
            const file = arr[0];

            let sigInfo = {};

            if (verifySignatures) {
                sigInfo = checkSignature(file.path);
            }

            const details = saveFile(targetFolder, file);

            details.signed = sigInfo.signed;
            details.sigName = sigInfo.name;

            saved[key] = details;

            return saved;
        } else {
            return null;
        }
    }

    validateMimeType(file, expected) {

        if (!file) {
            return false;
        }

        return file.mimetype === expected;
    }
}


module.exports = {
    Uploads: Uploads
}