<template>
  <div style="height: 100%">
    <v-data-table
      ref="vtable"
      :headers="filteredHeaders"
      :items.sync="rows"
      :options.sync="options"
      :multi-sort="multiSort"
      :page="page"
      :items-per-page="itemsPerPage"
      :server-items-length="total"
      :loading="loading"
      :loading-text="$t(loadingText)"
      :expanded.sync="expanded"
      :single-expand="true"
      :item-key="isOrm ? '$id' : itemKey"
      :show-expand="showExpand"
      :header-props="{
        'disable-sort': true,
        'sort-icon': null,
      }"
      :class="
        'hide-table-v-icon table-strips highlight-selected elevation-1 table-overflow' +
        (!dense ? ' table-centering' : '') +
        (!dividers ? '' : 'table-dividers')
      "
      :height="height"
      :dense="dense"
      fixed-header
      :single-select="true"
      :show-select="selectable"
      :search="search"
      :hide-default-footer="hideFooter"
      :footer-props="{
        showFirstLastPage: true,
        firstIcon: 'mdi-arrow-collapse-left',
        lastIcon: 'mdi-arrow-collapse-right',
        prevIcon: 'mdi-minus',
        nextIcon: 'mdi-plus',
        itemsPerPageText: $t('Rows per page') + ':',
        itemsPerPageAllText: $t('All'),
        itemsPerPageOptions: footerItemsPerPage,
        pageText: pageText,
        'disable-pagination': loading,
        'disable-items-per-page': loading,
      }"
      :no-data-text="noDataText ? noDataText : $t('No items in table')"
      @item-selected="onSelectRow"
      @click:row="onClickRow"
      @item-expanded="onItemExpanded"
    >
      <!-- Toolbar -->
      <template v-slot:top>
        <v-toolbar rounded flat dense v-if="title" height="60">
          <slot name="navigation"></slot>
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

          <!-- Columns show/hide -->
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                text
                v-on="{ ...tooltip }"
                @click="showColumnsControl = !showColumnsControl"
              >
                <span v-if="displayBtnText">{{ $t("Manage Columns") }}</span>
                <v-icon>{{ "mdi-table-column-remove" }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Manage Columns") }}</span>
          </v-tooltip>
          <!-- <HeaderSettings
            :headers="headers"
            :btnText="displayBtnText"
            @change="onFilterHeaders"
          ></HeaderSettings> -->
        </v-toolbar>
      </template>

      <!-- <template v-slot:body.prepend>
        {{ showFilters }}
      </template> -->

      <!-- </template> -->

      <!-- Renderers -->
      <template
        v-for="(header, headerIdx) in renderers"
        v-slot:[setSlotValue(header.value)]="{ item }"
      >
        <!-- <div
        :key="'renderer-' + headerIdx"
        class="d-flex justify-center align-center"
        style="height: 100%"
      > -->
        <SimpleRenderer
          v-if="header.renderer.type === 'simple'"
          :key="'renderer-' + headerIdx"
          :header="header"
          :item="item"
        ></SimpleRenderer>

        <HTMLRenderer
          v-if="header.renderer.type === 'html'"
          :key="'renderer-' + headerIdx"
          :header="header"
          :item="item"
        ></HTMLRenderer>

        <ChipRenderer
          v-else-if="header.renderer.type === 'chip'"
          :key="'renderer-' + headerIdx"
          :header="header"
          :item="item"
        ></ChipRenderer>

        <RemoteSimpleRenderer
          v-else-if="header.renderer.type === 'remotesimple'"
          :key="'renderer-' + headerIdx"
          :header="header"
          :item="item"
        ></RemoteSimpleRenderer>

        <DateRenderer
          v-else-if="header.renderer.type === 'date'"
          :key="'renderer-' + headerIdx"
          :header="header"
          :item="item"
        ></DateRenderer>

        <IconRenderer
          v-else-if="header.renderer.type === 'icon'"
          :key="'renderer-' + headerIdx"
          :header="header"
          :item="item"
        ></IconRenderer>

        <ProgressRenderer
          v-else-if="header.renderer.type === 'progress'"
          :key="'renderer-' + headerIdx"
          :header="header"
          :item="item"
        ></ProgressRenderer>

        <v-checkbox
          v-model="item[header.value]"
          v-else-if="header.renderer.type === 'checkbox'"
          :key="'renderer-' + headerIdx"
          :color="header.renderer.color ? header.renderer.color : 'primary'"
          hide-details
          style="margin: 0"
          :true-value="header.renderer.negate ? false : true"
          :false-value="header.renderer.negate ? true : false"
          @change="emitEvent(header.renderer.event, item)"
        ></v-checkbox>

        <v-btn
          v-else-if="header.renderer.type === 'action'"
          :disabled="
            header.renderer.hasOwnProperty('disabler') &&
            header.renderer.disabler(item)
          "
          :key="'renderer-' + headerIdx"
          text
          :outlined="header.renderer.hasOwnProperty('text')"
          small
          :color="header.renderer.color ? header.renderer.color : 'primary'"
          @click="emitEvent(header.renderer.event, item)"
        >
          <v-icon v-if="header.renderer.hasOwnProperty('icon')">{{
            header.renderer.icon
          }}</v-icon>
          <span v-if="header.renderer.hasOwnProperty('text')">{{
            header.renderer.text
          }}</span>
        </v-btn>
        <!-- </div> -->
      </template>

      <!-- Expansion Panel-->
      <template v-slot:expanded-item="{ headers }">
        <td :colspan="headers.length" class="pa-6">
          <slot name="expaneded-item"></slot>
        </td>
      </template>

      <template v-slot:loading>
        <div class="unselectable subtitle-1 font-weight-medium text--secondary">
          {{ $t("Loading") }}
        </div>
        <!-- <v-skeleton-loader type="table-tbody" > </v-skeleton-loader> -->
      </template>

      <template
        v-for="(h, i) in filteredHeaders"
        v-slot:[`header.${h.value}`]="{ header }"
      >
        <ColumnHeader
          :key="`header-${i}`"
          :header="header"
          :disableSort="loading"
          :tableOptions="options"
          :filters="filters"
          @clickfilter="showFilters = true"
        ></ColumnHeader>
      </template>
    </v-data-table>

    <v-dialog scrollable persistent v-model="showFilters" width="400">
      <Filters
        ref="filters"
        :headers="headers"
        v-model="showFilters"
        @filter="onFilter"
        @close="showFilters = false"
      ></Filters>
    </v-dialog>

    <v-dialog scrollable persistent v-model="showColumnsControl" width="400">
      <HeaderSettings
        ref="filters"
        :headers="headers"
        v-model="showColumnsControl"
        @close="showColumnsControl = false"
        @submit="
          showColumnsControl = false;
          onFilterHeaders();
        "
      ></HeaderSettings>
    </v-dialog>
  </div>
</template>

<script>
import SimpleRenderer from "~/components/tables/renderers/simple.vue";
import HTMLRenderer from "~/components/tables/renderers/html.vue";
import ChipRenderer from "~/components/tables/renderers/chip.vue";
import RemoteSimpleRenderer from "~/components/tables/renderers/remotesimple.vue";
import IconRenderer from "~/components/tables/renderers/icon.vue";
import DateRenderer from "~/components/tables/renderers/date.vue";
import ProgressRenderer from "~/components/tables/renderers/progress.vue";
import Filters from "~/components/tables/filters/panel.vue";
import HeaderSettings from "@/components/tables/settings/headers.vue";
import ColumnHeader from "@/components/tables/template/v-col-override.vue";

export default {
  components: {
    SimpleRenderer,
    HTMLRenderer,
    ChipRenderer,
    DateRenderer,
    ProgressRenderer,
    Filters,
    HeaderSettings,
    IconRenderer,
    RemoteSimpleRenderer,
    ColumnHeader,
  },

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

    hideFooter: {
      type: true,
      default: false,
    },

    store: null,

    dense: {
      type: Boolean,
      default: false,
    },

    dividers: {
      type: Boolean,
      default: false,
    },

    selectable: {
      type: Boolean,
      default: false,
    },

    selectedRow: {
      type: Number,
      default: -1,
    },

    showExpand: {
      type: Boolean,
      default: false,
    },

    itemKey: {
      type: String,
      default: "id",
    },

    paginated: {
      type: Boolean,
      default: false,
    },

    loadingText: {
      type: String,
      default: "Loading data...",
    },

    height: {
      default: 530,
    },

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

    defaultSortBy: {
      type: String,
      default: null,
    },

    defaultSortOrder: {
      type: Boolean,
      default: true,
    },

    displayBtnText: {
      type: Boolean,
      default: false,
    },

    footerItemsPerPage: {
      type: Array,
      default: function () {
        return [10, 25, 50];
      },
    },

    defParams: {
      type: Object,
      default: () => {},
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

  model: {
    prop: "data",
    event: "change",
  },

  data() {
    return {
      search: "",

      showFilters: false, // show/hide filters
      showColumnsControl: false,
      showVisibilityFilters: false,
      filters: [], // current filters
      filteredHeaders: [],

      expanded: [],

      options: {}, // table options

      loading: false, // is loading

      selected: null, // selected row

      remote: false, // is remote or local

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

  updated: function () {
    this.selectRow();
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

      if (this.store) {
        const metadata = this.ormModel.getMetadata();

        if (metadata && metadata.sortBy) {
          options["sortBy"] = metadata.sortBy;
          options["sortDesc"] = metadata.sortOrder.map((r) => !r);
        }
      }
    },

    parseHeaders: function (headers) {
      const n = 100 / headers.length;

      headers.forEach(function (header, idx) {
        if (!header.hasOwnProperty("align")) {
          header.align = "center";
          // } else {
          // header.align = "left";
        }

        if (header.renderer && header.renderer.type === "action") {
          header.sortable = false;
        }

        // header.sortable = false;

        // if (!header.width) {
        //   header.width = n + "%";
        // }

        // Set the hidden property
        if (!header.hasOwnProperty("hide")) {
          header.hide = false;
        }
      });
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
          await this.$store.dispatch(this.store + this.storeRead);
        }
      } catch (e) {
        console.log("Error: ");
      }

      this.dirty = false;
      this.loading = false;
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

    getSelected: function () {
      return this.selected;
    },

    setSlotValue: function (value) {
      return `item.${value}`;
    },

    selectRow: function () {
      if (this.selectedRow !== -1) {
        let el = this.$el,
          tableBody = el.getElementsByTagName("tbody")[0],
          tableRows = tableBody.getElementsByTagName("tr");

        if (tableRows[this.selectedRow])
          tableRows[this.selectedRow].classList.add("v-data-table__selected");
        // if (tableRows[this.selectedRow + 1])
        //   tableRows[this.selectedRow + 1].classList.add(
        //     "v-data-table__selected"
        //   );
      }
    },

    unselectAll: function () {
      const table = this.$refs.vtable;

      if (table) {
        try {
          table.select();
        } catch (e) {
          // TODO: understand lastEntryKey is undefined
          console.log(e);
        }
      }
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

    transformRow: function (row, headers) {
      const fn = this.transformFn;

      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];

        const transform = headers[i].transform;

        const value = row[header.value];

        const transformedValue = fn({
          value: value,
          ...transform,
        });

        row[header.value + "_transformed"] = transformedValue;
      }

      return row;
    },

    transformRows: function (rows) {
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
      if (this.transformFn) {
        return this.transformRows(rows, this.headers);
      }

      return rows;
    },

    onSelectRow: function (event) {
      const selected = event.value;
      const row = event.item;
      const index = this.rows ? this.rows.indexOf(row) : -1;

      if (selected) {
        this.selected = row;

        this.$emit("select", row, index);
      } else {
        this.selected = null;

        this.$emit("unselect", row);
      }
    },

    onItemExpanded: function (event) {
      const isExpanded = event.value;
      const row = event.item;

      if (isExpanded) {
        this.$emit("expand", row);
      } else {
        this.$emit("shrink", row);
      }
    },

    onClickRow: function (item, row) {
      const select = row.isSelected;

      if (this.selectable) {
        row.select(!select);
      }
    },

    onClearFilters: function () {
      this.$refs.filters.clear();
    },

    onFilter: function (filters) {
      this.filters = filters;

      this.loadFromAPI();
    },

    onFilterHeaders: function () {
      //   this.$recompute("filteredHeaders");
      this.filterHeaders();
    },

    setDirty: function (value) {
      this.dirty = value;
    },
  },

  computed: {
    page: function () {
      if (!this.store) {
        return 1;
      }

      if (!this.isOrm) {
        const { currStart, currLimit } =
          this.$store.getters[this.store + "/metadata"];

        // Safety floor
        const page = Math.floor(1 + currStart / currLimit);

        return page;
      } else {
        let { currStart, currLimit, start, limit } =
          this.ormModel.getMetadata();

        if (currStart === null || currLimit === null) {
          return 1;
        }

        // Safety floor
        const page = Math.floor(1 + currStart / currLimit);

        return page;
      }
    },

    pageText: function () {
      const begin = this.page ? (this.page - 1) * this.itemsPerPage : 0;
      const end = this.rows ? begin + this.rows.length : 0;
      const total = this.total ? this.total : 0;

      return `${begin + 1}-${end} ` + this.$t("of") + ` ${total}`;
    },

    itemsPerPage: function () {
      if (!this.store) {
        return 10;
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
      if (!this.remote) {
        return this.parseRows(this.data);
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
};
</script>
<style>
.highlight-selected .v-data-table__selected {
  border-top: 2px solid grey; /*var(--v-primary-base);*/
  border-bottom: 2px solid grey; /*var(--v-primary-base);*/
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  font-weight: bold;
}

/* .table-overflow .v-data-table__wrapper {
  overflow: auto;
  height: 80%;
} */

/** Responsive */
.table-overflow {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-overflow header {
  max-height: 60px;
}

.table-overflow .v-data-table__wrapper {
  overflow: auto;
}

.table-centering td,
.table-centering th {
  vertical-align: middle !important;
}

/* .table-dividers th + th {
  border-left: 1px solid #dddddd;
} */
.table-dividers table td ~ td {
  border-left: 1px solid #dddddd;
}

.table-strips tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}

.hide-table-v-icon .v-data-table-header__icon {
  display: none !important;
}
</style>