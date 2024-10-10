export default {
    props: {
        header: {
            type: Object,
            default: function () {
                return {};
            },
        },
        tableOptions: {
            type: Object,
            default: function () {
                return {};
            },
        },
        filters: {
            type: Array,
            default: function () {
                return [];
            },
        },
        disableSort: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            idx: -1,
            state: {
                idx: -1,
                sorted: false,
                order: true,
            },

            options: this.tableOptions,

            hovered: false,
        };
    },

    created: function () {
        this.recompute();
    },

    methods: {
        recompute: function () {
            const { sortBy, sortDesc } = this.options;

            const key = this.header.value;

            const idx = sortBy.findIndex((x) => x === key);

            this.state.idx = idx;
            this.state.sorted = idx > -1;
            this.state.order = idx > -1 ? sortDesc[idx] : true;
        },

        onSort: function (newSorted, newOrder) {
            const { sortBy, sortDesc } = this.options;
            const { sorted, order } = this.state;
            const column = this.header.value;

            if (sortBy.length === 0) {
                this.options = {
                    ...this.options,
                    sortBy: [].concat(column),
                    sortDesc: [].concat(false),
                };

                this.$emit("sort", this.options);

                return;
            }

            let auxSortBy = [].concat(sortBy);
            let auxSortDesc = [].concat(sortDesc);

            const idx = sortBy.findIndex((x) => x === column);

            if (idx > -1) {
                if (!order) {
                    auxSortBy[idx] = column;
                    auxSortDesc[idx] = true;
                } else {
                    auxSortBy.splice(idx, 1);
                    auxSortDesc.splice(idx, 1);
                }
            } else {
                auxSortBy.push(column);
                auxSortDesc.push(false);
            }

            // Need to set a new ref to activate the reactive part
            this.options = {
                ...this.options,
                sortBy: auxSortBy,
                sortDesc: auxSortDesc,
            };

            this.$emit("sort", this.options);
        },

        onShowFilter: function () {
            this.$emit("clickfilter");
        },
    },

    computed: {
        isAction: function () {
            return (
                this.header.hasOwnProperty("renderer") &&
                this.header.renderer.type === "action"
            );
        },

        isSortable: function () {
            return this.header.sortable || !this.header.hasOwnProperty("sortable");
        },

        isFiltered: function () {
            const column = this.header.value;

            return !!this.filters.find((r) => r.property === column);
        },

        filteredColor: function () {
            return this.isFiltered ? "primary" : "";
        },

        sortIdx: function () {
            return this.idx;
        },

        isSorted: function () {
            return this.state.sorted;
        },

        sortDesc: function () {
            return this.state.order;
        },

        sortIcon: function () {
            if (!this.isSorted) {
                return "mdi-arrow-up-down";
            }

            return this.sortDesc ? "mdi-arrow-down" : "mdi-arrow-up";
        },

        sortIconColor: function () {
            if (this.isFiltered) {
                return "primary";
            }

            if (this.isSorted || this.hovered) {
                return "black";
            }
        },
    },

    watch: {
        tableOptions: {
            deep: true,
            handler: function (opts) {
                this.options = opts;

                this.recompute();
            },
        },
    },
};