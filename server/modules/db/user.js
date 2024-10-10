const useragent = require('useragent');
const dnsPromises = require('dns').promises;
const crypto = require('crypto');
const { Client } = require('pg');
const db = require('./base');
const axios = require('axios');

const sha1 = require('crypto-js/sha1');
const md5 = require('crypto-js/md5');

const escapeLiteral = Client.prototype.escapeLiteral;

const table = 'webapp.users';
const sessionTable = 'webapp.sessions';
const baseUrl = global.App.url;
const ldap = global.App.ldap;
const hasLDAP = global.App.hasLDAP;

const emails = require(__basedir + 'modules/emails/main')


const getSqlOperator = function (op) {
    let sqlOperator = '';

    switch (op) {
        case 'eq':
        default:
            sqlOperator = '=';
            break;
    }

    return sqlOperator;
};

const getAgentInfo = async function (request) {
    let agent = useragent.parse(request.headers['user-agent']);
    let browser = agent.toAgent();
    let os = agent.os.toString();
    let device = agent.device.toString();
    let ip = (request.ip && request.ip.substr(0, 7) == "::ffff:") ?
        request.ip.substr(7) :
        request.ip;
    let domains = null;
    let host = null;
    try {
        // TODO: look into blocking and timeouts
        domains = await dnsPromises.reverse(ip);
        if (domains.length > 0) {
            host = domains[0];
        }
    } catch (err) {
        console.log('DNS reverse error: ' + err);
        host = err.code;
    }

    return { 'ip': ip, 'host': host, 'browser': browser, 'os': os, 'device': device }
}

/**
 * 
 * @param {*} user_id - integer
 * @param {*} memberships - array[integer]
 * @returns 
 */
async function insertUserMemberships(user_id, memberships) {
    try {
        if (!memberships || !memberships.length) {
            console.warn('[WARN] No ldap user memberships detected');

            return { data: [], total: 0, error: null };
        }

        let values = [];
        let placeholders = memberships.map((curr, i) => {
            values.push(user_id);
            values.push(curr);

            const fi = (i * 2) + 1;
            const si = (i * 2) + 2;

            return `($${fi},$${si})`
        });

        // console.log(values, placeholders)

        const res = await db.query(`insert into webapp.usermemberships(user_id, group_id) values ${placeholders.join(',')} returning user_id, group_id;`, values);

        if (res.error) {
            throw res.error;
        }

        return res;
    } catch (e) {
        console.log("[Error] Registering ldap user memberships", e);

        return null;
    }
}

/**
 * 
 * @param {*} user_id - integer
 * @param {*} profiles - {integer: array[integer], ...}
 * @returns 
 */
async function insertUserMembershipProfiles(user_id, profiles) {
    try {

        if (!profiles || !Object.keys(profiles).length) {
            console.warn('[WARN] No ldap user profiles detected');

            return { data: [], total: 0, error: null };
        }

        const membershipIds = Object.keys(profiles);

        let recordValues = [];

        for (let i = 0; i < membershipIds.length; i++) {
            const membershipId = membershipIds[i];

            const membershipProfiles = profiles[membershipId];

            for (let j = 0; j < membershipProfiles.length; j++) {
                recordValues.push({
                    user_id: user_id,
                    membership_id: membershipId,
                    profile_id: membershipProfiles[j]
                });
            }
        }

        let values = [];
        const placeholders = recordValues.map((curr, i) => {
            values.push(curr.user_id);
            values.push(curr.membership_id);
            values.push(curr.profile_id);

            const fi = (i * 3) + 1;
            const si = (i * 3) + 2;
            const ti = (i * 3) + 3;

            return `($${fi},$${si},$${ti})`
        });

        // console.log(values, placeholders)

        const res = await db.query(`insert into webapp.usermembership_profiles(user_id, group_id, profile_id) values ${placeholders.join(',')} returning user_id, group_id;`, values);

        if (res.error) {
            throw res.error;
        }

        return res;
    } catch (e) {
        console.log("[Error] Registering ldap user membership profiles", e);

        return null;
    }
}

