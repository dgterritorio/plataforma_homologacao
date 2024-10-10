<template>
  <v-row class="shrinked-row ">
    <v-col sm="12" md="12" lg="12">
      <ProducesVectorialSymbol flat expanded :record="record.request"></ProducesVectorialSymbol>
    </v-col>
    <v-col sm="12" md="12" lg="12">
      <ProducesImageSymbol flat expanded :record="record.request"></ProducesImageSymbol>
    </v-col>
    <v-col sm="12" md="12" lg="12">
      <ProducesAerialSymbol flat expanded :record="record.request"></ProducesAerialSymbol>
    </v-col>
  </v-row>
</template>
<script>
import ProducesVectorialSymbol from "@/layouts/client/dgt/pdh/custom/symbology/produces-vectorial.vue";
import ProducesAerialSymbol from "@/layouts/client/dgt/pdh/custom/symbology/produces-aerial.vue";
import ProducesImageSymbol from "@/layouts/client/dgt/pdh/custom/symbology/produces-image.vue";
export default {
  components: {
    ProducesVectorialSymbol,
    ProducesAerialSymbol,
    ProducesImageSymbol,
  },
  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
};
</script>