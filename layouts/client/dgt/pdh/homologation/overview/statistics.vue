<template>
  <client-only>
    <v-row class="mt-5">
      <v-col sm="12" md="6" lg="6">
        <UserInfo
          :homologation="{
            manage:$auth.user && $auth.user.group_id === 4 ?  $t('Manage Requests') : $t('Inspect Requests'),
            toManage:
              $auth.user && $auth.user.group_id === 4
                ? '/homologation/list-evaluator'
                : '/homologation/list-inspector',
          }"
          :producer="{
            manage: $t('Manage Producers'),
            toManage: '/producers/list',
          }"
        ></UserInfo>

        <ActivityStatistics
          class="mt-4"
          :values="homologation.activity.values"
          :labels="homologation.activity.labels"
        />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <GlobalMap height="530"></GlobalMap>
      </v-col>

      <v-col :sm="12" :md="12" :lg="12" class="mt-8 mb-4">
        <div class="d-flex justify-center align-center">
          <span class="text-center font-weight-medium body-1 mx-2"
            >Intervalo temporal:</span
          >
          <v-menu
            v-model="startDateMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="startDate"
                :label="$t('Start Date')"
                readonly
                outlined
                hide-details
                dense
                clearable
                v-bind="attrs"
                v-on="on"
                style="max-width: 290px"
                @click:clear="onChangeStartDate"
              ></v-text-field>
            </template>
            <v-date-picker
              :max="endDate"
              v-model="startDate"
              @input="onChangeStartDate"
            ></v-date-picker>
          </v-menu>

          <v-icon>mdi-minus</v-icon>

          <v-menu
            v-model="endDateMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="endDate"
                :label="$t('End Date')"
                outlined
                hide-details
                dense
                readonly
                clearable
                v-bind="attrs"
                v-on="on"
                style="max-width: 290px"
                @click:clear="onChangeEndDate"
              ></v-text-field>
            </template>
            <v-date-picker
              :min="startDate"
              v-model="endDate"
              @input="onChangeEndDate"
            ></v-date-picker>
          </v-menu>

          <v-btn class="mx-4" @click="onRefresh">{{ $t("Refresh") }}</v-btn>
        </div>
        <div class="d-flex justify-center align-center my-2">
          <span class="mx-1 body-1">{{ $t("Updated at:") }}</span>
          <span class="mx-1 body-1">{{ updatedAt }}</span>
        </div>
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <GeneralStatistics
          :title="
            $t('Number of Processes Submitted for Homologation of Topographic Cartography')"
          :values="global"
          :height="400"
          :showCancelled="true"
          :showSpecifics="true"
        />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <HomologationCartoTypes :values="homologation.cartoTypes" />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <HomologationTramitationTypes :values="homologation.tramitationTypes" />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <HomologationScaleTypes
          :values="homologation.scales.values"
          :labels="homologation.scales.labels"
        />
      </v-col>

      <v-col :sm="12" :md="12" :lg="12">
        <HomologationStatesCount
          :values="homologation.states.values"
          :labels="homologation.states.labels"
        />
      </v-col>

      <v-col :sm="12" :md="12" :lg="12">
        <HomologationStatesDuration
          :values="homologation.durations.values"
          :labels="homologation.durations.labels"
        />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <BasicTable
          selectable
          :headers="columns"
          :store="'HomologationRequestsStatistics'"
          :title="$t('Homologation List')"
          :sortBy="'start_date'"
          :sortDesc="true"
          :defaultFilters="homologationListfilters"
          @select="onSelectRequest"
        ></BasicTable>
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <Map :record="selectedRequest" height="550"></Map>
      </v-col>
    </v-row>
  </client-only>
</template>
<script>
import BasicTable from "~/components/tables/basic.vue";
import Map from "@/layouts/client/dgt/pdh/homologation/details/map.vue";
import GlobalMap from "@/layouts/client/dgt/pdh/maps/global-map-private.vue";
import UserInfo from "@/layouts/client/dgt/pdh/custom/simple-info-user.vue";

