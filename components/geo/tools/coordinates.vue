<template>
  <div>
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          class="font-weight-bold body-1"
          small
          fab
          raised
          v-bind="attrs"
          v-on="on"
          @click="onClick"
        >E</v-btn>
      </template>
      <span>{{hint}}</span>
    </v-tooltip>
  </div>
</template>
<script>
export default {
  props: {
    olmap: {
      type: Object,
      default: function () {
        return null;
      },
    },

    vuemap: {
      type: Object,
      default: function () {
        return null;
      },
    },
  },

  data() {
    return {
      hint: "Extent",
    };
  },

  methods: {
    onClick: function () {
      const parent = this.vuemap;

      const extent = parent.extent;

      parent.fitToExtent(extent);
    },
  },
};
</script>