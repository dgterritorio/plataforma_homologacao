import Axios from 'axios'

export const state = () => ({
  clientTitle: '',
  appTitle: '',
  useLDAP: false,
  appVersion: ''
});

export const mutations = {
  SETTINGS: (state, payload) => {
    state.clientTitle = payload.clientTitle;
    state.appTitle = payload.appTitle;
    state.useLDAP = payload.useLDAP;
    state.appVersion = payload.appVersion;
  }
};

export const actions = {
  REQ_CLIENT_SETTINGS: async (context, payload) => {
    let clientTitle = '';
    let appTitle = '';
    let useLDAP = false;
    let appVersion = '';

    // If this was called after client rendering
    if (process.client) {
      let res =
        await Axios.get('/api/settings');

      clientTitle = res.data.clientTitle;
      appTitle = res.data.appTitle;
      appVersion = res.data.appVersion;

      // If this was called by nuxtServerInit
    } else if (process.server) {

      const fs = require('fs');

      const strConfigs = fs.readFileSync('./server/server-config.json', 'utf-8');

      const jsonConfigs = JSON.parse(strConfigs);

      const pkgConfigs = fs.readFileSync('./package.json', 'utf-8');
      appVersion = JSON.parse(pkgConfigs).version;

      clientTitle = jsonConfigs.ClientConfig.clientTitle;
      appTitle = jsonConfigs.ClientConfig.appTitle;
      useLDAP = !!jsonConfigs.ClientConfig.useLDAP;
    }

    // Commit the settings to this store
    context.commit("SETTINGS", {
      clientTitle: clientTitle,
      appTitle: appTitle,
      useLDAP: useLDAP,
      appVersion: appVersion
    });
  }
};

export const getters = {
  getClientTitle: state => {
    return state.clientTitle;
  },
  getAppTitle: state => {
    return state.appTitle;
  },
  getUseLDAP: state => {
    return state.useLDAP;
  },
  getAppVersion: state => {
    return state.appVersion;
  },
};
