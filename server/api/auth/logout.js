const user = require(__basedir + 'modules/db/user');

export default async function (req, res, next) {
    console.log('--request auth logout');
    switch (req.method) {
        case 'GET':
        case 'POST':
            if (req.session && req.session.userid) {
                const r = await user.deauthenticate(req);

                if (r.error) {
                    res.status(401).send(r.error);
                } else {

                    req.session.destroy(function (err) {
                        if (err) {
                            res.sendStatus(400);
                        } else {
                            res.sendStatus(200);
                        }
                    });
                }
            } else {
                res.sendStatus(400);
            }
            break;
        default:
            res.sendStatus(405);
            break;
    }
}