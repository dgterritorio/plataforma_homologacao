<template>
  <v-container
    fluid
    :class="[
      'text-center white pa-0 chart-container',
      elevated ? 'elevation-4' : '',
    ]"
    style="border-radius: 4px; border: 1px solid white; height: 100%"
  >
    <cube-query-builder
      ref="qb"
      v-if="cubejsApi"
      :defaultChartType="'line'"
      :cubejs-api="cubejsApi"
      :query="options.query"
      style="width: 100%"
    >
      <!-- Boilerplate when empty -->
      <template v-slot:empty>
        <div class="chart-content">
          <v-skeleton-loader
            v-bind="{
              boilerplate: true,
            }"
            type="card-heading"
          ></v-skeleton-loader>
          <v-container
            style="height: 100%"
            class="
              d-flex
              flex-column
              justify-center
              align-center
              unselectable
              pb-10
            "
          >
            <span class="subtitle-1 text--secondary font-weight-medium py-4"
              >{{ $t("Loading") }}...</span
            >
            <v-progress-linear
              style="width: 60%"
              height="10"
              color="primary"
              size="50"
              indeterminate
              rounded
            />
            <!-- </div> -->
          </v-container>
        </div>
      </template>

      <template v-slot:error>
        <div class="chart-content">
          <v-toolbar
            style="max-height: 48px"
            class="elevation-0"
            dense
            v-if="!hide.toolbar"
          >
            <b class="unselectable">{{ options.chart.title }}</b>
            <v-spacer></v-spacer>

            <v-menu
              v-if="!hide.edit && !editing"
              transition="slide-y-transition"
              bottom
              left
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn style="margin-right: -5px" icon v-bind="attrs" v-on="on">
                  <v-icon>{{ "mdi-cog" }}</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, i) in tools"
                  :key="i"
                  @click="onClickOption(item.event)"
                >
                  <v-list-item-title
                    ><v-icon left>{{ item.icon }}</v-icon
                    >{{ item.title }}</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar>

          <div
            class="subtitle-2 text--secondary unselectable dashboard-cube-error"
            style="font-size: 1.2rem !important"
          >
            <v-icon color="red darken-1" class="mx-2">mdi-alert-outline</v-icon>
            {{ $t("Error").toUpperCase() }}
          </div>
        </div>
      </template>

      <!-- Graph Options -->
      <!-- measures,
      setMeasures,
      availableMeasures,
      dimensions,
      setDimensions,
      availableDimensions,
      availableTimeDimensions,
      availableFilters,
      filters,
      setFilters,
      chartType,
      updateChartType,
      timeDimensions,
      isQueryPresent -->
      <template v-slot:builder="{}">
        <!-- Chart Cube Form -->
        <ChartCubeForm
          :hide="hide"
          :templates="templates"
          :comboboxes="comboboxes"
          :domains="domains"
          :record="records.cube"
          :filters="customFilters"
          :show="show.cubeform"
          v-model="show.cubeform"
          @updatedomain="onUpdateDomain"
          @save="onSave"
        >
        </ChartCubeForm>

        <!-- Chart Colors Form -->
        <ChartColorsForm
          :series="series"
          :record="records.colors"
          :show="show.colorsform"
          v-model="show.colorsform"
          @save="onSaveColors"
        ></ChartColorsForm>
      </template>

      <!-- Toolbar + Graph -->
      <template v-slot="{ resultSet }">
        <div class="chart-content">
          <v-toolbar
            style="max-height: 48px"
            class="elevation-0"
            dense
            v-if="!hide.toolbar"
          >
            <b class="unselectable">{{ options.chart.title }}</b>
            <v-spacer></v-spacer>

            <v-menu
              v-if="!hide.edit && !editing"
              transition="slide-y-transition"
              bottom
              left
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn style="margin-right: -5px" icon v-bind="attrs" v-on="on">
                  <v-icon>{{ "mdi-cog" }}</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, i) in tools"
                  :key="i"
                  @click="onClickOption(item.event)"
                >
                  <v-list-item-title
                    ><v-icon left>{{ item.icon }}</v-icon
                    >{{ item.title }}</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar>

          <CubeChart
            ref="cube-chart"
            :type="options.chart.type"
            :data="captureResult(resultSet)"
            :stacked="!!options.chart.stacked"
            :download="options.chart.downloadable"
            :exportTool="!!options.chart.export"
            :colors="options.chart.colors"
          ></CubeChart>
        </div>
      </template>
    </cube-query-builder>
  </v-container>
