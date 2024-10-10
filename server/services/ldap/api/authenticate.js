
const passport = require('passport'),
    LdapStrategy = require('passport-ldapauth');

const { authenticate, parseUser } = require('./utils')

const servers = global.servers;

const strategies = initialize(servers);

// Initialize strategies
function initialize(configs) {
    const strategyMap = {};

    // For each config, register as passport strategy
    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];

        const {
            host,
            bindDN,
            bindCredentials,
            searchBase,
            searchFilter,
            attributeMap
        } = config;

        const serverkey = 'ldapauth' + i;
        const serverOpts = {
            server: {

                url: host,
                bindDN: bindDN,
                bindCredentials: bindCredentials,
                searchBase: searchBase,
                searchFilter: searchFilter,
                searchAttributes: Object.keys(attributeMap)
            }
        }

        strategyMap[serverkey] = config;

        const res = passport.use(serverkey, new LdapStrategy(serverOpts));

        // console.log("> Adding config: ", res);
    }

    return strategyMap;
}

// Process post request
async function process(params) {
    let { username, email, password } = params;

    let parsed = null;

    const strategyKeys = Object.keys(strategies);

    // For each server, test login
    for (let i = 0; i < strategyKeys.length; i++) {

        // Get strategy
        const strategyKey = strategyKeys[i];
        const config = strategies[strategyKey];

        // Get user
        const user = await authenticate(strategyKey, { username, email, password });

        // If not user ou !user.dn --> invalid login
        if (!user || !user.hasOwnProperty('dn')) {
            console.log("> NOT Found: ", username, " using ", config["host"]);
            continue;
        } 

        console.log("> Found user:", user, " using ", config["host"]);

        // Parse user info
        parsed = await parseUser(user, config);

        // console.log("> Parsed user:", parsed);

        break;
    }

    return parsed;
}

module.exports = async function (req, res, next) {
    try {
        const body = req.body;

        const { username, email, password } = body;

        const result = await process({ username, email, password });

        res.send({ data: result, error: null, total: !result ? 0 : 1 });
    } catch (e) {
        next(e);
    }
}