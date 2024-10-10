// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'ProducerStateTypes'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      code: this.uid(),
      description: this.string(''),
      color: this.string(''),
      intervening: this.boolean(),
      must_intervene: this.boolean(),
      deadline: this.number().nullable(),
      next_valid_states: this.attr([]),
      next_invalid_states: this.attr([]),
      next_cancel_states: this.attr([])
    }
  }

  static state() {
    return {
      ...super.state(),
      autoSync: false,
      readOnce: true,
      // sortBy: 'ord',
      // sortOrder: false
    }
  }

  static apiConfig = {
    api: {
      read: `/api/producer/state/gettypes`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
