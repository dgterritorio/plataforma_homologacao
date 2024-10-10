const { aquireTransaction } = require(__basedir + 'modules/db/base');
const emails = require(__basedir + '/modules/emails/main');

const baseUrl = global.App.url;

async function executeStateOperations(params) {
    const code = params.code;

    switch (code) {
        case 1:
        case 2:
        case 3:
        case 4:
            break;
    }
}

async function getRequestInfo(params) {

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        const userId = params.userId;
        const userGroup = params.userGroup;
        const requestId = params.requestId;
        let email;
        let login_hash, name, entityUserId;

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


        const stateId = params.stateId;
        const advance = params.advance;
        const observations = params.observations;


        /**
         * Sanity check to avoid advancing state safelly
         */
        result = await db.query('select state_id from producers.entity_states where id = $1;', [requestId]);

        if (result.error) {
            throw result.error;
        }

        if(result.data[0].state_id !== stateId){
            throw new VError(429, 'Cliente contém dados desatualizados. Deve refrescar a página de modo obter a versão mais recente dos dados do processo.')
        }

        result = await db.query('update producers.states set intervening_id = ' + userId + ', observations = \'' + observations + '\' where id = ' + stateId, [], { userId: params.userId });

        if (result.error) {
            throw result.error;
        }

        const sql = "insert into producers.states(code, entity_id) values(producers.predict_next_state($1, $2),$1) returning id, code, start_date;";

        result = await db.query(sql, [requestId, advance], { userId: params.userId });

        if (result.error) {
            throw result.error;
        }

        const data = result.data[0];

        await executeStateOperations({
            ...params,
            code: data.code,
            stateId: data.id
        });


        /**
         * Get state description
         */
        const stateRes = await db.query('select applicant_description as description, deadline, intervening from producers.state_types where code = $1', [data.code]);

        if (stateRes.error) {
            throw stateRes.error;
        }

        const stateData = stateRes.data[0];

        const stateCode = data.code;
        const stateStart = new Date(data.start_date);
        const stateStartStr = stateStart.toISOString().split('T')[0];
        const stateDescription = stateData.description;
        const intervening = stateData.intervening; // TODO: enviar emails para avaliadores

        const host = baseUrl;

        const content = stateCode < 3 || stateCode === 105 || stateCode === 100 ?
            {
                must_intervene: intervening !== null && !intervening ? 'Sim' : 'Não',
                start_date: stateStartStr,
                token: login_hash,
                state: stateDescription,
                name: name,
                site: host
            } :
            {
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
            subject: 'Registo por Comunicação Prévia: Transição de Estado',
            content: content
        });

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
    console.log("> State: advance");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            advance: body.advance,
            stateId: body.stateId,
            observations: body.observations ? body.observations : '',
        };

        if(params.requestId === -1){
            throw new VError(409, 'Permissão Negada');
        }

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            // console.log("> Err: ", result.error)
            // res.send({ error: 'Error..' });

            throw result.error;
        }

        res.send(result);

    } catch (e) {
        next(e);
    }
}