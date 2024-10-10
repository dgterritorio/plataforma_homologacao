// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'PurposeTypes'

  static primaryKey = 'code'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      code: this.uid(),
      description: this.string('')
    }
  }

  static state() {
    return {
      ...super.state(),
      autoSync: false,
      readOnce: true,
      reloadOnLogin: false,
    }
  }

  static apiConfig = {
    api: {
      read: `/api/homologation/types/purpose/get`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
