const user = require(__basedir + 'modules/db/user');
// const apiRateLimiter = require('./apiRateLimiter');

// const ONEDAY = 60 * 60 * 24;
// const maxWrongAttemptsByIPperDay = 100;
// const maxConsecutiveFailsByUsernameAndIP = 10;

// const getUsernameIPkey = (username, ip) => `${username}_${ip}`;
// const LOGIN_FAIL_USER_IP = 'login_fail_consecutive_username_and_ip';
// const LOGIN_FAIL_IP = 'login_attempt_ip_per_day';

// apiRateLimiter.createLimiter(
//     LOGIN_FAIL_USER_IP, maxConsecutiveFailsByUsernameAndIP, 90 * ONEDAY, 365 * ONEDAY);
// apiRateLimiter.createLimiter(
//     LOGIN_FAIL_IP, maxWrongAttemptsByIPperDay, ONEDAY, ONEDAY);

const handler = async function (req, res, next) {
    console.log('--request auth login');

    switch (req.method) {
        case 'GET':
        case 'POST':
            if (req.body.hasOwnProperty('token')) {

                const token = req.body.token;

                // // get keys for rate limiter
                // const ipAddr = req.connection.remoteAddress;
                // const usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);

                // const [retryUsernameAndIP, retrySlowByIP] = await Promise.all([
                //     apiRateLimiter.testApiRetry(LOGIN_FAIL_USER_IP, usernameIPkey),
                //     apiRateLimiter.testApiRetry(LOGIN_FAIL_IP, ipAddr),
                // ]);

                // let retrySecs = Math.max(retryUsernameAndIP, retrySlowByIP);
                // if (retrySecs > 0) {
                //     res.set('Retry-After', String(retrySecs));
                //     res.status(429).send('Too Many Requests');
                // } else {
                //     const ipConsume = await apiRateLimiter.consume(LOGIN_FAIL_IP, ipAddr);
                //     console.log('API Rate Limiter: ' + LOGIN_FAIL_IP);
                //     console.log(ipConsume);
                const r = await user.confirmEmail(token);
                // if (r.error) {
                //     const userConsume = await apiRateLimiter.consume(LOGIN_FAIL_USER_IP, usernameIPkey);
                //     console.log('API Rate Limiter: ' + LOGIN_FAIL_USER_IP);
                //     console.log(userConsume);
                //     res.send(r.error);
                // } else {
                //     await apiRateLimiter.delete(LOGIN_FAIL_USER_IP, usernameIPkey);
                // req.session.userid = r.data[0].id;
                // req.session.groupid = r.data[0].group_id;
                // res.sendStatus(200);

                res.send(r)
                // }
                // }
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
