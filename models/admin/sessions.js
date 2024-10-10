import BaseModel from '@/models/base.js'

export default class Users extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'webapp.sessions'

    static primaryKey = 'id'

    // List of all fields (schema) of the post model. `this.attr` is used
    // for the generic field type. The argument is the default value.
    static fields() {
        return {
            id: this.uid(),
            user_id: this.number(),
            login: this.attr('', this.justDate).nullable(),
            logout: this.attr('', this.justDate).nullable(),
            last_activity: this.attr('', this.justDate).nullable(),
            ativo: this.boolean(),
            ip: this.string(),
            host_name: this.string().nullable(),
            browser: this.string(),
        }
    }

    static state() {
        return {
            ...super.state(),
            sortBy: ['last_activity'],
            sortOrder: [true]
        }
    }

    static apiConfig = {
        api: {
            read: `/api/admin/sessions/getall`,
            update: `/api/admin/sessions/update`,
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
