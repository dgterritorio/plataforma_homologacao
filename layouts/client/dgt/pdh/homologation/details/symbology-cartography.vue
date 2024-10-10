<template>
  <v-row class="shrinked-row">
    <v-col sm="12" md="12" lg="12">
      <ProductTypeSymbol flat expanded :record="record.request"></ProductTypeSymbol>
    </v-col>
    <v-col sm="12" md="12" lg="12">
      <HomologationTypeSymbol flat expanded :record="record.request"></HomologationTypeSymbol>
    </v-col>
    <v-col sm="12" md="12" lg="12">
      <ExceptionalSymbol flat expanded :record="record.request"></ExceptionalSymbol>
    </v-col>
    <v-col sm="12" md="12" lg="12">
      <HasMetacontrolSymbol flat expanded :record="record.request"></HasMetacontrolSymbol>
    </v-col>
    <v-col sm="12" md="12" lg="12">
      <HasProtocolSymbol flat expanded :record="record.request"></HasProtocolSymbol>
    </v-col>
  </v-row>
</template>
<script>
import ExceptionalSymbol from "@/layouts/client/dgt/pdh/custom/symbology/exceptional-regime.vue";
import ProductTypeSymbol from "@/layouts/client/dgt/pdh/custom/symbology/product-type.vue";
import HomologationTypeSymbol from "@/layouts/client/dgt/pdh/custom/symbology/homologation-type.vue";
import HasMetacontrolSymbol from "@/layouts/client/dgt/pdh/custom/symbology/has-metacontrol.vue";
import HasProtocolSymbol from "@/layouts/client/dgt/pdh/custom/symbology/has-protocol.vue";

export default {
  components: {
    ExceptionalSymbol,
    ProductTypeSymbol,
    HomologationTypeSymbol,
    HasMetacontrolSymbol,
    HasProtocolSymbol
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