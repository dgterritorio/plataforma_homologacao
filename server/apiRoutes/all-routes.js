const client = require(__basedir + 'apiRoutes/client-routes.js');
const base = require(__basedir + 'apiRoutes/base-routes.js');

// Merging all routes together
const routes = Object.freeze(base.api.concat(client.api));

exports.api = routes;