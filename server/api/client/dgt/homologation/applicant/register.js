import VError from '../../../../../modules/errors/verror';

const db = require(__basedir + 'modules/db/base');
const emails = require(__basedir + 'modules/emails/main')
const crypto = require('crypto');

const baseUrl = global.App.url;


async function getRequestInfo(params) {

    console.log('--db user.authenticate');

    // User info
    const name = params.name,
        email = params.email,
        password = params.password,
        vat = params.vat,

        address = params.address,
        phone = params.phone,
        locality = params.locality,
        zipcode = params.zipcode;


    // Check if user exists
    const emailExists = await db.query("SELECT id, active FROM webapp.users WHERE email = $1", [email]);

    if (emailExists.error) {
        throw emailExists.error;
    }

    if (emailExists.data.length) {
        const isActive = emailExists.data[0].active;

        const userExistsMsg = isActive ?
            'O email ' + email + ' já se encontra em uso' :
            'O email ' + email + ' está associado a uma conta desativada. Por favor contacte a administração para a reativação.';

        return { error: new VError(409, userExistsMsg) };
    }

    // Generate buffer with random bytes
    const buf = await crypto.randomBytes(32);

    // Convert buffer to hex
    const token = buf.toString('hex');


    let sql = "insert into webapp.users(name, password, email, vat, locality, address, zipcode, phone, active, confirmed, token, group_id)"
    sql += "values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning id;";

    const group_id = 2;
    const active = false;
    const confirmed = false;

    const res = await db.query(sql, [name, password, email, vat, locality, address, zipcode, phone, active, confirmed, token, group_id]);

    if (res.error) {
        return { error: new VError(409, 'Erro ao criar utilizador') };
    }

    const data = res.data;

    const userId = data[0].id;

    // Get host for the confirmation link
    const host = baseUrl ? baseUrl : 'http://' + headerHost;

    const content = {
        name: name,
        token: token,
        site: host
    };

    // Send email to user
    emails.send({
        userId: userId,
        template: 'general-register',
        email: email,
        subject: 'Registration',
        lang: 'pt',
        content: content
    });

    return {
        data: [],
        error: null,
        total: 1
    };
}

export default async function (req, res, next) {
    console.log("> Request: Get document");
    try {
        const userInfo = res.locals.user;

        const body = req.body;

        const params = {
            name: body.name,
            email: body.email,
            password: body.password,
            vat: body.vat,

            address: body.address,
            phone: body.phone,
            locality: body.locality,
            zipcode: body.zipcode,
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}