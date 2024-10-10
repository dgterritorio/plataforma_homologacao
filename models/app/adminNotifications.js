// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'AdminNotifications'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      user_id: this.string(),
      user_name: this.string(),
      from_contact: this.string(),
      to_contact: this.string(),
      subject: this.string(),
      category_name: this.string(),
      category_color: this.string(),
      creation_date: this.string(),
      send_date: this.string().nullable(),
      read_date: this.string().nullable(),
    }
  }

  static state() {
    return {
      ...super.state(),
      autoSync: false,
      sortBy: ['send_date'],
      sortOrder: [true]
    }
  }

  toDate(tstamp) {
    if (!tstamp || !tstamp.length) {
      return "-";
    }

    const tstampObj = new Date(tstamp);

    let day = tstampObj.getDate();
    let month = tstampObj.getMonth() + 1;
    let year = tstampObj.getFullYear();

    let hours = tstampObj.getHours();
    let mins = tstampObj.getMinutes();

    if (day < 10) {
      day = "0" + day;
    }

    if (month < 10) {
      month = "0" + month;
    }

    if (hours < 10) {
      hours = "0" + hours;
    }

    if (mins < 10) {
      mins = "0" + mins;
    }

    return hours + ':' + mins + ' - ' + day + "/" + month + "/" + year;
  }

  get creation_date_str() {
    return this.toDate(this.creation_date)
  }

  get send_date_str() {
    return this.toDate(this.send_date)
  }

  get read_date_str() {
    return this.toDate(this.read_date)
  }

  get was_send() {
    return !!this.send_date;
  }

  static apiConfig = {
    api: {
      read: `/api/admin/notifications/getall`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
