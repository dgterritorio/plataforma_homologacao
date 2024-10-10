// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'ActiveProducers'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      name: this.string(''),
      email: this.string(),
      is_collective: this.boolean(false),
      address: this.string(''),
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
      autoSync: false,
      sortBy: ['name'],
      sortOrder: [true],
      limit: -1
    }
  }

  get type_description() {
    return this.type ? 'Singular' : 'Coletiva'
  }

  get produces_vectorial() {
    return this.carto_vectorial ? 'Yes' : 'No'
  }

  get produces_imagery() {
    return this.carto_imagery ? 'Yes' : 'No'
  }

  get produces_aerial() {
    return this.carto_aerial ? 'Yes' : 'No'
  }

  static apiConfig = {
    api: {
      read: `/api/producer/entity/getactive`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
