// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class OfficialRequests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'OfficialHomologationRequests'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      name: this.string(''),
      vectorial: this.boolean(false),
      start_date: this.string(''),
      end_date: this.string('', this.justDate),
      product_type: this.number(),

      owner_name: this.string().nullable(),

      producers_list: this.attr(),
      finished: this.boolean(),
      county: this.string(),
      applicant_id: this.number(),
      applicant_name: this.string(),
      epsg: this.number(),
      data_type: this.number(),
      data_specification: this.number()
    }
  }

  static state() {
    return {
      ...super.state(),
      sortBy: ['end_date'],
      sortOrder: [false],
      autoSync: false,
    }
  }

  /**
   * Getters
   */
  static apiConfig = {
    api: {
      read: `/api/homologation/request/getallofficial`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
