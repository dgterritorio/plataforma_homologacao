// import { Model } from '@vuex-orm/core'
import BaseModel from '@/models/base.js'

export default class Requests extends BaseModel {
  // This is the name used as module name of the Vuex Store.
  static entity = 'HomologationRequestsStatistics'

  static primaryKey = 'id'

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.uid(),
      order_number: this.number(),
      name: this.string(''),
      vectorial: this.boolean(false),
      purpose: this.number(),
      start_date: this.string('', this.justDate),
      end_date: this.string('', this.justDate).nullable(),
      state_start_date: this.string('', this.justDate),
      state_deadline_date: this.string('', this.justDate).nullable(),
      code: this.number(-2),
      state_id: this.number(),
      collective_name: this.string('').nullable(),
      homologation_type: this.number(1),
      product_type: this.number(),
      ellapsed_days: this.number(),
      deadline: this.number().nullable(),
      deadline_date: this.string('', this.justDate).nullable(),
      remaining_days: this.number().nullable(),
      total_processing_time: this.number(0),
      absolute_processing_time: this.number(0),
      state_progress: this.number(),
      state_processing_time: this.number(0),
      intervening: this.boolean(),
      must_intervene: this.boolean().nullable(),
      description: this.string(),
      finished: this.boolean(),
      exceptional_regime: this.boolean(false),
      county: this.string(),
      applicant_id: this.number(),
      applicant_name: this.string(),
      producers_list: this.attr(),
      applicant_is_owner: this.boolean(),
      owner_name: this.string().nullable(),
      epsg: this.number(),
      data_specification: this.number(),
      data_specification_custom: this.number().nullable(),
      data_type: this.number(),
      data_type_custom: this.number().nullable(),
      area: this.number(),
      evaluation_owner_id: this.number().nullable(),
      evaluation_owner_name: this.string().nullable(),
      is_evaluation_owner: this.boolean(false),
      requires_evaluation_owner: this.boolean(false),
      tax: this.number().nullable(),
      expenses: this.number().nullable(),
      observations: this.string().nullable()
    }
  }

  static state() {
    return {
      ...super.state(),
      sortBy: ['start_date'],
      sortOrder: [false],
      autoSync: false
    }
  }

  /**
   * Getters
   */
  date(tstamp) {
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

    return day + " / " + month + " / " + year;
  }

  get start_date_trim() {
    return this.start_date;
  }

  get state_start_date_trim() {
    return this.state_start_date;
  }

  get end_date_str() {

    if (this.finished) {
      if (this.code > 55 && this.code < 100) {
        return this.end_date;
      } else {
        return 'Não-homologado'
      }
    } else {
      return 'Em progresso'
    }
  }

  get type_description() {
    return this.vectorial ? 'Vetorial' : 'Imagem'
  }

  get type_homologation() {
    switch (this.homologation_type) {
      case 2:
        return 'A';
      case 3:
        return 'B';
      default:
        return '-';
    }
  }

  get type_homologation_long() {
    let type;

    switch (this.homologation_type) {
      case 2:
        type = 'A';
        break;
      case 3:
        type = 'B';
        break;
      default:
        type = null;
        break;
    }

    return type ? 'Homologação do tipo ' + type : 'Tipo por definir'
  }

  get exceptional_regime_description() {
    return this.exceptional_regime ? 'Sim' : 'Não'
  }

  get code_description() {
    return '';
  }

  get code_color() {
    return 'red darken-2';
  }

  get intervening_description() {
    return this.intervening ? 'Avaliador' : 'Requerente';
  }

  get must_intervene_description() {
    return this.must_intervene ? 'Sim' : 'Não';
  }

  static apiConfig = {
    api: {
      read: `/api/homologation/request/getall`
    },
    actions: {
      ...super.apiConfig.actions
    }
  }
}
