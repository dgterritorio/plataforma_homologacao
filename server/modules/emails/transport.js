const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const ejs = require('ejs');

let smtpOptions = {
    host: null,
    port: null,
    tls: {
        rejectUnauthorized: false
    },
    debug: true,
    logger: true
};

let initialized = false;

let transport;
let from;

function initialize(opts) {
    try {
        smtpOptions.host = opts.host;
        smtpOptions.port = opts.port;
        smtpOptions.secure = opts.secure;

        if (opts.hasOwnProperty('auth') && opts.auth.user) {
            smtpOptions["auth"] = opts.auth;
        }

        const smtp = smtpTransport(smtpOptions);

        transport = nodemailer.createTransport(smtp);

        from = opts.from;

        console.log("> Email Transport Initialized with:\n", smtpOptions);

        initialized = true;
    } catch (e) {
        console.log("> [Error] Email Transport Initialization fail...");
    }
}

function getTransport() {
    return transport;
}

function getFrom() {
    return from;
}

async function sendEmailOld(templatesPath, email, subject, content) {
    // Send email!
    const html = await ejs.renderFile(templatesPath + '/html.ejs', content);
    const text = await ejs.renderFile(templatesPath + '/text.ejs', content);

    try {
        const emailRes = await transport.sendMail({
            from: from,
            to: email,
            subject: subject,
            html: html,
            text: text
        });

        if (emailRes.accepted.length) {
            return true;
        } else {
            return false;
        }

    } catch (e) {
        console.log("> [Error] Sending email to " + email + " fail...", e);
        return false;
    }
};

async function renderTemplate(template, content) {
    return await ejs.render(template, content);
}

async function sendEmail(params) {
    let { html, renderedHtml, text, renderedText, email, subject, content } = params;

    // Render html if not renderer
    if (!renderedHtml && !!html) {
        renderedHtml = await ejs.render(html, content);
    }

    // Render text if not renderer
    if (!renderedText && !!text) {
        renderedText = await ejs.render(text, content);
    }

    try {
        const emailRes = await transport.sendMail({
            from: from,
            to: email,
            subject: subject,
            html: renderedHtml,
            text: renderedText
        });

        if (emailRes.accepted.length) {
            return true;
        } else {
            return false;
        }

    } catch (e) {
        console.log("> [Error] Sending email to " + email + " fail...", e);
        return false;
    }
};

module.exports = {
    getTransport: getTransport,
    getFrom: getFrom,
    renderTemplate: renderTemplate,
    sendEmail: sendEmail,
    initialize: initialize
}