<template>
  <v-card style="padding-left: 15px;padding-right: 15px;margin-top: 34px">
    <v-card :color="color" height="250" width="99%" class="pa-7 elevation-6 graph-card-heading">
      <line-chart class="graph-setup" :chart-data="data" :options="options"></line-chart>
    </v-card>

    <v-card-title>
      <h4>{{title}}</h4>
    </v-card-title>
    <!-- <v-card-text>
      <p>{{subtitle}}</p>
    </v-card-text>-->
  </v-card>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    },

    subtitle: {
      type: String,
      default: null
    },

    color: {
      type: String,
      default: null
    },

    data: {
      type: Object,
      default: function() {
        return {};
      }
    },

    options: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {};
  }
};
</script>
<style>
.graph-card-heading {
  position: relative;
  top: -30px;

  z-index: 1;

  margin-bottom: -24px;
  /* margin-left: 20px;
  margin-right: 20px; */

  /* width: 400px; */
  height: 250px;

  background-color: var(--v-primary-base);
  color: #fff;
  position: relative;
}

.graph-setup {
  height: 200px;
}
</style>