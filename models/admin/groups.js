import BaseModel from '@/models/base.js'

export default class UserGroups extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'UserGroups'

    static primaryKey = 'id'

    // List of all fields (schema) of the post model. `this.attr` is used
    // for the generic field type. The argument is the default value.
    static fields() {
        return {
            id: this.uid(),
            name: this.string(''),
            creation_date: this.string(),
            mod_date: this.string(),
            userid: this.number(-2),
            omission: this.boolean(false)
        }
    }

    static state() {
        return {
            ...super.state(),
            sortBy: ['id'],
            sortOrder: [true]
        }
    }

    to_date(date) {
        const tstamp = date;

        if (!tstamp || !tstamp.length) {
            return "";
        }

        const tstampObj = new Date(tstamp);
        if (isNaN(tstampObj)) {
            return "";
        }

        let day = tstampObj.getDate();
        let month = tstampObj.getMonth() + 1;
        let year = tstampObj.getFullYear();

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + month;
        }

        return day + "-" + month + "-" + year;
    }

    /**
     * Getters
     */
    get creation_date_s() {
        return this.to_date(this.creation_date);
    }
    get mod_date_s() {
        return this.to_date(this.mod_date);
    }

    static apiConfig = {
        api: {
            read: `/api/admin/groups/getall`,
            create: `/api/admin/groups/create`,
            update: `/api/admin/groups/update`,
            delete: `/api/admin/groups/delete`,
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
