<template>
  <div>
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          small
          fab
          raised
          v-bind="attrs"
          v-on="on"
          @click="$emit('expand', 'geo_layers')"
        >
          <v-icon>mdi-layers</v-icon>
        </v-btn>
      </template>
      <span>{{hint}}</span>
    </v-tooltip>
  </div>
</template>
<script>
export default {
  data() {
    return {
      hint: this.$t("Layers"),
    };
  },
};
</script>