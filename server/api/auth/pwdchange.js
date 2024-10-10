const user = require(__basedir + 'modules/db/user');

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

const handler = async function (req, res, next) {
    console.log('--request auth pwdchange');

    switch (req.method) {
        case 'GET':
        case 'POST':
            console.log(req.body)
            if (req.body.hasOwnProperty('token') &&
                req.body.hasOwnProperty('password')) {

                const token = req.body.token;
                const password = req.body.password;

                // // get keys for rate limiter
                // const ipAddr = req.connection.remoteAddress;
                // const usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);

                // let retrySecs = Math.max(retryUsernameAndIP, retrySlowByIP);
                // if (retrySecs > 0) {
                //     res.set('Retry-After', String(retrySecs));
                //     res.status(429).send('Too Many Requests');
                // } else {

                const r = await user.pwdchange(token, password);
                //     if (r.error) {
                //         res.status(401).send(r.error);
                //     } else {
                //         req.session.userid = r.data[0].id;
                //         req.session.groupid = r.data[0].group_id;

                //         res.send({})
                //     }
                // }
                res.send(r)

            } else {
                res.sendStatus(400);
            }
            break;
        default:
            res.sendStatus(405);
            break;
    }
}

export default handler;
