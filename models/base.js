import { Model } from '@vuex-orm/core'

export default class BaseModel extends Model {
    // This is the name used as module name of the Vuex Store.
    static entity = 'basemodel'

    static state() {
        return {
            total: 0,

            limit: 10,
            start: 0,
            sortBy: [],
            sortOrder: [],
            filters: [],

            currStart: null,
            currLimit: null,
            currSortBy: [],
            currSortOrder: [],
            currGroupBy: null,
            currAggrFields: null,
            currAggrOps: null,
            currFilters: [],

            loaded: false,
            ready: false,

            synced: true,
            autoSync: true,
            stateDirty: {},
            toCreate: [],

            readOnce: false,
            reloadOnLogin: true
        }
    }

    static getSyncState() {
        const { synced, autoSync, stateDirty, toCreate } = this.store().state.entities[this.entity];

        return { synced, autoSync, stateDirty, toCreate };
    }

    static setCreateRequestState(req, value) {
        this.commit(state => {
            const found = state.toCreate.indexOf(req);
            if (found != -1) {
                state.toCreate[found].request = value;
            } else {
                console.log('Problem setting sync states for store: ', this.entity);
            }
        });
    }

    static setStoreReady(value) {
        this.commit(state => {
            state.ready = value;
        });
    }

    static removeCreate(req) {
        this.commit(state => {
            const found = state.toCreate.indexOf(req);
            if (found != -1) {
                state.toCreate.splice(found, 1);
            } else {
                console.log('Problem setting sync states for store: ', this.entity);
            }
        });
    }

    static setDirtyRequestState(key, value) {
        this.commit(state => {
            if (state.stateDirty.hasOwnProperty(key)) {
                state.stateDirty[key]['request'] = value;
            } else {
                console.log('Problem setting sync states for store: ', this.entity);
            }
        });
    }

    static removeDirtyState(key) {
        this.commit(state => {
            if (state.stateDirty.hasOwnProperty(key)) {
                delete state.stateDirty[key];
            } else {
                console.log('Problem setting sync states for store: ', this.entity);
            }
        });
    }

    static async registerCreateLocal(model) {
        this.commit(state => {
            state.toCreate.push({
                data: model.$toJson(),
                entity: model,
                request: false
            });
        });

        this.commit(state => {
            state.synced = false;
        });
    }

    static async registerUpdateLocal(model) {
        let key = model[this.primaryKey];

        this.commit(state => {
            if (state.stateDirty.hasOwnProperty(key)) {
                state.stateDirty[key]['request'] = false;
                Object.assign(state.stateDirty[key]['data'], model.$toJson());
            } else {
                state.stateDirty[key] = {
                    operation: 'update',
                    data: model.$toJson(),
                    entity: model,
                    request: false
                };
            }
        });

        this.commit(state => {
            state.synced = false;
        });
    }

    static async registerDeleteLocal(model) {
        let key = model[this.primaryKey];

        this.commit(state => {
            if (state.stateDirty.hasOwnProperty(key)) {
                state.stateDirty[key]['request'] = false;
                Object.assign(state.stateDirty[key]['data'], model.$toJson());
            } else {
                state.stateDirty[key] = {
                    operation: 'destroy',
                    data: model.$toJson(),
                    entity: model,
                    request: false
                };
            }
        });

        this.commit(state => {
            state.synced = false;
        });
    }

    static primaryKeyValid(model) {
        if (Array.isArray(this.primaryKey)) {
            let res = true;
            this.primaryKey.forEach(k => {
                res = res && !isNaN(model[k]);
            });
            return res;
        } else {
            return model[this.primaryKey] && !isNaN(model[this.primaryKey]);
        }
    }

    // Lifecycle Hooks
    static async afterCreate(model) {
        const { autoSync, ready } = this.store().state.entities[this.entity];

        // If not ready...
        if (!ready) {
            // there is a read operation running. exit
            return;
        }

        // console.log("Creating model: ", ready)

        // Check if there is an access point configured
        const hasAPI = !!this.apiConfig.api.create

        // console.log('call afterCreate');
        if (!this.primaryKeyValid(model) && hasAPI) {
            console.log('call registerCreateLocal: ', this.entity);
            await this.registerCreateLocal(model);

            if (autoSync) {
                await this.api().sync();
            }
        }
    }

