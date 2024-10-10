<template>
  <!-- https://www.npmjs.com/package/vue-auto-virtual-scroll-list -->
  <div class="table-overflow white">
    <v-toolbar rounded flat dense v-if="title" height="60">
      <slot name="navigation"></slot>

      <v-toolbar-title class="unselectable font-weight-medium">{{
        title
      }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <slot name="actions"></slot>

      <!-- Remove filters button -->
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

      <!-- Manage filters button -->
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

      <!-- Manage columns button -->
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
    </v-toolbar>

    <VirtualScrollTable
      ref="vst"
      :preRenderSize="preRenderSize"
      :itemSize="itemSize"
      :rows="rows"
    >
      <template v-slot:colgroup>
        <colgroup>
          <col v-for="(header, i) in filteredHeaders" :key="`colgroup-${i}`" />
        </colgroup>
      </template>

      <!-- Header -->
      <template v-slot:header>
        <thead class="vst-header">
          <tr>
            <th
              v-for="(header, hi) in filteredHeaders"
              :key="`header-${hi}`"
              :class="header.class"
              :style="`height: ${headerSize}px;${header.style}`"
            >
              <TemplatedCol
                :header="header"
                :tableOptions.sync="options"
                :filters="filters"
                :disableSort="loading"
                @clickfilter="showFilters = true"
                @sort="onSort"
              ></TemplatedCol>
            </th>
          </tr>
        </thead>
      </template>

      <template
        v-slot:body="{
          itemSize,
          windowStart,
          windowSize,
          windowActiveStart,
          windowActiveEnd,
        }"
      >
        <tr v-if="loading">
          <td
            class="text--secondary"
            :style="`padding: 0; text-align: center;`"
            :colspan="filteredHeaders.length"
          >
            <v-progress-linear indeterminate width="100%" />

            <span>{{ $t("Loading data") }}</span>
          </td>
        </tr>

        <tr v-if="!loading && !rows.length">
          <td
            class="text--secondary"
            :style="`height: ${itemSize}px; text-align: center;`"
            :colspan="filteredHeaders.length"
          >
            {{ $t("No data") }}
          </td>
        </tr>

        <template v-for="i in windowSize">
          <TemplatedRow
            :key="`row-${rows[windowStart + i - 1][rowId]}`"
            :rowId="rowId"
            :style="`height: ${itemSize}px;`"
            :class="[
              'vst-row',
              (windowStart + i) % 2 === 0 ? 'vst-odd-row' : 'vst-even-row',
            ]"
            :active="
              windowActiveStart <= windowStart + i - 1 &&
              windowStart + i - 1 < windowActiveEnd
            "
            :index="i"
            :headers="filteredHeaders"
            :row="rows[windowStart + i - 1]"
            :emitEvent="emitEvent"
          />
        </template>
      </template>
    </VirtualScrollTable>

    <v-data-footer
      class="vst-footer"
      showFirstLastPage
      show-current-page
      :pageText="pageText"
      firstIcon="mdi-arrow-collapse-left"
      lastIcon="mdi-arrow-collapse-right"
      prevIcon="mdi-minus"
      nextIcon="mdi-plus"
      :itemsPerPageText="$t('Rows per page') + ':'"
      :itemsPerPageAllText="$t('All')"
      :itemsPerPageOptions="footerItemsPerPage"
      :options.sync="options"
      :pagination="{
        page: page,
        itemsPerPage: itemsPerPage,
        pageStart: (page - 1) * itemsPerPage,
        pageStop: page * itemsPerPage,
        pageCount: pageCount,
        itemsLength: total,
      }"
      :disable-pagination="loading"
      :disable-items-per-page="loading"
    ></v-data-footer>

    <!-- Dialogs -->
    <v-dialog scrollable v-model="showFilters" width="400">
      <Filters
        ref="filters"
        :headers="headers"
        v-model="showFilters"
        @filter="onFilter"
        @close="showFilters = false"
      ></Filters>
    </v-dialog>

    <v-dialog scrollable v-model="showColumnsControl" width="400">
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
import Filters from "~/components/tables/filters/panel.vue";
import HeaderSettings from "@/components/tables/settings/headers.vue";
import TemplatedCol from "@/components/tables/template/col.vue";
import TemplatedRow from "./template/row.vue";
import VirtualScrollTable from "./vst/main.vue";

import SimpleRenderer from "~/components/tables/renderers/simple.vue";
import HTMLRenderer from "~/components/tables/renderers/html.vue";
import ChipRenderer from "~/components/tables/renderers/chip.vue";
import RemoteSimpleRenderer from "~/components/tables/renderers/remotesimple.vue";
import IconRenderer from "~/components/tables/renderers/icon.vue";
import DateRenderer from "~/components/tables/renderers/date.vue";
import ProgressRenderer from "~/components/tables/renderers/progress.vue";
// import RawRenderer from "~/components/tables/renderers/raw.vue";
import ActionRenderer from "./renderers/action";

