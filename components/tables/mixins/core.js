export default {
    props: {
        title: {
            type: String,
            default: null,
        },

        headers: {
            type: Array,
            default: function () {
                return [];
            },
        },

        data: {
            type: Array,
            default: function () {
                return [];
            },
        },

        noDataText: {
            type: String,
            default: null,
        },

        loadingText: {
            type: String,
            default: "Loading data...",
        },

        displayBtnText: {
            type: Boolean,
            default: false,
        },

        hideFooter: {
            type: true,
            default: false,
        },


        store: null,
        storeGetter: {
            type: String,
            default: "all",
        },

        storeRead: {
            type: String,
            default: "read",
        },

        api: {
            type: String,
            default: null
        },

        extraParams: {
            type: Object,
            default: function () {
                return {}
            }
        },

        autoLoad: {
            type: Boolean,
            default: true,
        },

        height: {
            default: 530,
        },


        defaultFilters: {
            type: Array,
            default: function () {
                return [];
            },
        },

        defaultSortBy: {
            type: String,
            default: null,
        },

        defaultSortOrder: {
            type: Boolean,
            default: true,
        },

        defaultLimit: {
            type: Number,
            default: 10
        },

        footerItemsPerPage: {
            type: Array,
            default: function () {
                return [10, 25, 50];
            },
        },

        disableActions: {
            type: Boolean,
            default: false,
        },

        multiSort: {
            type: Boolean,
            default: false,
        },

        transformFn: {
            type: Function,
            default: null,
        },
    },


    data() {
        return {
            showFilters: false, // show/hide filters
            showColumnsControl: false,
            showVisibilityFilters: false,
            filters: [], // current filters
            filteredHeaders: [],

            options: {
            }, // table options

            loading: false, // is loading

            selected: null, // selected row

            remote: false, // is remote or local
            apiCache: {
                limit: 10,
                sortBy: [],
                sortDesc: [],
                total: 0
            },

            data_: this.data,

            isOrm: false, // vuex or vuex-orm
            ormModel: null, // vuex-orm model instance
            ormNamespace: null, // vuex-orm database namespace

            dirty: false,
        };
    },

    created: function () {
        this.parseHeaders(this.headers);

        this.filterHeaders();

        // Set to remote if there is a store
        if (this.store) {
            this.remote = true;

            // store id
            const store = this.store;

            // Get the vuex-orm database
            const database = this.$store.$db();

            // Check if store is vuex-orm
            const modelsList = database.models();

            // If the list contains the model, its vuex-orm
            const isOrm = modelsList.hasOwnProperty(this.store);

            if (isOrm) {
                // and set the database namespace and model
                this.ormNamespace = database.namespace;
                this.ormModel = database.model(this.store);
            }

            this.isOrm = isOrm;
        }

        this.initOptions();
    },

    methods: {
        initOptions: function () {
            // Init table options
            const options = this.options;

            if (this.defaultSortBy !== null) {
                options["sortBy"] = [this.defaultSortBy];
            }

            if (this.defaultSortOrder !== null) {
                options["sortDesc"] = [!this.defaultSortOrder];
            }

            if (this.defaultLimit !== null) {
                options["itemsPerPage"] = this.defaultLimit;
            }

            if (this.store) {
                const metadata = this.ormModel.getMetadata();

                if (metadata && metadata.sortBy) {
                    options["sortBy"] = metadata.sortBy;
                    options["sortDesc"] = metadata.sortOrder.map((r) => !r);
                }
            }
        },


        isActionHeader: function (header) {
            return (
                header &&
                header.hasOwnProperty("renderer") &&
                header.renderer.type === "action"
            );
        },

        load: async function (opt) {
            await this.loadFromAPI(opt);
        },

        refresh: async function (opt) {
            this.load(opt);
        },

        loadFromAPI: async function (opt) {
            const store = this.store;
            const api = this.api;

            if (!store && !api) {
                return;
            }

            if (!this.autoLoad) {
                return;
            }

            await this.loadData(opt);
        },

        loadData: async function (opt) {
            if (this.loading) {
                return;
            }

            this.loading = true;

            const { sortBy, sortDesc, page, itemsPerPage } = this.options;

            // Set pagination options
            const req_options = {
                limit: itemsPerPage,
                start: itemsPerPage * (page - 1),
            };

            console.log(sortBy, sortDesc, page, itemsPerPage);

            // Set sorting options
            // if (sortBy) {
            req_options["sortBy"] = sortBy;
            req_options["sortOrder"] = sortDesc.map((r) => !r); // ? "ASC" : "DESC";
            // }

            let reqFilters = [];

            // Check if the component has default filters
            if (Array.isArray(this.defaultFilters) && this.defaultFilters.length) {
                reqFilters = this.defaultFilters;
            }

            // Check if the toolbar has filters
            if (Array.isArray(this.filters) && this.filters.length) {
                reqFilters = reqFilters.length
                    ? reqFilters.concat(this.filters)
                    : this.filters;
            }

            // If filters is not empty, add to request
            if (reqFilters.length) {
                req_options["filters"] = reqFilters;
            }

            // Check if force reaload
            if (opt && opt.hasOwnProperty("forceReload")) {
                req_options["forceReload"] = opt["forceReload"];
            }

            // Check dirty
            if (this.dirty) {
                req_options["forceReload"] = true;
            }

            if (this.defParams) {
                req_options["defParams"] = JSON.parse(JSON.stringify(this.defParams));
            }

            console.log("E: ", req_options);
            // Query API
            try {
                if (this.isOrm) {
                    await this.ormModel.api().read(req_options);
                } else {
                    // TODO: Remove this
                    req_options['filter'] = req_options['filters'];
                    delete req_options.filters;

                    const res = await this.$axios.post(this.api, {
                        ...req_options,
                        ...this.extraParams
                    });

                    if (res.error) {
                        throw res.error;
                    }

                    // console.log(res.data);

                    this.data_ = res.data;
                    // Trigger reactivity
                    this.apiCache = {
                        ...this.apiCache,
                        total: res.total,
                        limit: itemsPerPage,
                        start: itemsPerPage * (page - 1),
                        sortBy: sortBy,
                        sortDesc: sortDesc
                    }
                    // this.apiCache.total = res.total;
                    // this.apiCache.limit = itemsPerPage;
                    // this.apiCache.start = itemsPerPage * (page - 1);
                    // this.apiCache.sortBy = sortBy;
                    // this.apiCache.sortDesc = sortDesc;


                    //     await this.$store.dispatch(this.store + this.storeRead);
                }
            } catch (e) {
                console.log("Error: ");
            }

            this.dirty = false;
            this.loading = false;
        },

        transformRow: function (row, headers) {
            // Use the transformation function
            const fn = this.transformFn;

            // For each header with transform,
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];

                const transform = header.transform;

                const value = row[header.value];

                // transform the value,
                // input is always the transform object + value
                const transformedValue = fn({
                    ...transform,
                    value: value,
                });

                // and store it in {property}_transformed
                row[header.value + "_transformed"] = transformedValue;
            }

            return row;
        },

        transformRows: function (rows) {
            // Filter headers that need transformation
            const headers = this.headers.filter((h) => h.hasOwnProperty("transform"));

            // If no transformation is provided
            if (headers.length === 0) {
                return rows;
            }

            // Transform each row
            for (let i = 0; i < rows.length; i++) {
                this.transformRow(rows[i], headers);
            }

            return rows;
        },

        parseRows: function (rows) {
            // Transform rows before returning
            if (this.transformFn) {
                return this.transformRows(rows, this.headers);
            }

            return rows;
        },

        clear: function () {
            if (!this.isOrm) {
                this.rows = [];

                return;
            }

            if (!this.isOrm) {
                this.$store.dispatch(this.store + "/clear");

                return;
            }

            // this.ormModel.deleteAll();
        },

        filterHeaders: function () {
            const self = this;
            const disableActions = this.disableActions;

            this.filteredHeaders = this.headers.filter(function (h) {
                return !h.hide && !(disableActions && self.isActionHeader(h));
            });
        },


        emitEvent: function (event, item) {
            let record;

            if (!event) {
                return;
            }

            if (!this.isOrm) {
                record = item;
            } else {
                const model = this.ormModel;

                const pkey = model.primaryKey;

                const isComposite = typeof pkey === "object";

                const pkeyValue = isComposite ? JSON.parse(item.$id) : item.$id;

                record = model.find(pkeyValue);
            }

            this.$emit(event, record);
        },


        onClearFilters: function () {
            this.$refs.filters.clear();
        },

        onFilter: function (filters) {
            this.filters = filters;

            this.loadFromAPI();
        },

        onFilterHeaders: function () {
            this.filterHeaders();
        },

        setDirty: function (value) {
            this.dirty = value;
        },
    },


    computed: {
        page: function () {
            if (!this.store && !this.api) {
                return 1;
            } else if (this.api) {
                let { start, limit } =
                    this.apiCache;

                if (start === null || isNaN(start) || limit === null || isNaN(limit)) {
                    return 1;
                }

                // Safety floor
                const page = Math.floor(1 + start / limit);

                return page;
            }

            if (this.ormModel) {
                let { currStart, currLimit, start, limit } =
                    this.ormModel.getMetadata();

                if (currStart === null || currLimit === null) {
                    return 1;
                }

                // Safety floor
                const page = Math.floor(1 + currStart / currLimit);

                return page;
            } else {
                return 1;
            }
        },

        pageCount: function () {
            return Math.ceil(this.total / this.itemsPerPage)
        },

        pageText: function () {
            const begin = this.page ? (this.page - 1) * this.itemsPerPage : 0;
            const end = this.rows ? begin + this.rows.length : 0;
            const total = this.total ? this.total : 0;

            return `${begin + 1}-${end} ` + this.$t("of") + ` ${total}`;
        },

        itemsPerPage: function () {
            if (!this.store && !this.api) {
                return 10;
            } else if (this.api) {
                return this.apiCache.limit;
            }

            if (!this.isOrm) {
                const { currLimit } = this.$store.getters[this.store + "/metadata"];

                return currLimit;
            } else {
                const { currLimit } = this.ormModel.getMetadata();

                return currLimit;
            }
        },

        rows: function () {
            // If it is remote, return data
            if (!this.remote || this.api) {
                return this.parseRows(this.data_);
            }

            // remote store
            const store = this.store;

            // If no store, return empty
            if (!store) {
                return [];
            }

            // Store getter to read all data
            let getter;

            // If vuex, return data
            if (!this.isOrm) {
                getter = this.store + "/" + this.storeGetter;

                return this.parseRows(this.$store.getters[getter]);
            }

            const sortBy = this.options.sortBy;
            const sortDesc = this.options.sortDesc;

            // If sorted, we need to query the vuex-orm store with sorting on
            if (sortBy && sortBy.length) {
                const query = this.ormModel.query();

                for (let i = 0; i < sortBy.length; i++) {
                    query.orderBy(sortBy[i], !sortDesc[i] ? "asc" : "desc");
                }

                // Return the result ordered, else this will overwrite the v-table
                return this.parseRows(query.get());
            } else {
                // If vuex-orm, we need to include the database namespace
                getter = this.ormNamespace + "/" + this.store + "/all";

                const getterFn = this.$store.getters[getter];

                // If this is vuex-orm, the getter will be a function
                return this.parseRows(getterFn());
            }
        },

        total: function () {
            if (!this.store && !this.api) {
                return this.data_.length;
            } else if (this.api) {
                return this.apiCache.total;
            }

            if (!this.isOrm) {
                const { total } = this.$store.getters[this.store + "/metadata"];

                return total;
            } else {
                const { total } = this.ormModel.getMetadata();

                return total;
            }
        },

        renderers: function () {
            const headers = this.headers;

            if (headers.length) {
                const renderers = headers.filter(function (header) {
                    return header.hasOwnProperty("renderer");
                });

                return renderers;
            } else {
                return [];
            }
        },

        hasFilters: function () {
            const headers = this.headers;

            let hasFilters = false;

            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];

                if (header.hasOwnProperty("filterable")) {
                    hasFilters = true;

                    break;
                }
            }

            return hasFilters;
        },
    },

    watch: {
        options: {
            handler(opt) {
                console.log("I CHANGE", opt)
                this.refresh(opt);
            },
            deep: true,
        },

        headers: {
            handler: function (newHeaders) {
                this.parseHeaders(newHeaders);

                this.filterHeaders();
            },
        },

        disableActions: {
            handler: function () {
                this.filterHeaders();
            },
        },

        selectedRow: {
            handler: function () {
                this.selectRow();
            },
        },

        defaultFilters: {
            handler: function (val, old) {
                if (!this.loading) {
                    this.loadFromAPI();
                }
            },
        },

        dirty: {
            handler: function (val, old) {
                if (!this.loading && val) {
                    this.loadFromAPI({ forceReload: true });
                }
            },
        },
    },
}