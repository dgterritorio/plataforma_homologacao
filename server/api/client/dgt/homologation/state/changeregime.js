const { aquireTransaction } = require(__basedir + 'modules/db/base');

function toText(regime) {
    return regime ? 'Excecional' : 'Normal';
}

async function getRequestInfo(params) {
    const userId = params.userId;
    const requestId = params.requestId;
    const regime = params.regime;
    const stateId = params.stateId;

    let observations = '';

    let db;

    try {
        db = await aquireTransaction();

        await db.begin();

        let result;

        // Get previous state
        result = await db.query('select get_request_current_state_id as previous_id from homologation.get_request_current_state_id($1);', [requestId])

        if (result.error) {
            throw result.error;
        }

        if(result.data[0].previous_id !== stateId){
            throw new VError(429, 'Cliente contém dados desatualizados. Deve refrescar a página de modo obter a versão mais recente dos dados do processo.')
        }

        let data = result.data;

        const previous_id = data[0].previous_id;

        // If previous_state = null, error
        if (!previous_id) {
            throw new VError(429, 'Operação negada. Não foi possível alterar o tipo de homologação.')
        }

        result = await db.query('select * from homologation.states where id = $1;', [previous_id]);

        if (result.error) {
            throw result.error;
        }

        data = result.data;

        const previous_state = data[0];

        // If previous_state was a reverted state, inconsistency
        if (previous_state.code === 300) {
            throw new VError(429, 'Operação inconsistente.')
        }

        result = await db.query('select exceptional_regime from homologation.requests where id = $1;', [requestId]);

        if (result.error) {
            throw result.error;
        }

        const oldRegime = result.data[0].exceptional_regime;

        // Update exceptional regime
        result = await db.query('update homologation.requests set exceptional_regime = $1 where id = $2', [regime, requestId], { userId: userId });

        if (result.error) {
            throw result.error;
        }

        observations = 'Alteração de regime de homologação de regime ' + toText(oldRegime) + ' para ' + toText(regime);

        // Insert reverted state
        result = await db.query('insert into homologation.states(code, request_id, revert_to, intervening_id, end_date, deadline_date, observations) values($1, $2, $3, $4, now(), now(), $5) returning code', [302, requestId, previous_id, userId, observations], { userId: userId });

        if (result.error) {
            await db.rollback();

            await db.release();

            throw result.error;
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
    console.log("> State: revert");

    try {
        const body = req.body;

        const user = res.locals.user;

        const params = {
            userId: user.id,
            userGroup: user.group,
            requestId: body.requestId,
            regime: body.regime,
            stateId: body.stateId
        };

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