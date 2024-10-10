const apiRateLimiter = require(__basedir + '/modules/apilimiter/main');
const allRoutes = require(__basedir + 'apiRoutes/all-routes.js');
// const client = require(__basedir + 'apiRoutes/client-routes.js');

const HOUR = 60 * 60;
const DAY = HOUR * 24;
const MAX_IP_ATTEMPTS = 100;

const IP_ATTEMPT_LIMITER = 'ip_attempt_limiter';

// App routes
const routes = allRoutes.api;
//  [
//     ...base.api,
//     ...client.api
// ];

const limitedRoutes = {};

function secs2text(secs) {
    let val = '', text = '';

    console.log(secs)

    if (secs <= 60) {
        val = secs;
        text = ' segundo' + (val !== 1 ? 's' : '');
    } else if (secs <= HOUR) {
        val = Math.floor(secs / 60);

        text = ' minuto' + (val !== 1 ? 's' : '');
    } else if (secs <= DAY) {
        val = Math.floor(secs / HOUR);

        text = ' hora' + (val !== 1 ? 's' : '');
    }

    return val + ' ' + text;
}

function initialize() {
    if (!routes || !routes.length) {
        return;
    }

    // For each route
    routes.forEach(function (route) {
        const path = route.path;

        // Check if the limiter opts exists
        if (route.hasOwnProperty('limiter')) {
            const limiter = route.limiter ? route.limiter : {};

            // register the limiter
            apiRateLimiter.createLimiter(limiter.key, limiter.max, limiter.time, limiter.time);

            // Save the route/limiter
            limitedRoutes[path] = limiter;
        }
    });


    // Initialize IP limiter
    apiRateLimiter.createLimiter(IP_ATTEMPT_LIMITER, MAX_IP_ATTEMPTS, DAY, DAY);
}

// Initialization
initialize();

export default async function (req, res, next) {
    // Request url
    const url = req.url;

    // Check if route is limited
    const isLimited = limitedRoutes.hasOwnProperty(url);

    console.log("[Limiter]");
    console.log("  Is limited? ", isLimited);

    if (!isLimited) {
        next();
    } else {
        // Get limiter opts
        const limiter = limitedRoutes[url];

        const routeLimiterKey = limiter.key;

        // Get request ip address
        const ip = req.connection.remoteAddress;

        // Get user authenticated
        const authenticated = res.locals.isAuthenticated;

        let userKey = '';

        // If authenticated
        if (authenticated) {
            // Use user_id
            userKey = res.locals.user.id;
        } else if (req.body.hasOwnProperty('email')) {
            // If anonymous, use email if exist
            userKey = req.body.email;
        }

        // Api rate limiter key
        const routeLimiterValue = `${userKey}_${ip}`;

        // Test if keys against the api limiter
        const [retryRoute, retryIp] = await Promise.all([
            apiRateLimiter.testApiRetry(routeLimiterKey, routeLimiterValue),
            apiRateLimiter.testApiRetry(IP_ATTEMPT_LIMITER, ip),
        ]);

        // Check which is the longest (ip or route limiter)
        const retrySecs = Math.max(retryRoute, retryIp);

        // Set limiter info for the consumer step
        res.locals.limiter = {
            route: {
                key: routeLimiterKey,
                value: routeLimiterValue,
            },
            ip: {
                key: IP_ATTEMPT_LIMITER,
                value: ip
            }
        };

        // If limiter didnt block
        if (retrySecs === 0) {
            next();
        } else {
            const retryText = secs2text(retrySecs);

            next(new VError(429, 'Limite máximo de tentativas atingido. Tente novamente em: ' + retryText /*, retry: retrySecs*/));
        }
    }
}