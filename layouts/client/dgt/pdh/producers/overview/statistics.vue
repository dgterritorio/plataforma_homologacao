<template>
  <client-only>
    <v-row class="mt-5">
      <v-col sm="12" md="6" lg="6">
        <UserInfo
          :homologation="{
            manage: $t('Manage Requests'),
            toManage: '/homologation/list-evaluator',
          }"
          :producer="{
            manage: $t('Manage Producers'),
            toManage: '/producers/list',
          }"
        ></UserInfo>
      </v-col>

      <v-col :sm="12" :md="12" :lg="12">
        <ActivityStatistics
          :title="$t('Platform Producers Activity')"
          :values="producers.activity.values"
          :labels="producers.activity.labels"
        />

        <!-- <GraphCard
          :data="producers.activity"
          :options="headingOpts"
          :color="'primary'"
        ></GraphCard> -->
      </v-col>

      <v-col :sm="12" :md="12" :lg="12" class="mt-8 mt-4">
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
          :title="$t('Number of Entity Requests')"
          :values="global"
          :height="400"
          :showCancelled="true"
          :showSpecifics="true"
        />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <ProducersCartoTypes :values="producers.cartoTypes" />
      </v-col>

      <v-col :sm="12" :md="12" :lg="12">
        <HomologationStatesCount
          :title="$t('Producer Requests per State')"
          :values="producers.states.values"
          :labels="producers.states.labels"
        />
      </v-col>

      <v-col :sm="12" :md="12" :lg="12">
        <HomologationStatesDuration
          :title="$t('Producer Stage Durations')"
          :values="producers.durations.values"
          :labels="producers.durations.labels"
        />
      </v-col>
    </v-row>
  </client-only>
</template>
<script>
import GraphHeading from "@/components/graphs/heading.vue";
import GraphCard from "@/components/graphs/card.vue";
import UserInfo from "@/layouts/client/dgt/pdh/custom/simple-info-user.vue";

import GeneralStatistics from "@/layouts/client/dgt/pdh/custom/graphs/general-statistics.vue";
import ProducersCartoTypes from "@/layouts/client/dgt/pdh/custom/graphs/producers-carto-types.vue";
import ActivityStatistics from "@/layouts/client/dgt/pdh/custom/graphs/homologation-activity.vue";
import HomologationStatesCount from "@/layouts/client/dgt/pdh/custom/graphs/homologation-states-count.vue";
import HomologationStatesDuration from "@/layouts/client/dgt/pdh/custom/graphs/homologation-states-duration.vue";

export default {
  components: {
    GraphHeading,
    GraphCard,
    UserInfo,
    GeneralStatistics,
    ProducersCartoTypes,
    ActivityStatistics,
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

      producers: {
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
      },

      global: {
        requests: 0,
      },
    };
  },

  created: async function () {
    if (process.client) {
      await this.requestActivity(7);
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

      await this.requestGlobalStatistics(start, end);
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
          "/api/producer/statistics/getactivity",
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

        const producers = this.producers;

        producers.activity.labels = activityLabels;
        producers.activity.values = activity;
      } catch (e) {
        console.log("Error on get activty");
      }
    },

    requestGlobalStatistics: async function (start, end) {
      const me = this;
      try {
        const result = await this.$axios.post(
          "/api/producer/statistics/getgeneral",
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
        this.producers.cartoTypes = [
          data.requests_vectorial,
          data.requests_image,
          data.requests_aerial,
        ];

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

        this.producers.durations.values = [durations, deadlines];
        this.producers.durations.labels = labels;

        this.producers.states.values = amounts;
        this.producers.states.labels = labels;
      } catch (e) {
        console.log("Error on get activty");
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