const nconf = require('nconf');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const path = '../../server-config.json';

nconf.env().file({
    file: path
});

const isDev = process.env.NODE_ENV !== 'production'

const serverConfig = nconf.get("ServerConfig");

const connections = isDev ? serverConfig.development : serverConfig.production;

async function start() {
    // Get configs from object
    const config = connections.ldap;
    const servers = config ? config.strategies : null;

    if (!config || !servers) {
        console.log(' [Error] LDAP configuration not found.');
        console.log('  Exiting.');

        return;
    }

    const port = config.port,
        host = config.host;

    // console.log("Found config:", servers);

    global.servers = servers;

    app.use(
        bodyParser.urlencoded({
            extended: true
        })
    );

    app.use(bodyParser.json());

    const authenticate = require('./api/authenticate');
    const error = require('./api/error');

    // Expose the port
    app.post('/authenticate', [authenticate, error]);

    app.listen(port, host);

    console.log("> LDAP server started at: ")
    console.log("   host:", host);
    console.log("   port:", port);
}

start();
