// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'HomologationPayments'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      request_id: this.number(),
      state_id: this.number(),
      creation_state_id: this.number(),
      paid_state_id: this.number(),
      value: this.number(),
      creation_date: this.string(''),
      emitted_date: this.string(''),
      paid_date: this.string(''),
      applicant_accepted: this.boolean(false),
      type: this.number(),
      original_name: this.string(),
      document_id: this.number(),
      paid_code: this.number(),
      creation_code: this.number(),
    }
  }

  static state() {
    return {
      ...super.state(),
      sortBy: ['creation_date'],
      sortOrder: [false],
      autoSync: false
    }
  }

  static apiConfig = {
    api: {
      read: `/api/homologation/receipt/getdocuments`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
