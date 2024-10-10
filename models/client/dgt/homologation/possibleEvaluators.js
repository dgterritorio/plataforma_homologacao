// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'PossibleEvaluators'

    static primaryKey = 'id'

    // List of all fields (schema) of the post model. `this.attr` is used
    // for the generic field type. The argument is the default value.
    static fields() {
        return {
            id: this.uid(),
            name: this.string(),
            email: this.string(),
        }
    }

    static state() {
        return {
            ...super.state(),
            sortBy: ['id'],
            sortOrder: [false],
            autoSync: false
        }
    }

    static apiConfig = {
        api: {
            read: `/api/homologation/evaluators/getpossible`
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
