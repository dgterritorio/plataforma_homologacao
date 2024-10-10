// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class InprogressProducers extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'InprogressProducers'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      name: this.string(''),
      email: this.string(),
      type: this.boolean(false),
      locality: this.string(''),
      zipcode: this.string(''),
      phone: this.string(''),
      carto_vectorial: this.boolean(false),
      carto_imagery: this.boolean(false),
      carto_aerial: this.boolean(false)
    }
  }

  static state() {
    return {
      ...super.state(),
      sortBy: ['end_date'],
      sortOrder: [false],
      autoSync: false
    }
  }

  get type_description() {
    return this.type ? 'Singular' : 'Coletiva'
  }

  static apiConfig = {
    api: {
      read: `/api/producer/getinprogress`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
