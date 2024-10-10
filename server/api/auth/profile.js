const user = require(__basedir + 'modules/db/user');
const { destroySession } = require(__basedir + 'modules/authUtils');

export default async function (req, res, next) {
    console.log('--request auth profile');

    try {
        if (req.method !== 'GET' && req.method !== 'POST') {
            throw new VError(401, 'Acesso não autorizado');
        }

        const { id, group, memberof, sessionId } = res.locals.user;

        // Test if there is a session
        if (id) {
            // If so, get user info
            const r = await user.get({ userId: id, active: true });

            if (r.error) {
                throw 'Erro no servidor';
            }

            if (r.total !== 1) {
                throw new VError(401, 'Utilizador Inválido');
            }

            const userInfo = r.data[0];

            // Check if session is active
            const activeSession = await user.checkActiveSession({
                userId: id,
                sessionId: sessionId
            });

            if (!activeSession) {
                await destroySession(req.session);

                throw new VError(401, 'Expired session');
            }

            // If user info fetched, update session reuse
            const alive = await user.reuseSession(req);

            if (alive.error) {
                throw new VError(401, 'Alive server error')
            }

            // Fetch groups/profiles
            const memberships = await user.checkUserGroups(null, { user_id: id });

            const profiles = await user.checkUserProfiles(null, { user_id: id });

            userInfo.memberof = memberships ? memberships : [];
            userInfo.profiles = profiles ? profiles : {};

            // Send user info if everything was sucessful
            res.send({ 'user': userInfo });
        } else {
            res.sendStatus(200);
        }
    } catch (e) {
        next(e);
    }
}
