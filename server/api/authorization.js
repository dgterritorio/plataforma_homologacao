const routes = require(__basedir + 'apiRoutes/all-routes.js');

const clientRoutes = routes.api;

const accessLevel = {};

function initializeaccessLevels() {
    if (clientRoutes && clientRoutes.length) {

        clientRoutes.forEach(function (route) {
            const path = route.path;

            if (route.hasOwnProperty('levels')) {
                const auth = route.levels && Array.isArray(route.levels) ? route.levels : [];

                accessLevel[path] = auth;
            }
        });
    }
}

// Initialization
initializeaccessLevels();


export default function (req, res, next) {
    let isAuthorized = false;

    // If the route does not require authorization, skip
    if (!res.locals.requiresAuthorization) {
        isAuthorized = true;
    } else {
        // If test user access level

        const url = req.url,
            user = res.locals.user;

        // get user access level
        const userLevel = user.group;
        const userId = user.id;

        console.log("[Authorization]");

        // Safety measure
        if (userId === null || userId === undefined) {
            isAuthorized = false;
        } else {

            // If routes specifies access levels
            if (accessLevel.hasOwnProperty(url)) {
                isAuthorized = accessLevel[url].includes(userLevel);
            } else {
                // else authorize
                isAuthorized = true;
            }
        }
    }

    console.log("   is authorized?: ", isAuthorized);

    // If authorized, next() -> api()
    if (isAuthorized) {
        // This is redundant
        res.locals.isAuthorized = isAuthorized;

        next();
    } else {
        next({ status: 403, message: 'Forbidden' });
    }
}