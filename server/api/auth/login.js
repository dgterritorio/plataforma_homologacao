const user = require(__basedir + 'modules/db/user');
const apiRateLimiter = require(__basedir + '/modules/apilimiter/main');


const handler = async function (req, res, next) {
    console.log('--request auth login');

    try {

        switch (req.method) {
            case 'GET':
            case 'POST':
                if (req.body.hasOwnProperty('email') &&
                    req.body.hasOwnProperty('password')) {

                    // Get the limiter info
                    const limiter = res.locals.limiter;
                    const ipLimiter = limiter.ip;
                    const routeLimiter = limiter.route;

                    const ipConsume = await apiRateLimiter.consume(ipLimiter.key, ipLimiter.value);

                    console.log('API Rate Limiter: ' + ipLimiter.key);
                    console.log(ipConsume);

                    // const loginType = await user.checkLoginType(req.body);

                    let r;
                    let loginType = req.body.hasOwnProperty('social') ? req.body.social : null;

                    switch (loginType) {
                        case 'ldap':
                            r = await user.authenticateLDAP(req, req.body);
                            break;
                        default:
                            // Check if user exists
                            const userExists = await user.checkUserExists(req.body);

                            if (!userExists) {
                                const routeConsume = await apiRateLimiter.consume(routeLimiter.key, routeLimiter.value);
                                console.log('API Rate Limiter: ' + routeLimiter.key);
                                console.log(routeConsume);

                                const remaining = routeConsume.remainingPoints;
                                let msg = 'Utilizador ou password incorreta';

                                throw new VError(401, msg);
                            }

                            // Check if user is active
                            const isActive = await user.checkActive(req, req.body);

                            if (!isActive) {
                                const deactivatedConsume = await apiRateLimiter.consume(routeLimiter.key, routeLimiter.value);

                                console.log('API Rate Limiter: ' + routeLimiter.key);
                                console.log(deactivatedConsume);

                                throw new VError(401, 'Utilizador desativado. Por favor contacte a administração para ativar o login.');
                            }

                            r = await user.authenticate(req, req.body)
                            break;
                    }

                    if (r.error) {
                        const routeConsume = await apiRateLimiter.consume(routeLimiter.key, routeLimiter.value);
                        console.log('API Rate Limiter: ' + routeLimiter.key);
                        console.log(routeConsume);

                        const remaining = routeConsume.remainingPoints;
                        let msg = 'Utilizador ou password incorreta';

                        // if(remaining <= 3){
                        //     msg += '. Tentativas restantes: ' + remaining;
                        // }

                        throw new VError(401, msg);
                        // res.status(401).send({ error: { msg: 'Username ou password incorreto.' } });
                    } else {
                        await apiRateLimiter.delete(routeLimiter.key, routeLimiter.value);

                        const groups = await user.checkUserGroups(req, { user_id: r.data[0].id });

                        const profiles = await user.checkUserProfiles(req, { user_id: r.data[0].id });

                        const preferences = await user.checkUserPreferences({ user_id: r.data[0].id });

                        req.session.userid = r.data[0].id;
                        req.session.groupid = r.data[0].group_id;
                        req.session.memberof = groups;
                        req.session.profiles = profiles;
                        req.session.preferences = preferences;

                        res.send({})
                    }
                } else {
                    res.sendStatus(400);
                }
                break;
            default:
                res.sendStatus(405);
                break;
        }

    } catch (e) {
        next(e);
    }

}

export default handler;
