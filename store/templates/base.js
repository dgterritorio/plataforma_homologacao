export default class {
  constructor(endpoint) {
    this.state = {
      limit: 500, // records per page
      start: 0,   // page start
      paginate: false, // paginate

      autoLoad: true,

      absLen: 0, // Absolute count of records (ignores paging)

      defaultSortColumn: 'id', // default sorting column
      defaultSortDirection: 'ASC', // default sorting direction
      sort: false, // sort
      filter: [],

      pkey: 'id', // default primary key

      fields: [], // store fields
      records: [], // store rows

      defaultTable: null // default table to query
    };
    this.getters = {
      paginate: function (state) {
        return state.paginate;
      },

      limit: function (state) {
        return state.limit;
      },

      start: function (state) {
        return state.start;
      },

      absLen: function (state) {
        return state.absLen;
      },

      sort: function (state) {
        return state.sort;
      },

      sortColumn: function (state) {
        return state.defaultSortColumn;
      },

      sortDirection: function (state) {
        return state.defaultSortDirection;
      },

      fields: function (state) {
        return state.fields;
      },

      records: function (state) {
        return state.records;
      },

      defaultTable: function (state) {
        return state.defaultTable;
      },

      pkey: function (state) {
        return state.pkey;
      },
      filter: function (state) {
        return state.filter;
      },
      autoLoad: function (state) {
        return state.autoLoad;
      }

      // id: state => id => state.known.find( o => o.id === id )
    };
    this.actions = {

      // Generic read util
      async read(context, payload) {
        const table = context.getters['defaultTable'];
        const pagination = context.getters['paginate'];
        const sorted = context.getters['sort'];
        const filter = context.getters['filter'];

        const req_data = {
          type: 'read',
          defaultTable: table
        };

        if (payload) {
          const service = payload.service;

          if (service) {
            req_data['service'] = service;
          }

          let limit = 0;

          if (pagination) {
            limit = payload.limit !== undefined ? payload.limit : context.getters['limit'];

            if (limit > 0) {
              req_data['limit'] = limit;
              req_data['start'] = payload.start ? payload.start : context.getters['start'];
            }
          }

          if (sorted) {
            const sortColumn = payload.sortColumn;
            const sortDirection = payload.sortDirection;

            const property = sortColumn ? sortColumn : context.getters['sortColumn'];
            const direction = sortDirection ? sortDirection : context.getters['sortDirection'];

            req_data['defaultSortColumn'] = property;
            req_data['defaultSortDirection'] = direction;
          }

          if (payload.hasOwnProperty('filter')) {
            req_data['filter'] = payload.filter;
          } else if (filter.length) {
            req_data['filter'] = filter;
          }
        }

        try {
          // Request the end-point
          let res =
            await this.$axios.post('/util', req_data);

          if (res.error) {
            throw res.error;
          }

          const result = res.data;

          // Process the layers
          let records = result.data;
          let count = result.total;

          // Commit the records and the absolute len
          context.commit("READ", records);
          context.commit("ABS_LEN", count);

          return res;
        } catch (e) {
          return e;
        }
      },

      // Generic create util
      async create(context, payload) {
        const table = context.getters['defaultTable'];
        const pkey = context.getters['pkey'];

        const records = payload.record ? [payload.record] : payload.records;

        const req_data = {
          type: 'create',
          defaultTable: table,
          values: records,
          pkey: pkey
        };

        const service = payload.service;

        if (service) {
          req_data['service'] = service;
        }

        try {
          let res =
            await this.$axios.post('/util', req_data);

          if (res.error) {
            throw res.error;
          }

          const result = res.data;



          const data = result.data;
          const total = result.total;

          if (total === records.length) {
            context.commit("CREATED", data);
          }

          return res;
        } catch (e) {
          return e;
        }
      },

      // Generic update util
      async update(context, payload) {
        const table = context.getters['defaultTable'];
        const pkey = context.getters['pkey'];

        const records = payload.record ? [payload.record] : payload.records;

        const req_data = {
          type: 'update',
          defaultTable: table,
          values: records,
          pkey: pkey
        };

        const service = payload.service;

        if (service) {
          req_data['service'] = service;
        }

        try {
          let res =
            await this.$axios.post('/util', req_data);

          if (res.error) {
            throw res.error;
          }

          const result = res.data;

          const data = result.data;
          const total = result.total;

          if (total === records.length) {
            context.commit("UPDATED", {
              records: records,
              updated: data
            });
          }

          return res;
        } catch (e) {
          return e;
        }
      },

      // Generic delete util
      async destroy(context, payload) {

        const table = context.getters['defaultTable'];
        const pkey = context.getters['pkey'];

        let records = payload.record ? [payload.record] : payload.records;

        let to_remove = [];

        to_remove = records.map(function (rec) {
          const json_placeholder = {};

          json_placeholder[pkey] = rec[pkey];

          return json_placeholder;
        });

        const req_data = {
          type: 'destroy',
          defaultTable: table,
          values: to_remove,
          pkey: pkey
        };

        const service = payload.service;

        if (service) {
          req_data['service'] = service;
        }

        try {
          let res =
            await this.$axios.post('/util', req_data);

          if (res.error) {
            throw res.error;
          }

          if (res.data.total === records.length) {
            context.commit("DESTROYED", records);
          }

          return res;
        } catch (e) {
          return e;
        }
      }
    };

    this.mutations = {

      READ(state, records) {
        state.records = records;
      },

      CREATED(state, item) {
        if (Array.isArray(item)) {
          item.forEach(function (rec) {
            state.records.push(rec);
          });

          state.absLen = state.absLen + item.length;
        } else {
          state.records.push(item);

          state.absLen = state.absLen + 1;
        }
      },

      UPDATED(state, params) {
        const pkey = state.pkey;

        const records = params.records;
        const updatedRecords = params.updated;

        updatedRecords.forEach(function (uRecord) {
          const id = uRecord[pkey];

          const oldRecord = state.records.find(function (rec) {
            if (rec[pkey] === id) {
              return rec;
            }
          });

          if (oldRecord) {
            for (let key in uRecord) {
              oldRecord[key] = uRecord[key];
            }
          }

        });
      },

      DESTROYED(state, records) {
        // state.records
        records.forEach(function (rec) {
          const index = state.records.indexOf(rec);

          state.records.splice(index, 1);
        });

        state.absLen = state.absLen - records.length;
      },

      ABS_LEN(state, count) {
        state.absLen = count;
      }
    };
  }
}
