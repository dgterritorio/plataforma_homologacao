import BaseModel from '@/models/base.js'

export default class Permission extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'Permission'

    static primaryKey = ['menu_id', 'group_id']

    // List of all fields (schema) of the post model. `this.attr` is used
    // for the generic field type. The argument is the default value.
    static fields() {
        return {
            menu_id: this.number(),
            group_id: this.number(),
            groupname: this.string(''),
            permission: this.boolean()
        }
    }

    static state() {
        return {
            ...super.state(),
            sortBy: ['menu_id'],
            sortOrder: [true]
        }
    }

    static apiConfig = {
        api: {
            read: `/api/admin/permissions/getall`,
            update: `/api/admin/permissions/update`,
            delete: `/api/admin/permissions/delete`
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
