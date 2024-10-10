const user = require(__basedir + 'modules/db/user');

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

const handler = async function (req, res, next) {
    console.log('--request auth login');

    switch (req.method) {
        case 'GET':
        case 'POST':
            if (req.body.hasOwnProperty('email')) {

                const email = req.body.email;

                const params = {};
                
                params['email'] = email;
                params['agent'] = req.headers['user-agent'];
                params['host'] = req.headers.host;
                params['userid'] = req.session.userid;
                params['lang'] = req.session.lang;

                // // get keys for rate limiter
                // const ipAddr = req.connection.remoteAddress;
                // const usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);

                // let retrySecs = Math.max(retryUsernameAndIP, retrySlowByIP);
                // if (retrySecs > 0) {
                //     res.set('Retry-After', String(retrySecs));
                //     res.status(429).send('Too Many Requests');
                // } else {
                    
                    const r = await user.pwdreset(params);
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
