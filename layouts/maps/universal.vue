<template>
  <BaseMap
  :mapId="mapId"
  ></BaseMap>
</template>

<script>
import BaseMap from "~/components/geo/map/base.vue";

export default {
  name: "UniversalMap",

  props: {
    "mapId":{
      type: Number
    }
  },

  components: {
    BaseMap
  }
};
</script>
