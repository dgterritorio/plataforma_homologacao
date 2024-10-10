var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs');
var path = require('path');

var DocWhale = function () {

    // __dirname, input.docx, 'binary'
    // opens docx and returns the docxtemplater document
    var open = (file_name, dir, mode) => {
        //Load the docx file as a binary
        var content = fs
            .readFileSync(path.resolve(dir, file_name), mode);
        var zip = new PizZip(content);

        var doc = new Docxtemplater();
        doc.loadZip(zip);

        return doc;
    };

    // {first_name: 'John', last_name: 'Doe', phone: '0652455478', description: 'New Website'}
    var setTemplateData = (doc, replacements) => {
        //set the templateVariables
        doc.setData(replacements);

        return doc;
    };

    var renderDocument = (doc) => {
        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            var e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            }
            console.log(JSON.stringify({ error: e }));
            // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
            throw error;
        }
    };

    var writeDocument = (doc, file, dir) => {
        var buf = doc.getZip()
            .generate({ type: 'nodebuffer' });

        // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
        fs.writeFileSync(path.resolve(dir, file), buf);
    };

    this.compileDocument = (file_in, replacements) => {
        var doc = open(path.basename(file_in), path.dirname(file_in), 'binary');
        setTemplateData(doc, replacements);
        renderDocument(doc);

        return doc.getZip().generate({ type: 'nodebuffer' });
    }

    this.printDocument = (file_in, replacements, dir_out, file_out) => {
        var doc = open(path.basename(file_in), path.dirname(file_in), 'binary');
        setTemplateData(doc, replacements);
        renderDocument(doc);
        writeDocument(doc, file_out, dir_out);
    }
}

module.exports = DocWhale;
