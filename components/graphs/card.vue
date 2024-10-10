<template>
  <v-card
    :height="height"
    :flat="flat"
    style="padding-left: 15px; padding-right: 15px"
  >
    <v-card-title>{{ title }}</v-card-title>
    <v-card :height="height - 70" margin="0" flat class="pa-3 graph-card">
      <component
        :is="chartType"
        :style="'height:' + (height - 90) + 'px'"
        :chart-data="data"
        :options="options"
      ></component>
    </v-card>
  </v-card>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "line-chart",
    },

    flat: {
      type: Boolean,
      default: false,
    },

    height: {
      type: Number,
      default: 300,
    },

    title: {
      type: String,
      default: null,
    },

    subtitle: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: null,
    },

    data: {
      type: Object,
      default: function () {
        return {};
      },
    },

    options: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {};
  },

  computed: {
    chartType: function () {
      let type = "vue-line-chart";

      switch (this.type) {
        // case 'line-chart':
        //   type = 'vue-line-chart'
        //   break;
        case "bar-chart":
          type = "vue-bar-chart";
          break;
        default:
          break;
      }

      return type;
    },
  },
};
</script>
<style>
.graph-card {
  position: relative;

  /* margin-left: 20px;
  margin-right: 20px; */

  /* width: 400px; */
  /* height: 250px; */

  background-color: var(--v-primary-base);
  color: #fff;
}
</style>