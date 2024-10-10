const { aquireTransaction } = require(__basedir + 'modules/db/base');
const emails = require(__basedir + '/modules/emails/main');
const baseUrl = global.App.url;
const { revokeNextcloudAccess } = require('./utils');

async function getRequestInfo(params) {
    const requestId = params.requestId,
        userId = params.userId,
        userGroup = params.userGroup,
        stateId = params.stateId,
        observations = params.observations;

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;
        // if (userGroup === 2) {
        //     // Check if we have permission for state transition
        //     result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

        //     if (result.error) {
        //         throw result.error;
        //     }

        //     if (!result.data.length) {
        //         return { data: [], error: null, total: 0 };
        //     }
        // }

        /**
         * Sanity check to avoid advancing state safelly
         */
        result = await db.query('select homologation.get_request_current_state_id($1) as state_id;', [requestId]);

        if (result.error) {
            throw result.error;
        }

        if (result.data[0].state_id !== stateId) {
            throw new VError(429, 'Cliente contém dados desatualizados. Deve refrescar a página de modo obter a versão mais recente dos dados do processo.')
        }


        let email, name;

        if (userGroup === 2) {
            // Check if we have permission for state transition
            result = await db.query('select applicant_id, name from homologation.requests where applicant_id = $1 and id = $2', [userId, requestId]);

            if (result.error) {
                await db.rollback();

                await db.release();

                throw result.error;
            }

            if (!result.data.length) {
                await db.rollback();

                await db.release();

                return { data: [], error: null, total: 0 };
            }
        } else if (userGroup === 4) {
            result = await db.query('select applicant_id, name from homologation.requests where id = $1', [requestId]);

            if (result.error) {
                throw result.error;
            }

            if (!result.data.length) {
                await db.rollback();

                await db.release();

                return { data: [], error: null, total: 0 };
            }
        }

        const requestRow = result.data[0];

        const applicant_id = requestRow.applicant_id;
        const requestName = requestRow.name;

        // Get email
        result = await db.query('select name, email from webapp.users where id = $1', [applicant_id]);

        const emailRow = result.data[0];

        email = emailRow.email;
        name = emailRow.name;

        // update last intervening
        const observations = params.observations;

        result = await db.query('update homologation.states set intervening_id = ' + userId + ', observations = \'' + observations + '\' where id = ' + stateId, [], { userId: params.userId });

        if (result.error) {
            throw result.error;
        }

        // Revoke nextclodu access
        await revokeNextcloudAccess(db, params);

        // Insert state!
        result = await db.query("insert into homologation.states(code, request_id, observations, intervening_id) values(homologation.predict_cancel_state($1), $1, $2, $3) returning code, start_date", [requestId, observations, userId], { userId: params.userId });

        if (result.error) {
            await db.rollback();

            await db.release();

            throw 'Error inserting cancelation state';
        }

        const insertData = result.data[0];

        const code = insertData.code;

        /**
         * Get state description
         */
        const stateRes = await db.query('select applicant_description as description, deadline, intervening from homologation.state_types where code = $1', [code]);

        if (stateRes.error) {
            throw stateRes.error;
        }

        const stateData = stateRes.data[0];

        const stateDescription = stateData.description;
        const stateStart = insertData.start_date;
        const stateStartStr = stateStart.toISOString().split('T')[0];

        const host = baseUrl;

        emails.send({
            userId: applicant_id,
            template: 'homologation-advance-' + code,
            email: email,
            subject: 'Cancellation',
            lang: 'pt',
            content: {
                start_date: stateStartStr,
                token: requestId,
                state: stateDescription,
                name: name,
                site: host,
                request_id: requestId,
                request_name: requestName
            }
        });

        if (result.error) {
            await db.rollback();

            await db.release();

            return result.error;
        }

        await db.commit();

        await db.release();

        return result;
    } catch (e) {
        if (db) {
            await db.rollback();

            await db.release();
        }

        return { error: e }
    }
}

export default async function (req, res, next) {
    console.log("> State: cancel");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            stateId: body.stateId,
            observations: body.observations ? body.observations : ''
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}