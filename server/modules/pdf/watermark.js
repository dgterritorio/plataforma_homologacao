const { execSync } = require('child_process');

function applyTextWatermark(inpath, outpath, text) {
    let res = null;

    try {
        res = execSync(`convert -density 300 -define pdf:fit-page=A4 '${inpath}' -undercolor grey -gravity NorthEast -annotate 0 '${text}' '${outpath}'`)
    } catch (e) {
        console.log("> Error using convert to pdf: ", e);
    } finally {
        return res;
    }
}

module.exports = {
    applyTextWatermark: applyTextWatermark
}