module.exports = {
    get: async function (params) {
        console.log('--db user.get');

        const { userId, active } = params;

        const values = [userId, active]

        let sql = 'SELECT id, login, group_id, email, avatar, name, \
                address, locality, zipcode, vat, nic, gender, \
                collective, phone, obs, dicofre, gps, creation_date, \
                mod_date, last_login, active, confirmed, preferences, \
                st_x(gps) as longitude, st_y(gps) as latitude ';
        sql += ' from webapp.users ';
        sql += ' where id = $1 and active = $2';

        const result = await db.query(sql, values);

        if (result.error) {
            result.error = 'Erro ao obter utilizador';
        }

        return result;
    },

    reuseSession: async function (request) {
        console.log('--db user.reuseSession');

        if (!request.session || !request.session.userid || !request.session.id) {
            return { error: 'unauthorized access' }
        }

        const userid = request.session.userid;
        const groupid = request.session.groupid;
        const memberof = request.session.memberof;
        const sessionId = request.session.id;
        const lang = request.session.lang ? request.session.lang : 'en';

        console.log('   Session: ')
        console.log('       userId:', userid);
        console.log('     memberOf:', memberof);
        console.log('    sessionId:', sessionId);
        console.log('         lang:', lang);
        console.log('       maxAge:', request.session.cookie.maxAge)

        const agentInfo = await getAgentInfo(request);

        console.log('   Session user agent: ')
        console.log('         host:', agentInfo.host);
        console.log('           ip:', agentInfo.ip);
        console.log('       device:', agentInfo.device);
        console.log('           os:', agentInfo.os);
        console.log('      browser:', agentInfo.browser);

        // Update session sql
        const sessionSql = 'UPDATE ' + sessionTable +
            ' SET last_activity = now(), reused = reused+1 WHERE user_id = $1 AND session_id = $2;'

        // Update session
        const sessionRes = await db.query(sessionSql, [userid, sessionId]);

        // If error on updating session
        if (sessionRes.error) {
            res.error = 'alive server error';
            console.log(res.error);
        }

        return sessionRes;
    },

    checkUserExists: async function (params) {
        console.log('--db user.checkExists');

        let email = params.email.toLowerCase();

        const res = await db.query('select * from webapp.users where email = $1', [email]);

        const error = res.error;

        if (error || !res.data) {
            return false;//{ error: 'Erro no servidor' };
        }

        const data = res.data;

        if (!data.length) {
            return false;
        }

        return true;
    },

    checkActive: async function (request, params) {
        console.log('--db user.checkActive');

        let email = params.email.toLowerCase();

        const res = await db.query('select active from webapp.users where email = $1', [email]);

        const error = res.error;

        if (error || !res.data) {
            return false;//{ error: 'Erro no servidor' };
        }

        const data = res.data;

        if (!data.length) {
            return false;
        }

        return data[0].active;
    },

    checkActiveSession: async function (params) {
        console.log('--db user.checkActiveSession');

        const { userId, sessionId } = params;

        const values = [userId, sessionId];

        const res = await db.query('select ativo from webapp.sessions where user_id = $1 and session_id = $2', values);

        const error = res.error;

        if (error || !res.data) {
            return false;//{ error: 'Erro no servidor' };
        }

        const data = res.data;

        if (!data.length) {
            return false;
        }

        return data[0].ativo;
    },

    checkLoginType: async function (params) {
        console.log('--db user.checkActive');

        let email = params.email.toLowerCase();

        const res = await db.query('select loginsocial from webapp.users where email = $1', [email]);

        const error = res.error;

        if (error || !res.data) {
            return { error: 'Erro no servidor' };
        }

        const data = res.data;

        if (!data.length) {
            return true;
        }

        return data[0].loginsocial;
    },

    checkUserGroups: async function (request, params) {
        console.log('--db user.checkUserGroups');

        let user_id = params.user_id;

        const res = await db.query('select array_agg(group_id) as groups from webapp.usermemberships where user_id = $1', [user_id]);

        const error = res.error;

        const data = res.data;

        if (error || !data) {
            return [];
        }

        return data.length ? data[0].groups : [];
    },

    checkUserProfiles: async function (request, params) {
        console.log('--db user.checkUserProfiles');

        const user_id = params.user_id;

        const sql = 'with agg_profiles as ( ' +
            'select group_id, array_agg(profile_id) as profiles ' +
            'from webapp.usermembership_profiles ' +
            'where user_id = $1 ' +
            'group by group_id ' +
            ') ' +
            'select json_object_agg(group_id, profiles) as userprofiles ' +
            'FROM agg_profiles';

        const res = await db.query(sql, [user_id]);

        const error = res.error;

        const data = res.data;

        if (error || !data) {
            return {};
        }

        return data.length ? data[0].userprofiles : {};
    },

    checkUserPreferences: async function (params) {
        console.log('--db user.checkUserPreferences');

        const user_id = params.user_id;

        const sql = "select coalesce(preferences, '{}') as preferences from webapp.users where id = $1";

        const res = await db.query(sql, [user_id]);

        const error = res.error;

        const data = res.data;

        if (error || !data) {
            return {};
        }

        return data.length ? data[0].preferences : {};
    },

    authenticate: async function (request, params) {
        console.log('--db user.authenticate');

        let email = params.email.toLowerCase(),
            password = sha1(params.password).toString();

        // Lets get paranoid here (extra carefull because of LDAP logins)
        if (!password || password === null || password === undefined || password.length === 0) {
            return { error: 'Invalid login' };
        }

        // suporte aos utilizadores antigos da aplicação Plantas de Localização
        let verifica = 'email';
        if (email.search(/@/) == -1) {
            console.log('Utilizador antigo: ' + email);
            verifica = 'lower(login)';
            password = md5(params.password).toString();
        }

        // session info
        let remember = params.remember;
        let sessionId = null;
        if (request.session && request.session.id) {
            sessionId = request.session.id;
        }
        console.log('Session id: ' + sessionId);
        console.log('Session remember: ' + remember);

        let lang = 'en';
        if (request.session && request.session.lang) {
            lang = request.session.lang;
        }
        console.log('Session language: ' + lang);

        let agentInfo = await getAgentInfo(request)
        console.log('UserAgent detected: ' + agentInfo.ip, agentInfo.host,
            agentInfo.browser, agentInfo.os, agentInfo.device);

        // look for user
        let sql = 'SELECT id, group_id FROM ' + table;
        let where = " WHERE " + verifica + " = $1 AND password = $2 and active and confirmed and loginsocial IS NULL";
        sql += where;

        const res = await db.query(sql, [email, password]);
        if (!res.error) {
            if (res.total == 0) {
                res.error = 'invalid login';
            } else {
                // insert session info
                // This array has sessionValues.length + 2, but the last values are added manually in the sql string
                let sessionColumns = ['user_id', 'session_id', 'ip', 'host_name', 'browser', 'reused', 'login', 'last_activity', 'ativo'];
                let sessionValues = [res.data[0].id, sessionId, agentInfo.ip, agentInfo.host, agentInfo.browser, 0];
                let sessionParams = [];
                sessionValues.forEach((element, index) => {
                    sessionParams.push('$' + (index + 1));
                });
                let sessionSql = 'INSERT INTO ' + sessionTable + ' (' + sessionColumns.join() + ')'
                    + ' VALUES (' + sessionParams.join() + ', now(), now(), true' + ')';

                const sessionRes = await db.query(sessionSql, sessionValues);
                if (!sessionRes.error) {
                    if (remember) {
                        request.session.cookie.maxAge = 1 * 24 * 60 * 60 * 1000;
                    }
                } else {
                    res.error = 'login server error';
                    console.log(res.error);
                }
            }
        }

        return res;
    },

    authenticateLDAP: async function (req, params) {
        console.log('--db user.authenticate.ldap');

        if (!hasLDAP) {
            console.log("!hasLDAP")
            return { error: 'Invalid login. Trying to authenticate via LDAP with no LDAP servers defined' };
        }

        let username = params.email.toLowerCase(),
            password = params.password;

        // session info
        let remember = params.remember;
        let sessionId = null,
            lang = 'en';

        const session = req.session;

        if (session && session.id) {
            sessionId = session.id;
            lang = session.lang ? session.lang : 'en';
        }

        console.log('Session id: ' + sessionId);
        console.log('Session remember: ' + remember);
        console.log('Session language: ' + lang);

        const agentInfo = await getAgentInfo(req)
        console.log('UserAgent detected: ' + agentInfo.ip, agentInfo.host,
            agentInfo.browser, agentInfo.os, agentInfo.device);


        if (!ldap) {
            return { error: 'LDAP is not configured' };
        }

        let { host, port } = ldap;

        if (!host.startsWith('http')) {
            host = 'http://' + host;
        }

        // Authenticate user to ldap
        let auth = await axios.post(`${host}:${port}/authenticate`, {
            username: username,
            password: password
        });

        if (!auth) {
            return { error: 'Error in log in' };
        }

        const body = auth.data;

        if (body.error || !body.data) {
            return { error: 'Invalid login' };
        }

        const { name, email, group_id, memberships, profiles } = body.data;
        const ldaphost = body.data.host;

        const sql = 'select id, group_id, active, confirmed from ' + table + " WHERE email = $1 and loginsocial = 'ldap'",
            values = [email];

        const res = await db.query(sql, values);

        if (res.error) {
            return { error: 'Error getting user' };
        }

        const data = res.data;

        let user;

        if (data.length) {
            user = data[0];
        } else {
            const insertResult = await db.query('insert into ' + table + "(name, email, group_id, active, confirmed, loginsocial, obs) values($1, $2, $3, $4, $5, $6, $7) returning id, group_id", [name ? name : username, email, group_id, true, true, 'ldap', ldaphost]);

            if (insertResult.error) {
                return { error: 'Error inserting user' };
            }

            user = insertResult.data[0];

            // Add user memberships
            await insertUserMemberships(user.id, memberships);

            // Add profiles
            await insertUserMembershipProfiles(user.id, profiles);
        }

        // insert session info
        let sessionColumns = ['user_id', 'session_id', 'ip', 'host_name', 'browser', 'reused', 'login', 'last_activity', 'ativo'];
        let sessionValues = [user.id, sessionId, agentInfo.ip, agentInfo.host, agentInfo.browser, 0];
        let sessionParams = [];
        sessionValues.forEach((element, index) => {
            sessionParams.push('$' + (index + 1));
        });
        let sessionSql = 'INSERT INTO ' + sessionTable + ' (' + sessionColumns.join() + ')'
            + ' VALUES (' + sessionParams.join() + ', now(), now(), true' + ')';

        const sessionRes = await db.query(sessionSql, sessionValues);

        if (sessionRes.error) {
            return { error: 'Error inserting session' };
        }

        if (remember) {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
        }

        return { data: [{ id: user.id, group_id: user.group_id }], error: null, total: 1 };
    },

    deauthenticate: async function (request) {
        console.log('--db user.deauthenticate');

        let userid = '';
        if (request.session && request.session.userid) {
            userid = request.session.userid;
        }
        console.log('Session userid: ' + userid);

        let sessionId = null;
        if (request.session && request.session.id) {
            sessionId = request.session.id;
        }
        console.log('Session id: ' + sessionId);

        let lang = 'en';
        if (request.session && request.session.lang) {
            lang = request.session.lang;
        }
        console.log('Session language: ' + lang);

        let agentInfo = await getAgentInfo(request)
        console.log('UserAgent detected: ' + agentInfo.ip, agentInfo.host,
            agentInfo.browser, agentInfo.os, agentInfo.device);

        // increment session counter
        let sessionSql = 'UPDATE ' + sessionTable +
            ' SET logout = now(), ativo = false WHERE user_id = $1 AND session_id = $2;'

        const sessionRes = await db.query(sessionSql, [userid, sessionId]);
        if (sessionRes.error) {
            res.error = 'alive server error';
            console.log(res.error);
        }

        return sessionRes;
    },

    register: async function (params) {
        console.log('--db user.authenticate');

        // User info
        const name = params.name,
            password = params.password,
            email = params.email.toLowerCase();

        // Request info
        const userid = params.userid,
            sessionLang = params.lang,
            userAgent = params.agent,
            headerHost = params.host;


        console.log('registration: request.session.userid = ' + userid);
        console.log('registration: request.session.lang = ' + sessionLang);

        let lang = 'en';
        if (sessionLang) {
            lang = sessionLang;
        }
        console.log('Language: ' + lang + ' request.session.lang=' + sessionLang);


        console.log('TODO: Session ID = ');// + sessionID);
        const agent = useragent.parse(userAgent);
        const browser = agent.toAgent();
        const os = agent.os.toString();
        const device = agent.device.toString();
        console.log('Useragent detected: ' + browser, os, device);
        console.log(agent)

        // Check if user exists
        const emailExists = await db.query("SELECT id FROM " + table + " WHERE email = '" + email + "'");
        console.log(emailExists)

        if (emailExists.error) {
            return {
                error: 'Database error'
            }
        } else if (emailExists.data.length) {
            return {
                error: 'The email ' + email + ' is already in use'
            }
        }

        // Generate buffer with random bytes
        const buf = await crypto.randomBytes(32);

        // Convert buffer to hex
        const token = buf.toString('hex');

        // look for user
        const campos = ['name', 'password', 'email', 'active', 'confirmed', 'token', 'group_id'];
        let sql = "INSERT INTO " + table + " (" + campos.join() + ")";
        sql += " SELECT " + escapeLiteral(name) + ", " + escapeLiteral(password) + ", " + escapeLiteral(email) + ", false, false, " + escapeLiteral(token) + ", min(id)";
        sql += " from webapp.usergroups where omission";
        sql += " RETURNING id;";
        console.log('--sql inserirNovoUtilizador: ' + sql);

        const res = await db.query(sql);

        if (res.error) {
            return {
                error: 'Database error'
            }
        }

        // Get host for the confirmation link
        const host = baseUrl ? baseUrl : 'http://' + headerHost;

        const content = {
            name: name,
            token: token,
            site: host
        };

        // Send email to user
        // const emailSent = await sendEmail('registration', email, 'Registration', lang, content);

        const emailSent = await emails.send({
            userId: null,
            template: 'general-register',
            email: email,
            subject: 'Registration',
            lang: 'pt',
            content: content
        });

        // if (!emailSent) {
        //     throw 'Could not send the email';
        // }


        if (!emailSent) {
            return {
                error: 'Email error'
            }
        } else {
            return {
                error: null
            };
        }
    },

    confirmEmail: async function (token) {
        // console.log(request);
        // console.log(request.session);
        // console.log(request.session.userid);
        // console.log(request.session.lang);

        // let lang = 'en';
        // if (request.session && request.session.lang) {
        //     lang = request.session.lang;
        // }
        // console.log('Language: ' + lang + ' request.session.lang=' + request.session.lang);

        let sql = "select * from " + table + " where token = '" + token + "'";
        console.log('SQL=' + sql);

        let res = await db.query(sql);

        if (res.error) {
            return {
                error: 'Database error'
            }
        } else if (!res.data.length) {
            return {
                error: 'Invalid token'
            }
        }

        // console.log('Pedido existe. Utilizador: ' + res.rows[0].nome + ' → ' + res.rows[0].email);

        // TODO: login after confirm
        let active = true;

        let sqlupdate = "UPDATE " + table + " SET mod_date = now(), confirmed = true, active = " + active + ", token=null ";
        sqlupdate += " where token = '" + token + "'";

        res = await db.query(sqlupdate);

        console.log("Result: ")
        console.log(res)

        if (res.error || !res.total) {
            return {
                error: 'Database error'
            }
        } else {
            return {};
        }
    },

    pwdreset: async function (params) {

        const email = params.email.toLowerCase();

        // Request info
        const sessionLang = params.lang,
            userAgent = params.agent,
            headerHost = params.host;

        var agent = useragent.parse(userAgent);
        var browser = agent.toAgent();
        var os = agent.os.toString();
        var device = agent.device.toString();
        console.log('Useragent detected: ' + browser, os, device);

        var lang = 'en';
        if (sessionLang) {
            lang = sessionLang;
        }

        console.log('Language: ' + lang + ' request.session.lang=' + sessionLang);

        let sql,
            res;

        // se existe e se já terminou o processo de registo!
        sql = "SELECT name FROM " + table + " WHERE email = '" + email + "' and active and confirmed";
        console.log('SQL=' + sql);

        res = await db.query(sql);
        console.log(res)

        // If valid user
        if (res.error) {
            return {
                error: 'Database error'
            }
        } else if (!res.data.length) {
            return {}
        }

        const name = res.data[0].name;

        // Generate buffer with random bytes
        const buf = await crypto.randomBytes(32);

        // Convert buffer to hex
        const token = buf.toString('hex');

        sql = "UPDATE " + table + " SET token = '" + token + "', mod_date = now() where email = '" + email + "'";

        res = await db.query(sql);
        console.log(res)

        // If token was set
        if (res.error || !res.total) {
            return {
                error: 'Database error'
            }
        }

        // Get host for the confirmation link
        const host = baseUrl ? baseUrl : 'http://' + headerHost;

        const content = {
            name: name,
            site: host,
            token: token
        }

        // Send email to user
        // const emailSent = await sendEmail('reset', email, 'Password reset', lang, content);

        const emailSent = await emails.send({
            userId: null,
            template: 'general-pwdreset',
            email: email,
            subject: 'Password reset',
            lang: 'pt',
            content: content
        });

        if (!emailSent) {
            return {
                error: 'Email error'
            }
        } else {
            return {
                error: null
            };
        }
    },

    pwdchange: async function (token, password) {

        let sql = "select * from " + table + " where token = '" + token + "'";
        console.log('SQL=' + sql);

        let res = await db.query(sql);

        if (res.error) {
            return {
                error: 'Database error'
            }
        } else if (!res.data.length) {
            return {
                error: 'Invalid token'
            }
        }

        sql = "update " + table + " set mod_date = now(), password = '" + password + "', token=null ";
        sql += " where token = '" + token + "'";

        res = await db.query(sql);

        console.log("Result: ")
        console.log(res)

        if (res.error || !res.total) {
            return {
                error: 'Database error'
            }
        } else {
            return {};
        }

    }
}
