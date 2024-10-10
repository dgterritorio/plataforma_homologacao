<template>
  <client-only>
    <div
      style="
        background: white;
        height: 100%;
        display: flex;
        flex-direction: column;
      "
    >
      <v-dialog v-model="dialog" persistent max-width="1100">
        <v-card>
          <v-card-title>{{ $t("Settings") }}</v-card-title>
          <v-card-text>
            <v-row class="mx-auto pb-0">
              <v-col cols="4">
                <v-select
                  :items="[
                    { label: $t('sum'), value: 'sum' },
                    { label: $t('avg'), value: 'avg' },
                    { label: $t('count'), value: 'count' },
                  ]"
                  :label="$t('Aggregator')"
                  itemText="label"
                  itemValue="value"
                  v-model="reducerType"
                  dense
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  :items="reducerFields"
                  :label="$t('Value')"
                  itemText="label"
                  itemValue="value"
                  v-model="proxyReducerField"
                  dense
                ></v-select>
              </v-col>
            </v-row>
            <Pivot
              v-model="internal"
              :data.sync="sampleData"
              :reducerField.sync="proxyReducerField"
              :reducerLabel.sync="reducerLabel"
              :showSettings="true"
              :tableHeight="270"
              :no-data-warning-text="$t('No data to display.')"
            >
              <template
                v-for="head in headers"
                :slot="head.slotName"
                slot-scope="{ value }"
              >
                <div
                  :key="'w-${head.key}'"
                  style="display: flex;"
                >
                  <div
                    :key="'l-${head.key}'"
                    style="display: inline; margin-left: auto; color: var(--v-primary-base)"
                  >
                    {{ head.label }}
                  </div>
                  <div
                    :key="'t-${head.key}'"
                    style="margin-left: 10px; display: inline"
                  />
                  <div
                    :key="'v-${head.key}'"
                    style="display: inline; font-weight: normal"
                  >
                    {{ value }}
                  </div>
                </div>
              </template>
            </Pivot>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text @click="emitEvent('tableConfigCancel')">{{
              $t("Cancel")
            }}</v-btn>

            <v-btn
              color="var(--v-primary-base)"
              text
              @click="emitEvent('tableConfigSave')"
              >{{ $t("Submit") }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog scrollable persistent v-model="showFilters" width="400">
        <Filters
          ref="filters"
          :headers="headers"
          v-model="showFilters"
          @filter="onFilter"
          @close="showFilters = false"
        ></Filters>
      </v-dialog>

      <v-toolbar rounded flat dense v-if="title" height="60">
        <!-- Title -->
        <v-toolbar-title class="unselectable font-weight-medium">{{
          title
        }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <slot name="actions"></slot>

        <v-btn
          v-if="filters.length"
          :disabled="loading"
          color="primary"
          text
          @click="onClearFilters"
        >
          <v-icon>mdi-filter-remove</v-icon>
          <span class="ml-2">{{
            "(" + filters.length + " " + $t("active filters") + ")"
          }}</span>
        </v-btn>

        <v-tooltip bottom>
          <template v-slot:activator="{ on: tooltip }">
            <v-btn
              v-if="hasFilters"
              :disabled="loading"
              text
              v-on="{ ...tooltip }"
              :input-value="showFilters"
              @click="showFilters = !showFilters"
            >
              <span v-if="displayBtnText">{{ $t("Manage Filters") }}</span>
              <v-icon>{{
                showFilters
                  ? "mdi-filter-variant-minus"
                  : "mdi-filter-variant-plus"
              }}</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Manage Filters") }}</span>
        </v-tooltip>
      </v-toolbar>

      <PivotTable
        ref="table"
        :data.sync="items"
        :colFields.sync="internal.colFields"
        :rowFields.sync="internal.rowFields"
        :reducerField.sync="proxyReducerField"
        :reducerLabel.sync="reducerLabel"
        :showSettings="defaultShowSettings"
        :isDataLoading="loading"
        :no-data-warning-text="$t('No data to display.')"
        :showHeader="true"
      >
        <template slot="loading">
          <div class="alert alert-info" role="alert">{{ $t("Loading") }}</div>
        </template>
        <template slot="computing">
          <div class="alert alert-info" role="alert">{{ $t("Computing") }}</div>
        </template>

        <template slot="value" slot-scope="{ value }">{{
          $u.convert(value, unitFrom, unitTo, unitPlaces, unitLocale, unitShow)
        }}</template>

        <template slot="tableFooter">
          <v-data-footer
            :pagination.sync="pagination"
            :options.sync="options"
            :items-per-page-text="$t('Items per page:')"
            :items-per-page-options="itemsPerPageOptions"
            :page-text="$t('{0}-{1} of {2}')"
            @update:options="updatePagOptions"
          />
        </template>

        <template
          v-for="(head, index) in headers"
          :slot="head.slotName"
          slot-scope="{ value }"
        >
          <div
            :key="'w-${head.key}'"
            style="display: flex;"
          >
            <div
              v-if="index === 0"
              :key="'l-${head.key}'"
              style="display: inline; margin-left: auto; color: var(--v-primary-base)"
            >
              {{ head.label }}
            </div>
            <div
              v-else
              :key="'l-${head.key}'"
              style="display: inline; color: var(--v-primary-base)"
            >
              {{ head.label }}
            </div>
            <div
              :key="'t-${head.key}'"
              style="margin-left: 10px; display: inline"
            />
            <div
              :key="'v-${head.key}'"
              style="display: inline; font-weight: normal"
            >
              {{ value }}
            </div>
          </div>
        </template>
      </PivotTable>
    </div>
  </client-only>
</template>

<script>
import "~/assets/css/bootstrap/bootstrap.min.css";
import Pivot from "./src/Pivot.vue";
import PivotTable from "./src/PivotTable.vue";
import Filters from "~/components/tables/filters/panel.vue";

export default {
  components: {
    PivotTable,
    Pivot,
    Filters,
  },

  model: {
    prop: "fields",
    event: "change",
  },

  props: {
    title: {
      type: String,
      default: "Table",
    },
    unitFrom: {
      type: String,
      default: "",
    },
    unitTo: {
      type: String,
      default: "",
    },
    unitPlaces: {
      type: Number,
      default: -1,
    },
    unitLocale: {
      type: String,
      default: "fr",
    },
    unitShow: {
      type: Boolean,
      default: false,
    },
    sortBy: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Object,
      default: () => {},
    },
    headers: {
      type: Array,
      default: () => [],
    },
    reducerField: {
      type: String,
      default: "item",
    },
    defaultShowSettings: {
      type: Boolean,
      default: false,
    },

    itemsPerPage: {
      type: Number,
      default: 30,
    },

    itemsPerPageOptions: {
      type: Array,
      default: () => [12, 30, 60, 120],
    },

    store: null,

    dialogRef: null,

    storeGetter: {
      type: String,
      default: "all",
    },

    storeRead: {
      type: String,
      default: "read",
    },

    autoLoad: {
      type: Boolean,
      default: true,
    },

    defaultFilters: {
      type: Array,
      default: function () {
        return [];
      },
    },

    reducerFields: {
      type: Array,
      default: function () {
        return [];
      },
    },

    displayBtnText: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      options: {
        itemsPerPage: this.itemsPerPage,
        itemsLength: 0,

        sortBy: this.sortBy,
        sortDesc: "",

        groupBy: null,
        aggrFields: null,
        aggrOps: null,

        page: 1,
        pageStart: 0,
        pageStop: this.itemsPerPage,
      }, // table options
      pagination: {
        itemsPerPage: this.itemsPerPage,
        itemsLength: 0,

        page: 1,
        pageStart: 0,
        pageStop: this.itemsPerPage,
      }, // table options

      internal: {
        availableFields: this.fields.availableFields,
        rowFields: this.fields.rowFields,
        colFields: this.fields.colFields,
        fieldsOrder: this.fields.fieldsOrder,
      },

      showFilters: false,

      dialog: this.dialogRef.value,
      filters: [], // current filters

      remote: false,
      created: false,
      loading: false,

      isOrm: false,
      ormModel: null,
      ormNamespace: null,

      sampleData: [],

      reducerType: "sum",
      proxyReducerField: "valor",

      dirty: false,
    };
  },
  created: function () {
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

      let gb = [];
      this.internal.colFields.forEach((f) => {
        gb.push(f.key);
      });
      this.internal.rowFields.forEach((f) => {
        gb.push(f.key);
      });

      this.proxyReducerField = this.reducerField;

      this.groupBy = gb;
      this.aggrFields = [this.reducerField];
      this.aggrOps = [this.reducerType];
    }
    this.load();
  },

  filters: {
    number: function (value) {
      return value.toLocaleString("fr");
    },
  },

  methods: {
    onFilter: function (filters) {
      this.filters = filters;

      this.loadFromAPI();
    },

    updatePagOptions: function (poptions) {
      this.options["itemsPerPage"] = poptions["itemsPerPage"];
      this.options["page"] = poptions["page"];

      this.pagination["pageStart"] =
        poptions["itemsPerPage"] * (poptions["page"] - 1);
      this.pagination["pageStop"] =
        this.pagination["pageStart"] + poptions["itemsPerPage"];
    },

    updateGroupBy: function () {
      let gb = [];
      this.internal.colFields.forEach((f) => {
        gb.push(f.key);
      });
      this.internal.rowFields.forEach((f) => {
        gb.push(f.key);
      });
      if (!gb || !gb.length > 0) return;

      this.groupBy = gb;
      this.aggrFields = [this.proxyReducerField];
      this.aggrOps = [this.reducerType];
      this.refresh();
    },

    emitStateChange: async function () {
      const value = {
        availableFields: this.internal.fields,
        rowFields: this.internal.rowFields,
        colFields: this.internal.colFields,
        fieldsOrder: this.internal.fieldsOrder,
      };

      this.updateGroupBy();

      this.$emit("change", value);
    },

    load: async function (opt) {
      await this.loadFromAPI(opt);
    },

    refresh: async function (opt) {
      this.load(opt);
    },

    loadFromAPI: async function (opt) {
      console.log("pivot table load");
      const store = this.store;

      if (!store) {
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

      // Set sorting options
      if (sortBy.length) {
        req_options["sortBy"] = sortBy[0];
        req_options["sortOrder"] = !sortDesc[0]; // ? "ASC" : "DESC";
      }

      // Check if the component has default filters
      if (Array.isArray(this.defaultFilters) && this.defaultFilters.length) {
        req_options["filters"] = this.defaultFilters;
      }

      // Set filters
      if (Array.isArray(this.filters) && this.filters.length) {
        req_options["filters"] = req_options["filters"].length
          ? req_options["filters"].concat(this.filters)
          : this.filters;
      }

      // Check if force reaload
      if (opt && opt.hasOwnProperty("forceReload")) {
        req_options["forceReload"] = opt["forceReload"];
      }

      // Check dirty
      if (this.dirty) {
        req_options["forceReload"] = true;
      }

      // Check groupBY
      if (this.groupBy && this.aggrFields && this.aggrOps) {
        req_options["groupBy"] = this.groupBy;
        req_options["aggrFields"] = this.aggrFields;
        req_options["aggrOps"] = this.aggrOps;
      }

      // Query API
      try {
        if (this.isOrm) {
          await this.ormModel.api().read(req_options);
        } else {
          await this.$store.dispatch(this.store + this.storeRead);
        }
      } catch (e) {
        console.log("Error: ", e);
      }

      if (!this.created) {
        if (this.isOrm && this.internal.colFields.length == 0) {
          this.defaultColFields();
        }
        this.created = true;
      }
      this.dirty = false;
      this.loading = false;

      this.options.itemsLength = this.pagination.itemsLength = this.total;
      this.sampleData = this.items.slice(0, 2).map((item) => {
        return item;
      });
    },

    defaultColFields: function () {
      let fd = [];
      Object.keys(this.ormModel.fields()).forEach((f) => {
        fd.push({
          getter: (item) => {
            return item[f];
          },
          label: f,
        });
      });
      this.internal.colFields = fd;
    },

    emitEvent: function (event) {
      this.$emit(event);
    },

    setDirty: function (value) {
      this.dirty = value;
    },

    onFilter: function (filters) {
      this.filters = filters;

      this.loadFromAPI();
    },

    onClearFilters: function () {
      this.$refs.filters.clear();
    },
  },
  computed: {
    items: function () {
      // If it is remote, return data
      if (!this.remote) {
        return this.items;
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

        return this.$store.getters[getter];
      }

      const sortBy = this.options.sortBy;
      const sortDesc = this.options.sortDesc;

      // If sorted, we need to query the vuex-orm store with sorting on
      if (sortBy && sortBy.length) {
        const property = sortBy[0];
        const direction = !sortDesc[0];

        // Return the result ordered, else this will overwrite the v-table
        return this.ormModel.orderBy(property, direction).get();
      } else {
        // If vuex-orm, we need to include the database namespace
        getter = this.ormNamespace + "/" + this.store + "/all";

        const getterFn = this.$store.getters[getter];

        // If this is vuex-orm, the getter will be a function
        // todo see object.freeze
        return getterFn();
      }
    },

    total: function () {
      if (!this.store) {
        return this.data.length;
      }

      if (!this.isOrm) {
        const { total } = this.$store.getters[this.store + "/metadata"];

        return total;
      } else {
        const { total } = this.ormModel.getMetadata();

        return total;
      }
    },

    reducerLabel: function () {
      const found = this.reducerFields.find(
        (element) => element.value == this.proxyReducerField
      );

      return found.label;
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
      handler() {
        this.refresh();
      },
      deep: true,
    },
    "internal.fields": function () {
      this.emitStateChange();
    },
    "internal.rowFields": function () {
      this.emitStateChange();
    },
    "internal.colFields": function () {
      this.emitStateChange();
    },
    "internal.fieldsOrder": function () {
      this.emitStateChange();
    },
    "dialogRef.value": function () {
      this.dialog = this.dialogRef.value;
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

    reducerType: {
      handler: function (val, old) {
        if (!this.loading && val) {
          this.updateGroupBy();
        }
      },
    },

    proxyReducerField: {
      handler: function (val, old) {
        if (!this.loading && val) {
          this.updateGroupBy();
        }
      },
    },
  },
};
</script>
