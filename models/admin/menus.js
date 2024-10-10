import BaseModel from '@/models/base.js'

export default class Menus extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'Menus'

    static primaryKey = 'id'

    // List of all fields (schema) of the post model. `this.attr` is used
    // for the generic field type. The argument is the default value.
    static fields() {
        return {
            id: this.uid(),
            route: this.string(''),
            title: this.string(''),
            icon: this.string('')
        }
    }

    static state() {
        return {
            ...super.state(),
            sortBy: ['id'],
            sortOrder: [true]
        }
    }

    static apiConfig = {
        api: {
            read: `/api/admin/menus/getall`
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
