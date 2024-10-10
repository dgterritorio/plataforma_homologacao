const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const bodyParser = require('body-parser')
const helmet = require("helmet");
const path = require('path');
const multer = require('multer');
const session = require('express-session')
const cookieParser = require("cookie-parser");
const RedisStore = require('connect-redis')(session);
const redis = require("redis").createClient();
const https = require('https');
const http = require('http');
const fs = require("fs");

const verror = require('./modules/errors/verror');
const db = require('./modules/db/base');
const nextcloud = require('./modules/nextcloud/main');
const logs = require('./modules/logs.js');
const websocket = require('./services/websocket/index.js');

const csurf = require("./modules/tiny-csrf");

const { createProxyMiddleware } = require('http-proxy-middleware');

// Initialize console.stamp
logs.init();

const app = express()

app.use('/cube', createProxyMiddleware({
  target: 'http://localhost:4000',
  // changeOrigin: true,
  pathRewrite: {
    '^/cube': '/'
  }
}))

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

app.use(
  helmet({
    // Disables CSP middleware, but keeps the rest.
    // CSP is handled by nuxt.config.js
    contentSecurityPolicy: false
  })
);

// Import server settings
const nconf = require('nconf')

nconf.env().file({
  file: './server/server-config.json'
});

var serverConfig = nconf.get("ServerConfig"),
  clientConfig = nconf.get("ClientConfig");

// Setup settings globally
if (!global['App']) {
  global.App = {};
}

nconf.add('package', { type: 'file', file: './package.json' });
global.App.version = nconf.stores.package.get('version');

const serverConnections = config.dev ? serverConfig.development : serverConfig.production;

global.__basedir = __dirname + '/';
global.App.clientConfig = clientConfig;
global.App.serverConfig = serverConfig;
global.App.dbParams = config.dev ? serverConnections.dbgeodashboard : serverConnections.dbgeodashboard;
global.App.url = serverConnections.url;
global.App.https = serverConnections.https ? true : false;
global.App.from = serverConnections.smtp.from;
global.App.templates = path.resolve(__dirname, 'templates/email');
global.App.host = serverConnections.host; // TODO: Remove this in the future
global.App.ldap = serverConnections.ldap ? serverConnections.ldap : null;
global.App.hasLDAP = !!serverConnections.ldap;

// Set base url for server
// if (config.router.hasOwnProperty('base') && config.router.base) {
//   const urlBase = config.router.base;

//   global.App.fullurl = serverConnections.url + urlBase.slice(0, urlBase.length - 1);
// }

global.__multer = multer({ dest: '/tmp/' });
global.VError = verror;

// Connect to db
db.connect();

const emailTransport = require('./modules/emails/transport');

const nextcloudParams = serverConnections.nextcloud;
const hasWebsocket = !!serverConnections.websocket;

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { nuxt_host, nuxt_port } = nuxt.options.server;

  // Override nuxt port/host
  const port = serverConfig.port ? serverConfig.port : nuxt_port;
  const host = serverConnections.host ? serverConnections.host : nuxt_host;

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

  app.use(bodyParser.json())
  app.use(cookieParser("jp3auoQu8ItSyALYu8aO"));

  // sessions
  const sessionMiddleware = session({
    store: new RedisStore({
      client: redis
    }),
    name: 'geomaster-vkey',
    secret: serverConfig.sessionsecret,
    resave: false,
    saveUninitialized: true
  })

  app.use(sessionMiddleware);

  // csrf
  app.use(csurf("4f21a9mIFeJMxbiu2sHeuxdpv9E5BsFn"));

  // Give nuxt middleware to express
  app.use(nuxt.render)


  // Connect to smtp
  emailTransport.initialize({
    host: serverConnections.smtp.host,
    port: serverConnections.smtp.port,
    secure: serverConnections.smtp.secure,
    auth: {
      user: serverConnections.smtp.user,
      pass: serverConnections.smtp.pass
    },
    from: serverConnections.smtp.from
  });

  // Connect to nextcloud
  if (nextcloudParams) {
    await nextcloud.initialize(nextcloudParams);
  }

  var options = {
    key: fs.readFileSync('./server/configs/ssl-cert.key'),
    cert: fs.readFileSync('./server/configs/ssl-cert.pem')
  };

  let server = null;

  // Listen the server
  if (global.App.https) {
    server = https.createServer(options, app);
  } else {
    server = http.createServer(options, app);
  }

  if (hasWebsocket) {
    websocket(server, sessionMiddleware);
  }

  server.listen(port, host);

  consola.ready({
    message: `Server listening on ${host}:${port}\nUrl: ${global.App.url}\nMade with ♥ by Geomaster`,
    badge: true
  })
}
start()
