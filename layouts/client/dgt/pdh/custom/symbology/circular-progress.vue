<template>
  <v-card flat style="padding:0;">
    <v-card-title style="padding-top: 10px;padding-bottom: 10px;"></v-card-title>
    <v-card-text class="d-flex justify-center" style="padding:0">
      <v-progress-circular
        :rotate="360"
        :size="size"
        :width="width"
        :value="percent"
        :color="color"
      >
        <div
          v-if="deadline"
          class="subtitle-1 font-weight-medium"
        >{{ value }} {{value !== 1 ? $t('days of') : $t('day of')}} {{deadline}}</div>

        <div v-else class="subtitle-1 font-weight-medium">{{ $t('No Deadline') }} {{deadline}}</div>
      </v-progress-circular>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "StateProgress",

  props: {
    store: {
      type: String,
      default: 'HomologationStateTypes'
    },

    size: {
      type: Number,
      default: 250
    },

    width: {
      type: Number,
      default: 15
    },

    state: {
      type: Object,
      default: function() {
        return {};
      }
    },

    states: {}
  },

  computed: {
    color: function() {
      let color = "teal";

      const progress = this.percent;

      if (progress < 60) {
        color = "teal darken-2";
      } else if (progress < 80) {
        color = "orange darken-2";
      } else {
        color = "red darken-2";
      }

      return color;
    },

    value: function() {
      const state = this.state.code;

      const info = this.stateInfo.find(function(s) {
        return s.code === state;
      });

      if (!info) {
        return null;
      }

      const deadline = info.deadline;

      const tstamp = this.state.start_date;

      const date = new Date(tstamp);

      const diff = Math.abs(new Date() - date);

      const days = Math.floor(diff / (1000.0 * 60 * 60 * 24));

      return days > deadline ? deadline : days;
    },

    percent: function() {
      if (this.value !== null && this.deadline !== null) {
        return (100 * this.value) / this.deadline;
      } else {
        return 0;
      }
    },

    deadline: function() {
      const state = this.state.code;

      const info = this.stateInfo.find(function(s) {
        return s.code === state;
      });

      if (!info) {
        return null;
      }

      return info.deadline;
    },

    stateInfo: function() {
      const store = this.$store.$db().model("HomologationStateTypes");

      return store.all();
    }
  }
};
</script>