import GeneralStatistics from "@/layouts/client/dgt/pdh/custom/graphs/general-statistics.vue";
import HomologationCartoTypes from "@/layouts/client/dgt/pdh/custom/graphs/homologation-carto-types.vue";
import HomologationTramitationTypes from "@/layouts/client/dgt/pdh/custom/graphs/homologation-tramitation-types.vue";
import HomologationScaleTypes from "@/layouts/client/dgt/pdh/custom/graphs/homologation-scale-types.vue";
import ActivityStatistics from "@/layouts/client/dgt/pdh/custom/graphs/homologation-activity.vue";
import HomologationStatesCount from "@/layouts/client/dgt/pdh/custom/graphs/homologation-states-count.vue";
import HomologationStatesDuration from "@/layouts/client/dgt/pdh/custom/graphs/homologation-states-duration.vue";

export default {
  components: {
    BasicTable,
    Map,
    GlobalMap,
    UserInfo,

    GeneralStatistics,
    ActivityStatistics,
    HomologationCartoTypes,
    HomologationTramitationTypes,
    HomologationScaleTypes,
    HomologationStatesCount,
    HomologationStatesDuration,
  },

  data() {
    return {
      dirty: false,
      updatedAt: "",
      startDate: null,
      endDate: null,

      startDateMenu: false,
      endDateMenu: false,

      homologation: {
        activity: {
          labels: [],
          values: [],
        },

        states: {
          labels: [],
          values: [],
        },

        durations: {
          labels: [],
          values: [[], []],
        },

        cartoTypes: [],

        tramitationTypes: [],

        scales: {
          values: [],
          labels: [],
        },
      },

      global: {
        requests: 0,
      },

      columns: [
        {
          text: "ID",
          value: "id",
          width: 60,
          filterable: {
            operator: "eq",
          },
        },
        {
          text: "Nome da Cartografia",
          value: "name",
          filterable: {
            type: "string",
          },
        },
        {
          text: "Tipo Cartografia",
          value: "vectorial",
          renderer: {
            type: "simple",
            value: "type_description",
          },
          filterable: {
            type: "combobox",
            operator: "eq",
            values: [
              { text: "Vetorial", value: true },
              { text: "Imagem", value: false },
            ],
          },
        },
        {
          text: "Data de Entrada",
          value: "start_date",
          renderer: {
            type: "simple",
            value: "start_date_trim",
          },
          // filterable: {
          //   type: "date",
          //   property: "start_date",
          //   operator: "eq",
          // },
        },
        {
          text: "Data de Homologação",
          value: "end_date",
          renderer: {
            type: "simple",
            value: "end_date_str",
            fn: function (val) {
              return val ? val : "-";
            },
          },
          // filterable: {
          //   type: "date",
          //   property: "end_date",
          //   operator: "eq",
          // },
        },
        // {
        //   text: "Inspecionar",
        //   value: "inspect",
        //   width: 30,
        //   renderer: {
        //     type: "action",
        //     icon: "mdi-magnify",
        //     event: "inspect",
        //   },
        // },
      ],

      homologationListfilters: [],

      selectedRequest: {
        cartography: {
          id: null,
          bbox: null,
          area: null,
          perimeter: null,
        },
        request: {
          id: null,
          vectorial: null,
          finished: false,
          code: -1,
        },
      },
    };
  },

  created: async function () {
    if (process.client) {
      await this.requestActivity(7);
      // await this.requestDurations();
      await this.requestGlobalStatistics();

      this.updateTime();
    }
  },

  methods: {
    toTime: function (date) {
      const h = date.getHours();
      const m = date.getMinutes();
      const s = date.getSeconds();

      return [
        h < 10 ? "0" + h : h,
        m < 10 ? "0" + m : m,
        s < 10 ? "0" + s : s,
      ].join(":");
    },

    toDate(tstamp) {
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
    },

    refresh: async function () {
      const start = this.startDate;
      const end = this.endDate;

      // await this.requestDurations(start, end);
      await this.requestGlobalStatistics(start, end);

      this.updateTime();
    },

    updateTime: function () {
      this.updatedAt = this.toTime(new Date());
    },

    genChartData: function (labels, data) {
      return {
        labels: labels,
        datasets: data,
      };
    },

    requestActivity: async function (days) {
      const me = this;
      try {
        const result = await this.$axios.post(
          "/api/homologation/statistics/getactivity",
          {
            days: days,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const data = result.data;
        const activityLabels = data.map((v) => this.toDate(v.tstamp));
        const activity = data.map((v) => v.count);

        const homologation = this.homologation;

        homologation.activity.labels = activityLabels;
        homologation.activity.values = activity;
      } catch (e) {
        console.log("Error on get activty");
      }
    },

    requestGlobalStatistics: async function (start, end) {
      const me = this;
      try {
        // Update table filters
        const filters = [];

        if (start) {
          filters.push({
            property: "start_date",
            operator: "gteq",
            value: start,
          });
        } else if (end) {
          filters.push({
            type: "date",
            property: "end_date",
            operator: "lt",
            value: end,
          });
        }

        this.homologationListfilters = filters;

        // Request statistics
        const result = await this.$axios.post(
          "/api/homologation/statistics/getgeneral",
          {
            timestart: start,
            timeend: end,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const data = result.data[0];

        const global = this.global;

        global.requests = data.requests;
        global.open = data.requests_open;
        global.finished = data.requests_success;
        global.cancelled = data.requests_cancelled;

        /**
         * Cartography types
         */
        this.homologation.cartoTypes = [
          data.requests_vectorial,
          data.requests_image,
        ];

        /**
         * Homologation Types
         */
        this.homologation.tramitationTypes = [
          data.requests_type_none,
          data.requests_type_a,
          data.requests_type_b,
        ];

        /**
         * Homologation Scales
         */
        this.homologation.scales.values = data.scales.map((r) => r.total);
        this.homologation.scales.labels = data.scales.map((r) => r.description);

        /**
         * States
         */
        const states = data.states;
        const labels = [];
        const durations = [];
        const deadlines = [];
        const amounts = [];

        const mapping = {};

        states.forEach(function (row) {
          labels.push(row.description);
          durations.push(row.duration);
          deadlines.push(row.deadline);
          amounts.push(row.count);
        });

        // Durations
        this.homologation.durations.values = [durations, deadlines];
        this.homologation.durations.labels = labels;

        // Amounts
        this.homologation.states.labels = labels;
        this.homologation.states.values = amounts;
      } catch (e) {
        console.log("Error on get statistics");
      }
    },

    onChangeStartDate: function () {
      this.dirty = true;

      this.startDateMenu = false;
    },

    onChangeEndDate: function () {
      this.dirty = true;

      this.endDateMenu = false;
    },

    onRefresh: async function () {
      if (this.dirty) {
        await this.refresh();

        this.dirty = false;
      }
    },

    onSelectRequest: async function (record) {
      const requestId = record.id;
      const vectorial = record.vectorial;

      this.selectedRequest.request.id = requestId;
      this.selectedRequest.request.vectorial = vectorial;
      this.selectedRequest.request.finished = record.finished;
      this.selectedRequest.request.code = record.code;

      const cartography = await this.requestCartography(record);

      this.selectedRequest.cartography = cartography ? cartography : {};
    },

    requestCartography: async function (record) {
      try {
        const requestId = record.id;
        const vectorial = record.vectorial;

        const result = await this.$axios.post(
          "/api/homologation/cartography/get",
          {
            requestId: requestId,
            vectorial: vectorial,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return result.data[0];
      } catch (e) {
        return {};
      }
    },
  },
};
</script>

<style scoped>
.requests {
  color: var(--v-sucess-base);
}

.open {
  color: var(--v-primary-base);
}

.finished {
  color: var(--v-success-base);
}

.cancelled {
  color: var(--v-error-darken1);
}
</style>