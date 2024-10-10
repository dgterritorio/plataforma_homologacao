import BaseModel from '@/models/base.js'

export default class Usermemberships extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'webapp.usermembership_profiles'

    static primaryKey = ['user_id', 'group_id', 'profile_id']

    // List of all fields (schema) of the post model. `this.attr` is used
    // for the generic field type. The argument is the default value.
    static fields() {
        return {
            user_id: this.uid(),
            group_id: this.uid(),
            profile_id: this.uid(),
        }
    }

    static state() {
        return {
            ...super.state(),
            sortBy: ['profile_id'],
            sortOrder: [true]
        }
    }

    get membership_id(){
        return this.group_id;
    }

    get user_membership_profile_id(){
        return `${this.user_id}_${this.group_id}_${this.profile_id}`;
    }

    static apiConfig = {
        api: {
            read: `/api/admin/membershipprofiles/getall`,
            delete: `/api/admin/membershipprofiles/delete`,
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
