// import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'

import clientModels from '@/models/client-models'


import Users from '@/models/admin/users.js'
import UserSessions from '@/models/admin/sessions.js'
import UserMemberships from '@/models/admin/memberships.js'
import UserMembershipsProfiles from '@/models/admin/membershipprofiles.js'
import UserGroups from '@/models/admin/groups.js'
import UserProfiles from '@/models/admin/profiles.js'
import UserProfilesList from '@/models/admin/profiles-list.js'
import AdminGroups from '@/models/admin/admin-groups.js'
import AdminGroupsList from '@/models/admin/admin-groups-list.js'
import Menus from '@/models/admin/menus.js'
import Permission from '@/models/admin/permissions.js'
import Notifications from '@/models/app/notifications.js'
import AdminNotifications from '@/models/app/adminNotifications.js'
import FAQ from '@/models/app/faq.js'

VuexORM.use(VuexORMAxios) // <- No axios option.

const database = new VuexORM.Database()

/**********************
 * VUEX-ORM overrides *
 **********************/
// Override the get model function from vuex-orm.database
database.model = function (model) {
  const name = typeof model === 'string' ? model : model.entity

  const entity = this.entities.find((entity) => {
    return entity.name === name
  })

  const m = entity ? entity.model : null

  if (!m) {
    throw new Error(
      `[Vuex ORM] Could not find the model \`${name}\`. Please check if you ` +
      'have registered the model to the database.'
    )
  }

  return m
}

// Override the get baseModel function from vuex-orm.database
database.baseModel = function (model) {
  const name = typeof model === 'string' ? model : model.entity

  const entity = this.entities.find((entity) => {
    return entity.name === name
  })

  const m = entity ? this.model(entity.base) : null

  if (!m) {
    throw new Error(
      `[Vuex ORM] Could not find the model \`${name}\`. Please check if you ` +
      'have registered the model to the database.'
    )
  }

  return m
}
/**************************
 * END VUEX-ORM overrides *
 **************************/

clientModels.forEach(model => {
  database.register(model);
});

/**
 * WEBAPP Stores
 */
database.register(Users)
database.register(UserSessions)
database.register(UserMemberships)
database.register(UserMembershipsProfiles);
database.register(UserGroups)
database.register(UserProfiles)
database.register(UserProfilesList)
database.register(AdminGroups)
database.register(AdminGroupsList)
database.register(Menus)
database.register(Permission)
database.register(Notifications);
database.register(AdminNotifications);
database.register(FAQ)

export const plugins = [VuexORM.install(database)]

export const state = () => ({
  locales: ['en', 'pt'],
  locale: 'en',
  loading: false,
  crashed: false, // if the app is in an inconsistent state
  crasherror: null,         // if it is inconsistent, this should be an object containing the error
  systemMsgs: [],
  systemMsgUUID: 0,
  systemMsgsLimit: 3,
  dialogMsg: {}
});

export const actions = {
  // We are using module store, so the nuxtServerInit has to be defined in the index.js
  async nuxtServerInit({ commit, dispatch }, { req, app }) {
    // We can also handle the user session here

    const appBase = app.router.options.base;
    const urlPrefix = appBase ? appBase.slice(0, -1) : '';

    // This runs once in the server side before page rendering
    await dispatch('settings/REQ_CLIENT_SETTINGS');

    // Request navigation tree
    await dispatch('routes/updateUserId', {
      userid: req.session.userid,
      baseUrl: req.protocol + '://' + req.get('host') + urlPrefix// server-side axios needs to full url
    });
  }
};

export const mutations = {
  SET_LANG(state, locale) {
    if (state.locales.includes(locale)) {
      state.locale = locale
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  SET_CRASHERROR(state, value) {
    state.crasherror = value;
    state.crashed = !!value;
  },

  SET_SYSTEMMSG(state, value) {
    if (state.systemMsgs.length >= state.systemMsgsLimit) {
      state.systemMsgs = state.systemMsgs.filter(c => !c.shown);//shift();
    }

    value.alert = true;
    value.shown = false;

    state.systemMsgs.push(value);
  },

  SET_DIALOGMSG(state, value) {
    state.dialogMsg = value;
  },

  REMOVE_DIALOGMSG(state, value) {
    state.dialogMsg = {};
  },

  MARK_DIALOG_READ(state, value) {
    value.shown = true;
  }
}

export const getters = {

  crashed: function (state) {
    return state.crashed;
  },

  crasherror: function (state) {
    return state.crasherror;
  },

  loading: function (state) {
    return state.loading;
  },

  systemMsgs: function (state) {
    return state.systemMsgs;
  },

  dialogMsg: function (state) {
    return state.dialogMsg;
  }
}
