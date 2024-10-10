const { v4 } = require('uuid');

const db = require(__basedir + 'modules/db/base');
const { createFolder } = require(__basedir + 'modules/upload/utils');
const DocWhale = require(__basedir + 'modules/docxtemplater/docwhale.js');
const docx2pdf = require(__basedir + 'modules/docxtemplater/docx2pdf.js');

const tplPath = __basedir + 'templates/documents/client/';
const printPath = __basedir + 'prints/';

function makeDir(base, path) {
    const endsSlash = path.endsWith('/');
    const parts = path.split('/');

    let fullPath = base;

    const len = endsSlash ? parts.length - 1 : parts.length;

    for (let i = 0; i < len; i++) {
        fullPath += parts[i] + '/';

        createFolder(fullPath);
    }

    return fullPath;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function getRequestInfo(params) {
    return await db.query("select designation, file_path from printing.doc_template where key = $1;", [params.template]);
}

function getTodayDate() {

    let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }

    if (day.length < 2) {
        day = '0' + day;
    }

    return [day, month, year].join('-');
}

export default async function (req, res, next) {
    try {
        console.log("> Download document");

        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            template: body.template,
            record: body.record
        };

        // console.log(params)

        let result = await getRequestInfo(params);

        if (result.error) {
            throw result.error;
        }
        // console.log(result.data[0])

        const splitter = randomIntFromInterval(1, 100);

        const convertionFolder = makeDir(printPath, 'documents/' + splitter + '/');

        const uuid = v4();

        const docName = uuid + '.docx';

        const template = result.data[0];

        const path = tplPath + template.file_path;
        const designation = template.designation + '.pdf';

        params.record['today_date'] = getTodayDate();

        const printer = new DocWhale();
        printer.printDocument(path, params.record, convertionFolder, docName);

        // const isConverted = await docx2pdf.toPDF(convertionFolder + docName, convertionFolder);
        const { error, buffer } = await docx2pdf.toPDF(convertionFolder + docName, convertionFolder);

        if (error) {
            throw error;
            // res.send({ error: 'Could not generate pdf document' });

            // return;
        }

        res.setHeader('Content-Length', Buffer.byteLength(buffer))//stat.size);
        res.setHeader('Content-Disposition', 'attachment; filename=' + designation)
        res.setHeader('Content-Type', 'application/pdf');
        res.send({ data: [{ stream: buffer.toString('base64'), name: designation }], error: null, total: 1 });
    } catch (e) {
        next(new VError(409, 'Erro ao gerar documento. Por favor tente mais tarde.'));
    }
}