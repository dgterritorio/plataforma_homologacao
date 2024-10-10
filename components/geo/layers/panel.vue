<template>
  <v-card :min-width="'300px'" class="d-flex flex-column">
    <v-card-title class="unselectable text--secondary">
      {{ $t("Layers List") }}
      <v-spacer></v-spacer>
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider style="margin: 0"></v-divider>

    <v-card-text class="px-2 body-1" style="overflow-y: scroll">
      <v-treeview
        dense
        open-on-click
        selectable
        activatable
        :items="leafs"
        :item-children="'layers'"
        :item-text="'title'"
        :selected-color="'primary'"
        :active.sync="active"
        :return-object="true"
        :value="selected"
        @input="onUpdate($event)"
        @update:active="onActivateNode($event)"
      >
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="item.hasOwnProperty('layers')">{{
            open ? "mdi-minus" : "mdi-plus"
          }}</v-icon>
          <v-icon v-else :color="item.visible ? 'primary' : ''">{{
            item.icon
          }}</v-icon>
        </template>
      </v-treeview>
    </v-card-text>
    <v-spacer></v-spacer>

    <v-card-actions
      style="width: 100%"
      class="d-flex flex-column px-4 pb-3 body-1 unselectable text--secondary"
    >
      <v-divider style="width: 100%" class="mb-2 mt-0"></v-divider>

      <div
        class="d-flex align-center justify-space-between"
        style="width: 100%"
      >
        <div>{{ $t("Opacity") }}:</div>
        <v-slider
          :disabled="!active.length"
          dense
          hide-details
          color="primary"
          max="1"
          min="0"
          step="0.1"
          style="width: 100%"
          :value="sliderValue"
          v-model="sliderValue"
          @click="onSliderClick"
        ></v-slider>
      </div>

      <div style="width: 100%" class="d-flex justify-space-between">
        <div>{{ this.$t("Active Layers") }}:</div>
        <div>{{ headerText }}</div>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "geo-layers",
  props: {
    layers: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  data() {
    return {
      panelOpen: false,
      active: [],
      selected: [],
      leafs: [],
      selectedCount: 0,

      sliderValue: 1.0,
    };
  },

  created: function () {
    if (this.layers && this.layers.length) {
      this.processLayers(this.layers);
    }
  },

  methods: {
    onUpdate: function (selected) {
      const selectedCount = selected.length;

      this.selectedCount = selectedCount;

      const selectdIds = selected.map(function (item) {
        return item.id;
      });

      this.leafs.forEach(function (item) {
        item.visible = selectdIds.includes(item.id);
      });
    },

    processLayers(newLayers) {
      const selected = [];
      const leafs = [];

      function processLayers(layers) {
        layers.forEach(function (l) {
          if (l.hasOwnProperty("layers")) {
            processLayers(l.layers);
          } else {
            if (l.visible) {
              selected.push(l);
            }

            const source = l.source;

            if (source && source.hasOwnProperty("features")) {
              l.icon = "mdi-vector-polygon";
            } else {
              l.icon = "mdi-map-legend";
            }

            leafs.unshift(l);
          }
        });
      }

      processLayers(newLayers);

      this.leafs = leafs;
      this.selected = selected;
    },

    onActivateNode: function (nodes) {
      const node = nodes.length ? nodes[0] : null;

      if (node) {
        this.sliderValue = node.opacity ? node.opacity : 1.0;
      }
    },

    onSliderClick: function (event) {
      if (this.active && this.active.length) {
        const active = this.active[0];

        active.opacity = this.sliderValue;
      }
    },
  },

  computed: {
    headerText: function () {
      const count = this.selectedCount;

      const total = this.leafs.length;

      return count + " " + "/" + " " + total;
    },
  },

  watch: {
    layers: function (newLayers) {
      this.processLayers(newLayers);
    },
  },
};
</script>
