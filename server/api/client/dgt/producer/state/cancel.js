const { aquireTransaction } = require(__basedir + 'modules/db/base');
const emails = require(__basedir + '/modules/emails/main');

const baseUrl = global.App.url;

async function getRequestInfo(params) {
    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        const requestId = params.requestId,
            stateId = params.stateId,
            userId = params.userId,
            userGroup = params.userGroup,
            observations = params.observations;
        let
            email;
        let name, login_hash, entityUserId;

        let result;

        if (userGroup === 5) {
            // Check if we have permission for state transition
            result = await db.query('select * from producers.entities where user_id = $1 and id = $2', [params.userId, params.requestId]);

            if (result.error) {
                throw result.error;
            }

            if (!result.data.length) {

                db.rollback();

                db.release();

                return { data: [], error: null, total: 0 };
            }

            const data = result.data;

            const entity = data[0];

            email = entity.email;
            login_hash = entity.login_hash;
            name = entity.name;
            entityUserId = entity.user_id;
        } else if (userGroup === 4) {
            result = await db.query('select * from producers.entities where id = $1', [requestId]);

            if (result.error) {
                throw result.error;
            }

            if (!result.data.length) {
                db.rollback();

                db.release();

                return { data: [], error: null, total: 0 };
            }

            const data = result.data;

            const entity = data[0];

            email = entity.email;
            login_hash = entity.login_hash;
            name = entity.name;
            entityUserId = entity.user_id;
        }

        /**
         * Sanity check to avoid advancing state safelly
         */
        result = await db.query('select state_id from producers.entity_states where id = $1;', [requestId]);

        if (result.error) {
            throw result.error;
        }

        if (result.data[0].state_id !== stateId) {
            throw new VError(429, 'Cliente contém dados desatualizados. Deve refrescar a página de modo obter a versão mais recente dos dados do processo.')
        }

        result = await db.query("insert into producers.states(code, entity_id, observations, intervening_id) values(producers.predict_cancel_state($1), $1, $2, $3) returning code, start_date;", [requestId, observations, userId], { userId: params.userId });

        if (result.error) {
            throw result.error;
        }

        const data = result.data[0];

        const code = data.code;

        /**
         * Get state description
         */
        const stateRes = await db.query('select applicant_description as description, deadline, intervening from producers.state_types where code = $1', [data.code]);

        if (stateRes.error) {
            throw stateRes.error;
        }

        const stateData = stateRes.data[0];

        const stateStart = new Date(data.start_date);
        const stateStartStr = stateStart.toISOString().split('T')[0];
        const stateDescription = stateData.description;

        const host = baseUrl;


        const content = {
            start_date: stateStartStr,
            token: login_hash,
            state: stateDescription,
            name: name,
            site: host
        };

        emails.send({
            userId: entityUserId,
            template: 'producer-advance-' + data.code,
            email: email,
            subject: 'Registo por Comunicação Prévia: Cancelmento de Registo',
            content: content
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

        return { error: e };
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
            observations: body.observations ? body.observations : null,
        };

        console.log(params);

        if(params.requestId === -1){
            throw new VError(409, 'Permissão Negada');
        }

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send(result);
    } catch (e) {
        next(e);
    }
}