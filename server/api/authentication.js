const { authenticateUser } = require(__basedir + 'modules/authUtils');

const routes = require(__basedir + 'apiRoutes/all-routes.js');

const clientRoutes = routes.api;

const authRoutes = {};

function initializeAuthRoutes() {
    if (clientRoutes && clientRoutes.length) {

        clientRoutes.forEach(function (route) {
            const path = route.path;
            const auth = route.auth ? true : false;

            authRoutes[path] = auth;
        });
    }
}

// Initialization
initializeAuthRoutes();


export default function (req, res, next) {
    // The url accessed
    // This will also contain other routes besides /util or /api
    const url = req.url;

    const user = authenticateUser(req);

    let requiresAuth = true;

    console.log("[Authentication]");
    console.log("   URL: " + url);

    /**
     * Check if route is:
     *  - api
     *  - navigation/resources
     */
    if (url.startsWith('/api') || url.startsWith('/auth')){
        console.log("   Validating api: " + url);
        
        // If the request requires authentication
        requiresAuth = authRoutes.hasOwnProperty(url) && authRoutes[url];
    } else {
        console.log("   Accepting route: " + url);

        requiresAuth = false;
    }

    // Set the user to the local container
    res.locals.user = user ? user : {id: null, group: 0};
    res.locals.isAuthenticated = !!user;

    if(!requiresAuth){
        res.locals.requiresAuthorization = false;

        next();
    }else if (requiresAuth && user){
        res.locals.requiresAuthorization = true;

        next();
    } else {
        next({status: 401, message: 'Unauthorized'});
    }
}