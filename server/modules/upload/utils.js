const fs = require('fs');

/**
 * Creates folder if does not exist
 * @param {*} path 
 */
function createFolder(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

/**
 * Reads file from tmp_path and writes it to target_path
 * @param {*} tmp_path 
 * @param {*} target_path 
 */
function writeFile(tmp_path, target_path) {

    const bin = fs.readFileSync(tmp_path);

    fs.writeFileSync(target_path, bin);

    return;
}


/**
 * Receives a path and multer files and writes them to the target folder
 * @param {*} folder: folder path 
 * @param {*} files: multer files array
 */
function saveFiles(folder, files) {

    const info = [];

    try {
        files.forEach(function (file) {

            console.log("> Processing File: ", file);

            const original_name = file.originalname;
            const tmp_path = file.path;

            console.log("> Tmp path: ", tmp_path)

            let path = folder + file.filename.toLowerCase();

            console.log("> Writing into: ", + path);

            writeFile(tmp_path, path);

            fs.unlinkSync(tmp_path);

            info.push({
                name: original_name,
                path: path
            });
        });

        console.log("> ...done writing.")

        return info;
    } catch (e) {
        console.log("> [Error] Fail to write files...", e);

        return null;
    }
}


function saveFile(folder, file) {

    let info;

    try {
        console.log("> Processing File: ", file);

        const original_name = file.originalname;
        const tmp_path = file.path;

        console.log("> Tmp path: ", tmp_path)

        let path = folder + file.filename.toLowerCase();

        console.log("> Writing into: ", path);

        writeFile(tmp_path, path);

        fs.unlinkSync(tmp_path);

        info = {
            name: original_name,
            path: path
        };

        console.log("> ...done writing.");

        return info;
    } catch (e) {
        console.log("> [Error] Fail to write file...", e);

        return null;
    }
}

module.exports = {
    createFolder: createFolder,
    saveFile: saveFile,
    saveFiles: saveFiles,
    writeFile: writeFile
}