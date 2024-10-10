<template>
  <v-card :min-width="'300px'">
    <!-- Header -->
    <v-card-title>
      <strong>
        <slot name="title"></slot>
      </strong>
      
      <v-spacer></v-spacer>

      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider style="margin: 0"></v-divider>

    <!-- Body -->
    <slot></slot>
  </v-card>
</template>

<script>
export default {
  name: "master-detail",
  props: {
    layers: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      panelOpen: false
    };
  },

  methods: {},

  watch: {}
};
</script>
