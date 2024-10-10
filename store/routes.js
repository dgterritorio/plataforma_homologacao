export const state = () => ({
  userid: null,
  tree: [],
  paths: []
});

export const getters = {
  userid: function (state) {
    return state.userid;
  },

  tree: function (state) {
    return state.tree;
  },

  paths: function (state) {
    return state.paths;
  }
};

export const actions = {
  async updateUserId(context, payload) {

    // Commit the user id
    context.commit("USER_ID", payload.userid);

    // Dispatch the readnavtree
    await context.dispatch("read", payload);
  },

  // Generic read util
  async read(context, payload) {
    // const table = context.getters['defaultTable'];

    const req_data = {
      type: 'read'
    };

    const service = payload.service;

    if (service) {
      req_data['service'] = service;
    }

    try {
      let url = '/api/auth/routes';

      if (process.server) {
        url = payload.baseUrl + url;

        // Accept using userid only in server
        // Otherwise this will come from the req.session
        req_data['userid'] = payload.userid
      }

      let res =
        await this.$axios.post(url, req_data);

      // plugin is not set in server side, so we get res.data
      const result = process.server ? res.data : res;

      // Process the layers
      let tree = result.data.tree;
      let paths = result.data.routes;

      // Temporary fix for ordering
      tree = tree.sort((a,b) => a.ord - b.ord);

      // Commit the records and the absolute len
      context.commit("TREE", tree);

      context.commit("PATHS", paths);

      return null;
    } catch (e) {
      return e;
    }
  }
};

export const mutations = {
  USER_ID(state, userid) {
    state.userid = userid;
  },

  TREE(state, tree) {
    state.tree = tree;
  },

  PATHS(state, paths) {
    state.paths = paths;
  }
};



