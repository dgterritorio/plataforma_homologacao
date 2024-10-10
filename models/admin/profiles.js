import BaseModel from '@/models/base.js'

export default class UserProfiles extends BaseModel {
    static entity = 'webapp.userprofiles'

    static primaryKey = 'id'

    static fields() {
        return {
            id: this.uid(),
            name: this.string('')
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
            read: `/api/admin/profiles/getall`,
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
