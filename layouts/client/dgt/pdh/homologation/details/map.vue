<template>
  <v-card flat>
    <v-card-title v-if="title" style="padding-top: 10px;padding-bottom: 10px;">{{$t(title)}}</v-card-title>

    <v-card-text>
      <HomologationMap :record="record" :height="height"></HomologationMap>
    </v-card-text>
  </v-card>
</template>
<script>
import HomologationMap from "@/layouts/client/dgt/pdh/maps/map.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  components: {
    HomologationMap,
    SimpleDetails,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },
    height: {
      default: "350",
    },
  },
};
</script>