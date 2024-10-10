import BaseModel from '@/models/base.js'

export default class Users extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'webapp.users'

    static primaryKey = 'id'

    // List of all fields (schema) of the post model. `this.attr` is used
    // for the generic field type. The argument is the default value.
    static fields() {
        return {
            id: this.uid(),
            name: this.string(''),
            group_id: this.number(null),
            email: this.string(''),
            empresas: this.string(''),
            password: this.string(''),
            active: this.boolean(),
            confirmed: this.boolean(),
            creation_date: this.string(),
            mod_date: this.string().nullable()
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
            read: `/api/admin/users/getall`,
            create: `/api/admin/users/create`,
            update: `/api/admin/users/update`,
            delete: `/api/admin/users/delete`,
        },
        actions: {
            ...super.apiConfig.actions
        }
    }
}
