const transport = require(__basedir + 'modules/emails/transport.js');
const db = require(__basedir + 'modules/db/base.js');

async function fetchTemplate(template) {

    try {
        const result = await db.query('select id, subject, html, text from notifications.templates where template_key = $1', [template]);
        if (!result.error && result.data.length > 0) {
            return result.data[0];
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

async function fetchEmail(userId) {

    try {
        const result = await db.query('select email from webapp.users where id = $1', [userId]);

        if (!result.error && result.data.length > 0) {
            return result.data[0];
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

async function fetchMessage(emailId) {
    try {
        const result = await db.query('select * from notifications.messages where id = $1', [emailId]);

        if (!result.error && result.data.length > 0) {
            return result.data[0];
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}


async function createEntry(params) {
    try {
        const values = [
            params.userId,
            params.senderEmail,
            params.email,
            params.subject,
            params.renderedHtml,
            params.renderedText,
            params.templateId
        ];

        const result = await db.query('insert into notifications.messages(user_id, from_contact, to_contact, subject, html, text, template_id) values($1,$2,$3,$4,$5,$6,$7) returning id;', values);

        if (!result.error && result.data.length > 0) {
            return result.data[0];
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

async function updateDate(values) {
    const emailId = values.emailId;

    try {
        return await db.query('update notifications.messages set send_date = now() where id = $1 returning send_date', [emailId]);
    } catch (e) {
        return { error: 'Fail to update send date' };
    }
}

async function send(params) {
    let { template, content, email, userId } = params;
    let row;

    // Fetch email if no contact is provided
    if (!email) {
        row = await fetchEmail(userId);

        if (!row) {
            return { error: 'Fail to get user info' }
        }

        params.email = row.email;
    }

    // Get from email
    const senderEmail = transport.getFrom();

    params.senderEmail = senderEmail;

    // Fetch html/text templates if the template key is provided
    if (template) {
        row = await fetchTemplate(template);

        if (!row) {
            return { error: 'Fail to fetch email template' }
        }

        html = row.html;
        text = row.text;

        // Render Templates
        params.templateId = row.id;
        params.subject = row.subject;
        params.renderedHtml = await transport.renderTemplate(html, content);
        params.renderedText = await transport.renderTemplate(text, content);
    }

    // Add Email entry to db
    row = await createEntry(params);

    // If fail, return
    if (!row) {
        return { error: 'Fail to create email entry' }
    }

    const emailId = row.id;

    // Send email!
    const wasSent = await transport.sendEmail(params);


    if (!wasSent) {
        return { error: 'Fail to send email' }
    }

    // Update send date
    result = await updateDate({
        emailId: emailId
    });

    return result;
}

async function sendUnregistered(params) {
    let { template, content, email } = params;
    let row;

    // Get from email
    const senderEmail = transport.getFrom();

    params.senderEmail = senderEmail;

    // Fetch html/text templates if the template key is provided
    if (template) {
        row = await fetchTemplate(template);

        if (!row) {
            return { error: 'Fail to fetch email template' }
        }

        html = row.html;
        text = row.text;

        // Render Templates
        params.templateId = row.id;
        params.subject = row.subject;
        params.renderedHtml = await transport.renderTemplate(html, content);
        params.renderedText = await transport.renderTemplate(text, content);
    }

    // Send email!
    return await transport.sendEmail(params);
}

async function resend(params) {
    let { emailId } = params;
    let row;

    // Add Email entry to db
    row = await fetchMessage(emailId);

    // If fail, return
    if (!row) {
        return { error: 'Fail to get email' }
    }

    const emailInfo = {
        userId: row.user_id,
        email: row.to_contact,
        subject: row.subject,
        renderedHtml: row.html,
        renderedText: row.text,
        templateId: row.template_id
    };


    // Send email!
    const wasSent = await transport.sendEmail(emailInfo);

    if (!wasSent) {
        return { error: 'Fail to send email' }
    }


    // Update send date
    return await updateDate({
        emailId: emailId
    });
}


module.exports = {
    send: send,
    resend: resend,
    sendUnregistered: sendUnregistered
}