    static async afterUpdate(model) {
        const { autoSync, ready } = this.store().state.entities[this.entity];

        // If not ready...
        if (!ready) {
            // there is a read operation running. exit
            return;
        }

        // console.log("Updating model: ", ready)

        // Check if there is an access point configured
        const hasAPI = !!this.apiConfig.api.update;

        // console.log('call afterUpdate');
        if (this.primaryKeyValid(model) && hasAPI) {
            console.log('call registerUpdateLocal: ', this.entity);
            await this.registerUpdateLocal(model);

            if (autoSync) {
                await this.api().sync();
            }
        }
    }

    static async afterDelete(model) {
        const { autoSync, ready } = this.store().state.entities[this.entity];

        // If not ready...
        if (!ready) {
            // there is a read operation running. exit
            return;
        }

        // console.log("Removing model: ", ready)

        // if (!this.apiConfig.api.destroy) return;
        const hasAPI = !!this.apiConfig.api.delete;

        // console.log('call afterDelete');
        if (this.primaryKeyValid(model) && hasAPI) {
            console.log('call registerDeleteLocal: ', this.entity);
            await this.registerDeleteLocal(model);

            if (autoSync) {
                await this.api().sync();
            }
        }
    }

    /**
     * Override vuex-orm insert(record|array)
     * @param {*} payload 
     * @returns 
     */
    static async insert(payload) {
        // console.log("[INSERT] ", payload)
        const res = await super.insert(payload);

        // Get the records inserted fot the main entity
        // TODO: handle relationships here
        const records = res[this.entity];

        const count = records.length;

        // After an insert operation
        await this.commit((state) => {
            state.total = state.total + count
        });

        return res;
    }

    static async delete(payload) {
        // console.log("[DELETE] ", payload)
        const records = await super.delete(payload)

        // Get the records deleted fot the main entity
        // TODO: handle relationships here
        const count = records.length;

        // After an insert operation
        await this.commit((state) => {
            state.total = state.total - count
        });

        return records;
    }

    static async deleteAll() {
        // console.log("[DELETE ALL] ")
        const count = this.all().length;

        await super.deleteAll();

        // After an insert operation
        await this.commit((state) => {
            state.total = state.total - count;
        });
    }

    static checkArrayEquality(a, b) {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (a.length !== b.length) return false;


        // TODO: Should we order ?
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }

