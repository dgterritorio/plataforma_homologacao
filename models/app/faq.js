// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'FAQ'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      title: this.string(),
      subsections: this.attr([], this.sortedSubsections),
      ord: this.number()
    }
  }

  static state() {
    return {
      ...super.state()
    }
  }

  static sortedSubsections(sections) {
    return sections.map(r => r).sort((left, right) => left.ord > right.ord);
  }

  static apiConfig = {
    api: {
      read: `/api/help/getall`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