import CoreMixin from "./mixins/core";

export default {
  components: {
    Filters,
    HeaderSettings,
    TemplatedCol,
    TemplatedRow,
    VirtualScrollTable,
    SimpleRenderer,
    HTMLRenderer,
    ChipRenderer,
    RemoteSimpleRenderer,
    IconRenderer,
    DateRenderer,
    ProgressRenderer,
    ActionRenderer,
    // RawRenderer,
  },

  mixins: [CoreMixin],

  props: {
    headerSize: {
      type: Number,
      default: 56,
    },

    preRenderSize: {
      type: Number,
      default: 5,
    },

    itemSize: {
      type: Number,
      default: 48,
    },

    footerItemsPerPage: {
      type: Array,
      default: function () {
        return [5, 10, 50, 100, 300];
      },
    },

    rowId: {
      type: String,
      default: "$id",
    },
  },

  data() {
    return {
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        groupBy: [],
        groupDesc: [],
        multiSort: false,
        mustSort: false,
      },

      pagination: {
        page: 0,
        itemsPerPage: 0,
        pageStart: 0,
        pageStop: 0,
        pageCount: 0,
        itemsLength: 0,
      },
    };
  },

  methods: {
    // OVERRIDE
    parseHeaders: function (headers) {
      headers.forEach(function (header, idx) {
        switch (header.align) {
          case "left":
            header.class = "vst-header-left";
            break;
          case "right":
            header.class = "vst-header-right";
            break;
          case "center":
          default:
            header.align = "center";
            header.class = "vst-header-center";
            break;
        }

        if (header.renderer) {
          let cmp = null;

          switch (header.renderer.type) {
            case "simple":
              // cmp = SimpleRenderer;
              break;
            case "html":
              cmp = HTMLRenderer;
              break;
            case "chip":
              cmp = ChipRenderer;
              break;
            default:
              // cmp = RawRenderer;
              header.renderer.type = "simple";
              break;
          }

          header.renderer.cmp = cmp;

          if (header.renderer.type === "action") {
            header.sortable = false;
          }
        } else {
          header.renderer = { type: "simple" };
        }

        // Set the hidden property
        if (!header.hasOwnProperty("hide")) {
          header.hide = false;
        }
      });
    },

    // OVERRIDE
    filterHeaders: function () {
      const self = this;
      const disableActions = this.disableActions;
      const headers = this.headers;

      this.filteredHeaders = headers.filter(function (header, idx) {
        const visible =
          !header.hide && !(disableActions && self.isActionHeader(header));

        header.style = "";
        header.rowstyle = "";

        if (visible && header.fixed) {
          if (idx > 0) {
            const previous = headers[idx - 1];

            header.left = !isNaN(previous.left)
              ? previous.left + previous.width
              : 0;
          } else {
            header.left = 0;
          }

          header.style = `width: ${header.width}px; left: ${header.left}px; z-index: 2;`;
          header.rowstyle =
            `left: ${header.left}px;` + "position: sticky; z-index: 1;";
        } else if (header.width) {
          header.style = `width: ${header.width}px;`;
        }

        return visible;
      });
    },

    onSort: function (options) {
      this.options = {
        ...options,
      };
    },
  },

  watch: {
    // On update page, scroll to top
    page: function (page, old) {
      if (page !== old) {
        this.$refs.vst.scrollTop = 0;
      }
    },
  },
};
</script>
<style>
.vst-header th {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 1;
  background: white;
  /* border-bottom: thin solid rgba(0, 0, 0, 0.12); */
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
  padding: 0 16px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.75rem;
}

.vst-header th div {
  display: flex;
  align-items: center;
}

.vst-header-left div {
  text-align: left;
  justify-content: left;
}

.vst-header-right div {
  text-align: right;
  justify-content: right;
}

.vst-header-center div {
  text-align: center;
  justify-content: center;
}

.vst-even-row td {
  /* background-color: rgba(0, 0, 0, 0.05); */
  background-color: rgb(243, 243, 243);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
}

.vst-odd-row td {
  background-color: rgb(255, 255, 255);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
}

/* .vst-row { */
/* border-bottom: thin solid rgba(0, 0, 0, 0.12); */
/* } */

.vst-row td {
  line-height: 16px;
  padding: 0 16px;
}

.vst-row td.center {
  text-align: center;
}

.vst-row td.right {
  text-align: right;
}

.vst-row td.left {
  text-align: left;
}

.vst-footer {
  border-top: thin solid rgba(0, 0, 0, 0.12);
}

.virtual-scroll-body-before,
.virtual-scroll-body-after {
  background: linear-gradient(
    transparent,
    transparent 20%,
    hsla(0, 0%, 50.2%, 0.03) 0,
    hsla(0, 0%, 50.2%, 0.08) 50%,
    hsla(0, 0%, 50.2%, 0.03) 80%,
    transparent 0,
    transparent
  );

  background-size: 100% 48px;
}

.virtual-scroll-table {
  table-layout: fixed;
}
</style>