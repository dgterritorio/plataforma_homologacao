<template>
  <v-card flat style="margin:0; padding:0">
    <v-card-title v-if="title" style="padding-top: 10px;padding-bottom: 10px;">{{$t(title)}}</v-card-title>

    <v-card-text style="margin:0; padding:0">
      <HomologationMap :onlyUser="onlyUser" :height="height"></HomologationMap>
    </v-card-text>
  </v-card>
</template>
<script>
import HomologationMap from "@/layouts/client/dgt/pdh/maps/global-map-private.vue";
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

    height: {
      default: "350",
    },

    onlyUser: {
      type: Boolean,
      default: false,
    },
  },
};
</script>