// import { Model } from '@vuex-orm/core'
import GeoModel from '@/models/geo.js'

export default class Requests extends GeoModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'global_private_layers'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  // static fields() {
  //   return {
  //     ord: this.number().nullable(),
  //     title: this.string(''),
  //     layer: this.string(''),
  //     service: this.string(),
  //     layer_group: this.string().nullable(),
  //     active: this.boolean(false),
  //     visible: this.boolean(false),
  //     menu_id: this.number().nullable(),
  //   }
  // }

  static state() {
    return {
      ...super.state(),
      autoSync: false,
      readOnce: true,
      reloadOnLogin: false,
      filters: [
        {
          property: 'menu_id',
          value: 501,
          operator: 'eq'
        }
      ]
    }
  }

  static apiConfig = {
    api: {
      read: '/api/layers/getall'
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
