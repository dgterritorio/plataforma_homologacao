<template>
  <v-card style="border-radius: 8px" :color="record.color">
    <v-card-title class="unselectable d-flex justify-space-between py-3">
      <div class="mx-2">
        <!-- <span>{{$t('State')}}:</span> -->
        <span>{{ record.description }}</span>
      </div>

      <v-btn
        v-if="!ongoing && !noDetails"
        dense
        outlined
        text
        @click="$emit('click')"
      >
        <v-icon left>{{ "mdi-text-box-search-outline" }}</v-icon>
        {{ $t("View Details") }}</v-btn
      >
    </v-card-title>

    <v-card-text class="white pt-2">
      <div class="subtitle-1 font-weight-medium my-2 d-flex">
        <v-icon class="mx-2">{{ "mdi-clock-outline" }}</v-icon>
        {{ parseDate(record.start_date) }}
        {{ !isFinished ? "-" + endDateText : "" }}
      </div>

      <div
        v-if="!ongoing && record.intervening_name"
        class="subtitle-1 font-weight-medium my-2 d-flex"
      >
        <v-icon class="mx-2">{{ "mdi-account" }}</v-icon>
        <span>{{ record.intervening_name }}</span>
      </div>

      <v-divider
        v-if="
          wasReverted ||
          wasSuspended ||
          wasHomologationTypeChanged ||
          wasRegimeChanged
        "
        class="my-4"
      ></v-divider>

      <div v-if="wasReverted" class="subtitle-1 font-weight-medium my-2 d-flex">
        <v-icon color="red" class="mx-2">{{ "mdi-progress-close" }}</v-icon>
        <span>{{ $t("Reverted State") }}</span>
        {{ isFinished }}
      </div>

      <div
        v-if="wasSuspended"
        class="subtitle-1 font-weight-medium my-2 d-flex"
      >
        <v-icon color="orange" class="mx-2">{{
          "mdi-pause-circle-outline"
        }}</v-icon>
        <span>{{
          isSuspended
            ? $t("Suspended")
            : $t("Was Suspended") +
              " " +
              suspendedTimes +
              " " +
              $t("by") +
              " " +
              suspendedDays
        }}</span>
      </div>

      <div
        v-if="wasRegimeChanged"
        class="subtitle-1 font-weight-medium my-2 d-flex"
      >
        <v-icon color="orange" class="mx-2">{{ "mdi-playlist-edit" }}</v-icon>
        <div>
          {{
            $t("Homologation regime changed") +
            " " +
            record.regimetypes.length +
            " " +
            (record.regimetypes.length !== 1 ? $t("times") : $t("time"))
          }}
        </div>
      </div>

      <div
        v-if="wasHomologationTypeChanged"
        class="subtitle-1 font-weight-medium my-2 d-flex"
      >
        <v-icon color="orange" class="mx-2">{{ "mdi-playlist-edit" }}</v-icon>
        <span>{{
          $t("Homologation type changed") +
          " " +
          record.homologationtypes.length +
          " " +
          (record.homologationtypes.length !== 1 ? $t("times") : $t("time"))
        }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
// import MultiStepForm from "~/components/forms/multistepform.vue";

export default {
  name: "StateSquare",

  components: {},

  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    noDetails: {
      type: Boolean,
      default: false,
    },

    isProducer: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    parseDate(tstamp) {
      // const tstamp = this.start_date;

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
  },

  computed: {
    ongoing: function () {
      return this.record.end_date === null ? true : false;
    },

    wasReverted: function () {
      return this.record.reverted;
    },

    wasSuspended: function () {
      return this.record.hasOwnProperty("suspensions");
    },

    isSuspended: function () {
      return !!this.record.isSuspended;
    },

    wasRegimeChanged: function () {
      return this.record.hasOwnProperty("regimetypes");
    },

    wasHomologationTypeChanged: function () {
      return this.record.hasOwnProperty("homologationtypes");
    },

    suspendedTimes: function () {
      let times;

      if (this.wasSuspended) {
        times = this.record.suspensions.reduce(function (acc, curr) {
          if (!isNaN(curr.duration)) {
            return acc + 1;
          } else {
            return acc;
          }
        }, 0);

        if (times !== 1) {
          return times + " " + this.$t("times");
        } else {
          return times + " " + this.$t("time");
        }
      }

      return 0 + " " + this.$t("times");
    },

    suspendedDays: function () {
      let days;

      if (this.wasSuspended) {
        days = this.record.suspensions.reduce(function (acc, curr) {
          if (!isNaN(curr.duration)) {
            return acc + curr.duration;
          } else {
            return acc;
          }
        }, 0);

        if (days !== 1) {
          return days + " " + this.$t("business days");
        } else {
          return days + " " + this.$t("business day");
        }
      }

      return 0 + " " + this.$t("business days");
    },

    isFinished: function () {
      const record = this.record;

      const code = record.code;

      if (!this.isProducer) {
        return code > 55 && code < 103;
      } else {
        return code >= 3;
      }
    },

    endDateText: function () {
      if (this.isSuspended) {
        return this.$t("Suspended");
      }

      const end_date = this.record.end_date;

      return end_date ? this.parseDate(end_date) : this.$t("On going");
    },
  },
};
</script>
