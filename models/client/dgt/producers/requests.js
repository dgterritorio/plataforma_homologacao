// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'ProducerRequests'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      order_number: this.number(),
      name: this.string(''),
      email: this.string(''),
      vat: this.string(''),
      phone: this.string(''),
      address: this.string(''),
      locality: this.string(''),
      county: this.string(''),
      zipcode: this.string(''),
      carto_vectorial: this.boolean(false),
      carto_imagery: this.boolean(false),
      carto_aerial: this.boolean(false),
      cae: this.string(''),
      cpr_code: this.string('').nullable(),
      url: this.string('').nullable(),

      observations: this.string('').nullable(),
      login_hash: this.string(),

      // vectorial: this.boolean(false),
      start_date: this.string('', this.justDate),
      state_start_date: this.string('', this.justDate),
      state_end_date: this.string('', this.justDate).nullable(),
      code: this.number(-2),
      state_id: this.number(),
      is_collective: this.boolean(),
      is_comercial: this.boolean(),

      ellapsed_days: this.number(),
      remaining_days: this.number().nullable(),
      deadline: this.number().nullable(),
      deadline_date: this.string('', this.justDate).nullable(),
      state_progress: this.number(),
      intervening: this.boolean(),
      must_intervene: this.boolean(),
      description: this.string(),
      finished: this.boolean(),
      //applicant_id: this.number()
    }
  }

  static state() {
    return {
      ...super.state(),
      sortBy: ['state_start_date'],
      sortOrder: [false],
      autoSync: false
    }
  }

  /**
   * Getters
   */
  get date() {
    const tstamp = this.start_date;

    if (!tstamp.length) {
      return "";
    }

    const tstampObj = new Date(tstamp);

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

  get is_collective_description() {
    return this.is_collective ? 'Colectiva' : 'Singular'
  }

  get is_comercial_description() {
    return this.is_comercial ? 'Sim' : 'Não'
  }

  get carto_aerial_description() {
    return this.carto_aerial ? 'Sim' : 'Não'
  }

  get carto_vectorial_description() {
    return this.carto_vectorial ? 'Sim' : 'Não'
  }

  get carto_imagery_description() {
    return this.carto_imagery ? 'Sim' : 'Não'
  }

  get code_color() {
    return 'red darken-2';
  }

  get intervening_description() {
    return this.intervening ? 'Avaliador' : 'Produtor';
  }

  get must_intervene_description() {
    return this.must_intervene ? 'Sim' : 'Não';
  }

  static apiConfig = {
    api: {
      read: `/api/producer/entity/getall`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
