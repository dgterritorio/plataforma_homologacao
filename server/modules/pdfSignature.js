const { execSync } = require('child_process');

const cfgPath = global.App.serverConfig.pdfsig;

const pdfsig = cfgPath ? cfgPath : 'pdfsig'; //__dirname + '/poppler/pdfsig';

// Poppler 0.87
const nameRegex = /- Signer Certificate Common Name:\ (\[Assinatura Qualificada\]\ )?([\w\d\ ]+)/;

function getSigName(text) {

    const match = nameRegex.exec(text);

    if (Array.isArray(match) && match.length > 2) {
        return match[2];
    } else {
        return null;
    }
}

function parseInfo(text) {
    let name = getSigName(text);

    return name;
}

function checkSignature(pdfPath) {

    let sigInfo = {
        signed: false
    };

    try {
        const res = execSync(pdfsig + ' ' + pdfPath);

        name = parseInfo(res.toString());

        sigInfo.name = name;
        sigInfo.signed = true;

    } catch (e) {
        console.log("> PDF Error: ");
    }

    return sigInfo;
}

module.exports = {
    checkSignature: checkSignature
}