</template>

<script>
import CubeChart from "@/components/graphs/cube-chart.vue";
import cubejs from "@cubejs-client/core";

import ChartColorsForm from "./forms/chart-colors.vue";
import ChartCubeForm from "./forms/chart-cube.vue";

export default {
  name: "dashboard.cube-graph",

  components: {
    CubeChart,
    ChartColorsForm,
    ChartCubeForm,
  },

  props: {
    hide: {
      type: Object,
      default: function () {
        return {
          toolbar: false,
          edit: false,
          granularity: false,
          timeInterval: false,
        };
      },
    },

    options: {
      type: Object,
      default: function () {
        return {
          chart: {
            title: "",
            type: "line-chart",
            stacked: false,
            export: false,
            colors: [],
          },
          query: {
            dimensions: [],
            timeDimensions: [
              {
                dimension: "RequestStates.startDate",
                granularity: "day",
              },
            ],
            measures: ["RequestStates.count"],
            order: {},
            filters: [],
          },
          qfMap: [],
        };
      },
    },

    elevated: {
      type: Boolean,
      default: true,
    },

    dateRangeItems: {
      type: Array,
      default: () => {
        return [
          "Today",
          "Yesterday",
          "This week",
          "This month",
          "This quarter",
          "This year",
          "Last 30 days",
          "Last year",
        ];
      },
    },

    editing: {
      type: Boolean,
      default: false,
    },

    templates: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },

  data() {
    return {
      resultSet: null,

      comboboxes: {
        measures: [],
        dimensions: [],
        alldimensions: [],
        timeDimensions: [],
        dateRange: this.dateRangeItems,
      },

      records: {
        cube: {
          type: null,
          stacked: false,
          title: "",
          domain: null,
          measures: [],
          dimensions: [],
          granularity: [],
          timeDimension: [],
          dateRange: null,
        },
        colors: {},
      },

      show: {
        cubeform: false,
        colorsform: false,
      },

      tools: [
        {
          title: this.$t("Edit grid"),
          event: "editall",
          icon: "mdi-table-edit",
        },
        {
          title: this.$t("Edit component"),
          event: "edit",
          icon: "mdi-square-edit-outline",
        },
        {
          title: this.$t("Edit colors"),
          event: "editcolors",
          icon: "mdi-palette",
        },
        {
          title: this.$t("Export Excel"),
          event: "export",
          icon: "mdi-download",
        },
      ],

      customFilters: {
        input: {},
        raw: {},
        values: {},
        records: {},
      },
    };
  },

  methods: {
    toCubeFilters: function (domain, values) {
      const cubeFilters = this.options.query.filters;

      // TODO: This no longer compares the current filters with the old ones. Always rewrite
      // Copy every filters thats not configurable
      let newFilters = [];

      console.log("BEFORE: ", this.customFilters.values);
      // Process every configurable filter
      Object.keys(this.customFilters.values).forEach(function (key, index) {
        const value = this.customFilters.values[key];

        // Type not supported
        if (!value || (Array.isArray(value) && !value.length)) {
          console.log("[Cube] Filter not supported", key, value);
          return;
        }

        const found = cubeFilters.find((f) => f.dimension.endsWith(key));

        console.log("Filter found: ", cubeFilters, key, found);

        // Filter already exists... update!
        if (found) {
          // If the value contains data
          const copy = JSON.parse(JSON.stringify(found));

          copy.values = value;
          copy.dimension = `${domain}.${key}`;

          newFilters.push(copy);

          // Simply add the new filter
        } else {
          newFilters.push({
            dimension: `${domain}.${key}`,
            operator: "equals",
            values: value,
          });
        }
      }, this);

      console.log("NEW FILTER: ", newFilters);

      return newFilters;
    },

    filterDimension: function (dimension) {
      return (
        !Object.prototype.hasOwnProperty.call(dimension, "meta") ||
        !dimension.meta.hidden
      );
    },

    filterTimeDimension: function (dimension) {
      return dimension.type === "time";
    },

    captureResult: function (resultSet) {
      this.resultSet = resultSet;

      return resultSet;
    },

    readColors: function (resultSet, colors) {
      console.log(resultSet);
      if (!resultSet) {
        return {};
      }

      const series = resultSet.series();

      console.log(">_--------------------", colors);

      const parsed = {};

      if (!colors) {
        colors = {};
      }

      series.forEach((serie, i) => {
        const key = serie.key;

        parsed[key] = colors[key] ? colors[key].color : null;
      });

      return parsed;
    },

    saveColors: function (colors) {
      const parsed = {};

      console.log(colors);

      Object.keys(colors).forEach(function (key) {
        console.log(key);
        const color = colors[key];

        if (!color) {
          return;
        }

        parsed[key] = {
          borderColor: {
            ...color,
            a: 1.0,
          },
          color: color,
        };
      });

      return parsed;
    },

    onClickOption: function (event) {
      switch (event) {
        case "editall":
          this.$emit("editgrid", true);
          break;
        case "edit":
          this.onEdit();

          break;
        case "editcolors":
          this.onEditColors();

          break;
        case "export":
          const cmp = this.$refs["cube-chart"];

          if (cmp) {
            cmp.onExport();
          }
          break;
        default:
          break;
      }
    },

    onEditColors: function () {
      const colors = this.options.chart.colors;

      this.records.colors = this.readColors(this.resultSet, colors);

      this.show.colorsform = true;
    },

    onEdit: function () {
      // Chart config
      this.records.cube.type = this.options.chart.type;
      this.records.cube.stacked = !!this.options.chart.stacked;
      this.records.cube.title = this.options.chart.title;

      // Cube config
      const { measures, dimensions, timeDimensions, filters } =
        this.options.query;

      console.log("RESULT SET", this);

      console.log("> QUERY", measures.length, this.$refs.qb, this.cubejsApi);

      const domain = this.domain;

      // Refresh the comboboxes for this domain
      this.onUpdateDomain(domain);

      this.records.cube.domain = domain;
      this.records.cube.measures = measures;
      this.records.cube.dimensions = dimensions;
      this.records.cube.timeDimension = timeDimensions[0].dimension; // Array?
      this.records.cube.granularity = timeDimensions[0].granularity; // Array?
      this.records.cube.dateRange = timeDimensions[0].dateRange; // Array?

      // Custom Filters
      const qfMap = this.options.qfMap;

      Object.keys(qfMap).forEach(function (key, index) {
        const found = filters.find((f) => {
          console.log(f, f.dimension, key);
          return f.dimension.endsWith(key);
        });

        const values = qfMap[key];

        console.log("Found: ", found, values);

        if (found) {
          this.$set(this.customFilters.input, key, values); //found.values);
        }
      }, this);

      console.log("EDIT", this.options, this.records.cube);

      this.$nextTick(function () {
        this.show.cubeform = true;
      });
    },

    onSaveColors: function () {
      const { colors } = this.records;

      console.log("DID I SAVE?", colors);

      this.options.chart.colors = this.saveColors(colors);

      this.$emit("save", this.options);

      this.show.colorsform = false;
    },

    onSave: function () {
      const {
        stacked,
        title,
        type,
        domain,
        measures,
        dimensions,
        timeDimension,
        granularity,
        dateRange,
        // filters
      } = this.records.cube;

      const filters = this.customFilters.raw;

      console.log(
        "DID I SAVE?",
        stacked,
        title,
        type,
        domain,
        measures,
        dimensions,
        timeDimension,
        granularity,
        dateRange,
        filters,
        this.customFilters
      );

      const cubeFilters = this.toCubeFilters(domain, filters);
      const filterValues = this.customFilters.records;

      console.log(cubeFilters, filterValues);
      console.log("GRANULARTIY : ", granularity);

      this.options.chart.title = title;
      this.options.chart.type = type;
      this.options.chart.stacked = stacked;
      this.options.query.measures = measures;
      this.options.query.dimensions = dimensions;
      this.options.query.timeDimensions = [
        {
          dateRange: dateRange,
          dimension: timeDimension,
          granularity: granularity,
        },
      ];
      this.options.query.filters = cubeFilters;
      this.options.qfMap = filterValues;

      console.log("FINISH MODIFYING");
      console.log(
        granularity,
        JSON.stringify(this.options),
        this.records.cube,
        this
      );

      this.$emit("save", this.options);

      this.show.cubeform = false;
    },

    onCancel: function () {
      this.show.cubeform = false;
    },

    onUpdateDomain: function (domain) {
      console.log("I UPDATED DOMAIN", domain);

      console.log("I REACT DOMAIN");

      const queryBuilder = this.$refs.qb;
      // let ov;

      const metadata = queryBuilder.meta;
      const cubes = metadata.cubes;

      const cube = cubes.find((c) => c.name === domain);

      if (cube) {
        const { measures, dimensions } = cube;

        this.comboboxes.measures = measures;
        this.comboboxes.dimensions = dimensions.filter(this.filterDimension);
        this.comboboxes.alldimensions = dimensions;
        this.comboboxes.timeDimensions = dimensions.filter(
          this.filterTimeDimension
        );
        this.comboboxes.granularities = queryBuilder.granularities; //["year"];
      } else {
        console.log("[Error] Faileld to fetch the default cube parameters");
      }

      this.records.cube.measures = [];
      this.records.cube.dimensions = [];
      this.records.cube.timeDimension = [];
      this.records.cube.granularity = "year";
    },
  },

  computed: {
    series: function () {
      return this.resultSet ? this.resultSet.series() : [];
    },

    domain: function () {
      const query = this.options.query;

      const measures = query.measures;

      if (!query || !measures || !measures.length) {
        console.log("[WARN] Couldn't get domain from query: ", query);

        return null;
      }

      return measures[0].split(".")[0];
    },

    domains: function () {
      const queryBuilder = this.$refs.qb;

      if (!queryBuilder) {
        return [];
      }

      const metadata = queryBuilder.meta;
      const cubes = metadata.cubes;

      return cubes
        .filter((c) => {
          return c.title !== "#";
        })
        .map((c) => {
          return {
            name: c.name,
            title: c.title,
          };
        });
    },

    cubejsApi: function () {
      const { token, url } = this.$store.getters["context/cubejs"];

      if (!token || !url) {
        return null;
      }

      return cubejs(token, { apiUrl: url });
    },
  },

  watch: {
    "options.query": {
      handler: function (v) {
        console.log("CHANEGE QUEYR", v);
      },

      deep: true,
    },

    resultSet: {
      handler: function (v) {
        console.log("CHANGED RESULT SET", v);
      },
    },
  },
};
</script>

<style scopped>
.background {
  background: #f3f3fb;
  /* min-height: 100vh; */
}
.background-white {
  background: #fff;
}
.border-light {
  background: #ffffff;
  border-radius: 8px;
}

.chart-container > div {
  height: 100%;
}

.chart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-items: stretch;
  align-items: stretch;
}

.dashboard-cube-error {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
}
</style>