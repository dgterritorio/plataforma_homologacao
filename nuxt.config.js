const colors = require('vuetify/es5/util/colors').default;

/******************
 * Vuetify config *
 * ************** */
let vuetifyConfig = {
  customVariables: ['~/assets/variables.scss'],
  theme: {
    dark: false,
    themes: {
      dark: {
        primary: colors.blue.darken2,
        accent: colors.grey.darken3,
        secondary: colors.amber.darken3,
        info: colors.teal.lighten1,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.accent3
      }
    },
    options: {
      customProperties: true,
    }
  }
};

try {
  const themeConfig = require('./themes/client-theme.js');

  if (themeConfig) {
    vuetifyConfig = themeConfig.themes;
  }

} catch (e) {
  console.log("> No client theme provided...")
}

// --------------------------------------------
// --------------------------------------------

/******************
 * Endpoint config *
 * ************** */
const clientPlugins = require('./plugins/client/client-plugins.js');

let baseAPI = [],
  clientAPI = [];

let appTitle = '';
let base = '/'
let hasWebsocket = false;

const defaultPlugins = [
  {
    "src": "@/plugins/vuelayers",
    "ssr": false
  },
  {
    "src": "@/plugins/i18n.js"
  },
  {
    "src": "@/plugins/vue-the-mask.js"
  },
  {
    "src": "@/plugins/api.js"
  },
  {
    "src": "~/plugins/csrf"
  },
  {
    "src": "~/plugins/axios"
  },
  {
    "src": "@/plugins/vuex-orm-axios"
  },
  {
    "src": "@/plugins/vuex-orm-utils"
  },
  {
    "src": "@/plugins/vuex-utils.js"
  },
  {
    "src": "@/plugins/vue-chart.js", mode: "client"
  },
  {
    "src": "@/plugins/url-prefixer.js"
  },
  {
    "src": "@/plugins/unit-converter.js"
  },
  {
    "src": "@/plugins/vue-grid-layout.js",
    "ssr": false
  },
  {
    "src": "@/plugins/vue-chartkick.js",
  },
  {
    "src": "@/plugins/vue2vis.js",
  },
  {
    "src": "@/plugins/vue-tour.js"
  },
  {
    "src":"@/plugins/cube.js"
  }
].concat(clientPlugins.plugins);

try {
  const baseRoutes = require('./server/apiRoutes/base-routes.js');
  const clientRoutes = require('./server/apiRoutes/client-routes.js');

  // Set routes
  baseAPI = baseRoutes.api;
  clientAPI = clientRoutes.api;

  // Set app title and favicon
  const serverConfig = require('./server/server-config.json');

  const serverConnections = process.env.NODE_ENV !== 'production' ? serverConfig.ServerConfig.development : serverConfig.ServerConfig.production;
  if (typeof serverConnections === 'object' && serverConnections !== null & serverConnections.hasOwnProperty("urlprefix")) {
    base = serverConnections.urlprefix;
  }

  hasWebsocket = !!serverConnections.websocket;

  console.log(`urlprefix: ${base}`);
  console.log(`has websocket: ${hasWebsocket}`)

  // Add socket-io plugin
  if (hasWebsocket) {
    defaultPlugins.push({
      "src": "@/plugins/socketio.js",
      "ssr": false,
      "mode": "client"
    });
  }

  const clientConfig = serverConfig.ClientConfig;

  appTitle = clientConfig.appTitle;
  clientTitle = clientConfig.clientTitle;
} catch (e) {
  console.log(e)
  console.log("> No client API detected.");
}

module.exports = {
  /**
   * Disable Telemetry
   */
  telemetry: false,

  render: {
    // CSP is handled by nuxt
    // Every other header is handled by helmet.js
    csp: true
  },

  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: appTitle,
    title: appTitle || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: clientTitle || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: base + 'favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  // loading: { color: '#fff' },
  // loading: '@/components/modals/loading.vue',

  /*
  ** Global CSS
  */
  css: [
    "@/assets/css/var/clients.scss"
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: defaultPlugins,

  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/router',
    '@nuxtjs/vuetify',
  ],
  routerModule: {
    keepDefaultRouter: true
  },
  /*
  ** Nuxt.js modules
  */
  modules: [
    "~/modules/vuelayers",
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],

  /*
  ** Server middleware modules
   */
  serverMiddleware: [
    '~/server/api/authentication',
    '~/server/api/authorization',
    '~/server/api/limiter',

    ...baseAPI,
    ...clientAPI,

    '~/server/api/error.js'
  ],

  auth: {
    redirect: {
      home: false
    },
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/auth/login',
            method: 'post'
          },
          logout: {
            url: '/auth/logout',
            method: 'post'
          },
          user: {
            url: '/auth/profile',
            method: 'get',
            propertyName: 'user'
          }
        },
        tokenRequired: false,
        tokenType: false
      }
    },
    plugins: ['~/plugins/auth.js']
  },

  /**
   * This sets the router guard globally 
   * base: '/' default
   */
  router: {
    base: base,
    middleware: [
      'i18n',
      'router'
    ]
  },

  axios: {
    baseURL: '',
    credentials: true,
    retry: false
  },

  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: vuetifyConfig,
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    // indicator: true,
    // parallel: true,
    // hardsource: true,
    // cache: true,

    // Transpile combobox so that we can override/extend the component later
    transpile: ['vuetify/lib/components/VCombobox/VCombobox'],

    terser: {
      // https://github.com/terser/terser#compress-options
      terserOptions: {
        compress: {
          // Add functions here to remove
          pure_funcs: ['console.log', 'console.debug']
        }
      }
    },

    extend(config, ctx) {
      //   console.log(config)
      //   config.watch = true;
      //   config.watchOptions = {};
      //   config.watchOptions['aggregateTimeout'] = 10000;
      //   config.watchOptions['poll'] = 10000;
    }
  }
};