        return true;
    }

    static checkSortChange(sortBy, sortOrder) {
        const { currSortBy, currSortOrder } = this.store().state.entities[this.entity];

        const isArray = Array.isArray(sortBy);

        if (!isArray) {
            return sortBy !== currSortBy || sortOrder !== currSortOrder;
        } else {

            // TODO: Ref's cannot be compared (are they being poluted?)
            if (
                // sortBy !== currSortBy ||
                // sortOrder !== currSortOrder ||
                sortBy.length !== currSortBy.length ||
                sortOrder.length !== currSortOrder.length
            ) {
                return true;
            }

            for (let i = 0; i < sortBy.length; i++) {
                if (sortBy[i] !== currSortBy[i] || sortOrder[i] !== currSortOrder[i]) {
                    return true
                }
            }

            return false;
        }

    }

    static checkFiltersChange(newFilters) {
        const { currFilters } = this.store().state.entities[this.entity];

        // If no new filters, return reload true if old.len > 0
        if (!newFilters) {
            return !!currFilters.length;
        }

        // If len is different, return reload
        if (currFilters.length !== newFilters.length) {
            return true;
        }

        const mapping = {};

        // Create mapping for old filters
        currFilters.forEach(function (filter) {
            const property = filter.property;
            const operator = filter.operator;

            mapping[property + operator] = filter.value;
        });

        // Test if new filters are different in values, properties or operators
        for (let i = 0; i < newFilters.length; i++) {
            const newFilter = newFilters[i];

            const newOperator = newFilter.operator;
            const newProperty = newFilter.property;
            const newValue = newFilter.value;

            const mappingKey = newProperty + newOperator;

            // If the key was not present
            if (!mapping.hasOwnProperty(mappingKey)) {
                return true;
            }

            // if types not equal
            if (typeof mapping[mappingKey] !== typeof newValue) {
                return true;
            }

            // If its an array
            if (Array.isArray(newValue)) {

                // Deep compare
                if (!this.checkArrayEquality(mapping[mappingKey], newValue)) {
                    console.log("NOT EQUAL", newValue, mapping[mappingKey])
                    return true;
                }

                // else compare values
            } else if (mapping[mappingKey] !== newValue) {
                return true;
            }
        }

        return false;
    }

    static async addFilter(property, operator, value, type) {
        const { currFilters } = this.store().state.entities[this.entity];
        let filters = [];

        currFilters.forEach(function (filter) {
            if (filter.property !== property || filter.operator !== operator) {
                filters.push(filter);
            }
        });

        let aflt = {
            "property": property,
            "operator": operator,
            "value": value,
        };

        if (type) aflt["type"] = type;
        filters.push(aflt);

        await this.commit((state) => {
            state.currFilters = filters;
            state.filters = filters;
        });
    }

    static async setFilter(property, operator, value, type) {
        const { currFilters } = this.store().state.entities[this.entity];
        let filters = [];

        currFilters.forEach(function (filter) {
            if (filter.property !== property || filter.operator !== operator) {
                filters.push(filter);
            }
        });

        let aflt = {
            "property": property,
            "operator": operator,
            "value": value,
        };

        if (type) aflt["type"] = type;
        filters.push(aflt);

        await this.commit((state) => {
            state.filters = filters;
        });
    }

    static async setFilters(filters) {
        await this.commit((state) => {
            state.filters = filters;
        });
    }

    static async clearFilter(property) {
        const { currFilters } = this.store().state.entities[this.entity];
        let filters = [];

        currFilters.forEach(function (filter) {
            if (filter.property !== property) {
                filters.push(filter);
            }
        });

        await this.commit((state) => {
            state.filters = filters;
        });
    }

    static async clearFilters(properties) {
        const { currFilters } = this.store().state.entities[this.entity];
        let filters = [];

        currFilters.forEach(function (filter) {
            if (!properties.includes(filter.property)) {
                filters.push(filter);
            }
        });

        await this.commit((state) => {
            state.filters = filters;
        });
    }

    static isLoaded() {
        const { loaded } = this.store().state.entities[this.entity]

        return loaded;
    }

    static getTotal() {
        const { total } = this.store().state.entities[this.entity]

        return total;
    }

    static getMetadata() {
        const { total, limit, start, filters, sortBy, sortOrder, currFilters, currSortBy, currSortOrder, currStart, currLimit, loaded, readOnce, reloadOnLogin } = this.store().state.entities[this.entity]

        return { total, limit, start, filters, sortBy, sortOrder, currFilters, currSortBy, currSortOrder, currStart, currLimit, loaded, readOnce, reloadOnLogin };
    }

    static getReady() {
        const metadata = this.getMetadata();

        return metadata.ready;
    }

    static orderBy(property, direction) {
        return this.query()
            .orderBy(property, direction ? 'asc' : 'desc');
    }

    static checkNeedReload(options) {
        const { currLimit, currStart, currGroupBy, currAggrFields, currAggrOps, loaded } = this.store().state.entities[this.entity];

        if (!loaded) {
            return 'init';
        }

        if (this.checkFiltersChange(options.filter)) {
            return 'filter';
        }

        if (this.checkSortChange(options.sortBy, options.sortOrder)) {
            return 'sort';
        }

        // TODO: Some properties are undefined while they should be null
        if (!(options.groupBy == currGroupBy)) {
            return 'group'
        }

        if (!(options.aggrFields == currAggrFields)) {
            return 'aggr'
        }

        if (!(options.aggrOps == currAggrOps)) {
            return 'aggrOps';
        }

        if (!(options.start === currStart &&
            options.limit === currLimit)) {
            return 'page';
        }

        // return !loaded ||
        //     !(options.sortBy === currSortBy &&
        //         options.sortOrder === currSortOrder &&
        //         options.start === currStart &&
        //         options.limit === currLimit &&
        //         !this.checkFiltersChange(options.filter));

        return null;
    }

    static justDate(value) {
        return (value != null && typeof value == 'string') ? value.split('T')[0] : null
    }

    static justYear(value) {
        try {
            return (value != null && typeof value == 'string') ? parseInt(value.split('-')[0]) : null
        } catch (e) {
            console.log("Error converting date: ", e)
            return null;
        }
    }

    static async setAuthDirty() {
        const { reloadOnLogin } = this.getMetadata();

        if (reloadOnLogin) {
            this.commit(state => {
                state.loaded = false;
            });
        }
    }

    static apiConfig = {
        api: {
            read: null,
            create: null,
            update: null,
            delete: null
        },

        actions: {
            async refresh() {
                const metadata = this.model.getMetadata();

                let limit = metadata.currLimit;
                let start = metadata.currStart;
                let sortBy = metadata.currSortBy;
                let sortOrder = metadata.currSortOrder;
                let filters = metadata.currFilters;


                // console.log({
                //     limit: limit,
                //     start: start,
                //     sortBy: sortBy,
                //     sortOrder: sortOrder,
                //     filters: filters
                // })

                return await this.read({
                    forceReload: true,
                    limit: limit,
                    start: start,
                    sortBy: sortBy,
                    sortOrder: sortOrder,
                    filters: filters
                });
            },


            async read(params = {}) {
                let model = this.model;

                let config = model.apiConfig;
                let metadata = model.getMetadata();

                let url = config.api.read;
                let res = null;

                // If read only once
                if (metadata.readOnce && metadata.loaded && !params.forceReload) {
                    return;
                }

                // if (!!params.once === true && metadata.loaded) {
                //     return;
                // }

                await model.commit((state) => {
                    state.ready = false;
                });

                // try {
                // -1 = all records
                let limit = Number.isInteger(params.limit) && params.limit >= -1 ? params.limit : metadata.limit;
                let start = Number.isInteger(params.start) ? params.start : metadata.start;
                let sortBy = params.sortBy && params.sortBy ? params.sortBy : metadata.sortBy;
                let sortOrder = params.sortOrder ? params.sortOrder : metadata.sortOrder;
                let filters = Array.isArray(params.filters) && params.filters.length ? params.filters : [];
                let clear = params.hasOwnProperty('clear') ? params.clear : false;

                let groupBy = params.groupBy ? params.groupBy : null;
                let aggrFields = params.aggrFields ? params.aggrFields : null;
                let aggrOps = params.aggrOps ? params.aggrOps : null;

                // Concat with the default filters
                filters = filters.concat(metadata.filters);

                let reqParams = params.hasOwnProperty('defParams') ? JSON.parse(JSON.stringify(params.defParams)) : {};

                let shouldClear = clear;

                // Paging params
                if (Number.isInteger(limit) && Number.isInteger(start)) {
                    reqParams['limit'] = limit !== - 1 ? limit : null;
                    reqParams['start'] = start;

                    shouldClear = true;
                }

                // Sorting params
                if (sortBy) {
                    reqParams['sortBy'] = sortBy;
                    reqParams['sortOrder'] = sortOrder;
                }

                if (groupBy) {
                    reqParams['groupBy'] = groupBy;
                }

                if (aggrFields) {
                    reqParams['aggrFields'] = aggrFields;
                }

                if (aggrOps) {
                    reqParams['aggrOps'] = aggrOps;
                }

                // Filters
                if (Array.isArray(filters) && filters.length) {
                    reqParams['filter'] = filters;
                }

                const changeReason = model.checkNeedReload(reqParams);

                if (!changeReason && !params.forceReload) {
                    await model.commit((state) => {
                        state.ready = true;
                    });
                    return;
                }

                if (changeReason === 'filter') {
                    start = 0;
                    reqParams['start'] = start;
                }


                if (shouldClear) {
                    // model.deleteAll();
                    model.dispatch('deleteAll')
                }

                res = await this.post(url, reqParams);

                const response = res.response;

                if (response.error) {
                    throw response.error;
                }

                const data = response.data;

                const total = response.total ? response.total : data.length;

                await model.commit((state) => {
                    state.total = total;
                    state.loaded = true;
                    state.ready = true;
                    state.currSortBy = sortBy;
                    state.currSortOrder = sortOrder;
                    state.currGroupBy = groupBy;
                    state.currAggrFields = aggrFields;
                    state.currAggrOps = aggrOps;
                    state.currLimit = limit;
                    state.currStart = start;
                    state.currFilters = filters;
                });

                return res;
            },

            async sync() {
                console.log('sync')
                let model = this.model;
                let config = model.apiConfig;

                const { synced, toCreate, stateDirty } = model.getSyncState();

                let success = true;
                // console.log(synced);
                // console.log(toCreate);
                if (!synced) {
                    // Inserts
                    for (let i = 0; i < toCreate.length; i++) {
                        let rec = toCreate[i];
                        if (!rec.request) {
                            model.setCreateRequestState(rec, true);
                            let url = config.api.create;
                            let reqParams = {
                                entity: model.entity,
                                method: 'create',
                                key: 'id',
                                data: [rec.data],
                                _csrf: model.store().$csrfToken()
                            }

                            let res;

                            // Request create
                            try {
                                res = await this.post(url, reqParams, { save: false });
                            } catch (err) {
                                model.setCreateRequestState(rec, false);
                                success = false;
                                console.log(err);
                            }

                            // process response
                            if (res) {
                                const response = res.response;

                                // If error on create
                                if (response.error) {
                                    model.setCreateRequestState(rec, false);
                                    success = false;
                                    throw response.error;
                                }

                                // If success
                                if (response && response.data) {
                                    // await rec.data.$update({ where: rec.data[model.primaryKey], data: response.data[0] });
                                    await rec.entity.$delete();
                                    await model.insert({ data: response.data[0] });

                                    model.removeCreate(rec);
                                }
                            }
                        }
                    }

                    // Updates & Deletes
                    let keys = Object.keys(stateDirty);
                    for (let i = 0; i < keys.length; i++) {
                        let id = keys[i];
                        let rec = stateDirty[id];
                        let response;
                        let update = false;

                        if (!rec.request && rec.operation == 'update') {
                            update = true;
                            model.setDirtyRequestState(id, true);
                            let reqParams = {
                                entity: model.entity,
                                method: 'update',
                                key: 'id',
                                data: rec.data,
                                _csrf: model.store().$csrfToken()
                            }

                            let res;
                            try {
                                res = await this.post(config.api.update, reqParams, { save: false });
                            } catch (err) {
                                model.setCreateRequestState(rec, false);
                                success = false;
                                console.log(err);
                            }

                            response = (res) ? res.response : null;

                        } else if (!rec.request && rec.operation == 'destroy') {
                            model.setDirtyRequestState(id, true);
                            let reqParams = {
                                entity: model.entity,
                                method: 'destroy',
                                key: 'id',
                                data: [rec.data],
                                _csrf: model.store().$csrfToken()
                            }

                            let res;
                            try {
                                res = await this.post(config.api.delete, reqParams, { save: false });
                            } catch (err) {
                                model.setCreateRequestState(rec, false);
                                success = false;
                                console.log(err);
                            }

                            response = (res) ? res.response : null;
                        }

                        if (response && response.error) {
                            success = false;
                            model.setDirtyRequestState(id, false);
                            throw response.error;
                        }

                        if (response && response.data) {
                            model.removeDirtyState(id);
                            if (update) {
                                model.setStoreReady(false);
                                // rec.entity.$update(response.data);
                                await model.update({
                                    where: (item) => {
                                        let cond = true;
                                        if (Array.isArray(model.primaryKey)) {
                                            model.primaryKey.forEach(fld => {
                                                cond = cond && (item[fld] == response.data[fld]);
                                            });
                                        } else {
                                            cond = cond && (item[model.primaryKey] == response.data[model.primaryKey]);
                                        }
                                        return cond;
                                    },
                                    data: response.data,
                                });
                                model.setStoreReady(true);

                                // Do nothing to totalDiff
                            } else {
                                // Do nothing
                            }
                        } else {
                            model.setDirtyRequestState(id, false);
                            success = false;
                        }
                    }
                }

                if (success) {
                    await model.commit((state) => {
                        state.synced = true;
                    });
                }

                // console.log(model.all());
            },
        }
    }
}
