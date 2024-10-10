const libre = require('libreoffice-convert');
const fs = require('fs');

// Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
// function execShellCommand(cmd) {
//     return new Promise((resolve, reject) => {
//         exec(cmd, (error, stdout, stderr) => {
//             if (error) {
//                 console.warn(error);
//             }
//             resolve(stdout ? stdout : stderr);
//         });
//     });
// }

function execShellCommand(inFile, outdir) {
    return new Promise((resolve, reject) => {
        const file = fs.readFileSync(inFile);

        libre.convert(file, '.pdf', undefined, (err, done) => {
            if (err) {
                console.log(`Error converting file: ${err}`);
            }

            // fs.writeFileSync(outdir + 'ex.pdf', done);

            // Here in done you have pdf file which you can save or transfer in another stream
            resolve({ error: err, buffer: done });
        });
    });
}

async function toPDF(inFile, outDir) {
    // --headless
    //     return await execShellCommand('libreoffice --convert-to pdf ' + inFile + ' --outdir ' + outDir);
    return await execShellCommand(inFile, outDir);
}

module.exports = {
    toPDF: toPDF,
}