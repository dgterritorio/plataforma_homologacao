<template>
  <div class="d-flex flex-column">
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          style="border-radius: 5px 5px 0 0"
          small
          fab
          v-on="on"
          v-bind="attrs"
          @click="onZoomIn"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>{{hintZoomIn}}</span>
    </v-tooltip>

    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          style="border-radius: 0 0 5px 5px"
          small
          fab
          v-on="on"
          v-bind="attrs"
          @click="onZoomOut"
        >
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </template>
      <span>{{hintZoomOut}}</span>
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
      hintZoomIn: this.$t("Zoom In"),
      hintZoomOut: this.$t("Zoom Out"),
    };
  },

  methods: {
    onZoomIn: function () {
      const map = this.olmap;

      map.getView().animate({
        zoom: map.getView().getZoom() + 1,
        duration: 250,
      });
    },

    onZoomOut: function () {
      const map = this.olmap;

      map.getView().animate({
        zoom: map.getView().getZoom() - 1,
        duration: 250,
      });
    },
  },
};
</script>