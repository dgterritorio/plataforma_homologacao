<template>
  <div>
    <!-- Handle Remote layers -->
    <component
      v-for="layer in remoteLayers"
      :is="layer.cmp"
      :opacity="layer.opacity"
      :key="layer.id"
      v-bind="layer"
    >
      <component
        v-if="!layer.layers"
        :is="layer.source.cmp"
        v-bind="layer.source"
      ></component>

      <component v-else :is="'vl-layer-group'">
        <LayerCmp :remoteLayers="layer.layers"></LayerCmp>
      </component>
    </component>

    <!-- Handle Local layers -->
    <component
      v-for="layer in localLayers"
      :is="layer.cmp"
      :key="layer.id"
      :ref="'layer_' + layer.id"
      :opacity="layer.opacity"
      :zIndex="layer.zIndex"
      v-bind="layer"
      @created="$emit('layercreated', $event)"
    >
      <component
        v-if="!layer.layers"
        :is="layer.source.cmp"
        v-bind="layer.source"
        @created="$emit('sourcecreated', $event)"
      >
        <template
          v-if="
            layer.source.hasOwnProperty('features') &&
            layer.source.features.length
          "
        >
          <vl-feature
            v-for="(feature, idx) in layer.source.features"
            :key="feature.id ? feature.id : idx"
            :id="feature.id ? feature.id : idx"
            :properties="feature.properties"
          >
            <component
              :is="geomTypeToCmp(feature.geometry.type)"
              v-bind="feature.geometry"
            ></component>
          </vl-feature>
        </template>
      </component>

      <component v-else :is="'vl-layer-group'">
        <LayerCmp :localLayers="layer.layers"></LayerCmp>
      </component>

      <!-- Handle Inner Local Layers -->
      <template v-if="layer.style">
        <component
          v-for="(style, i) in layer.style"
          :key="i"
          :is="style.cmp"
          v-bind="style"
        >
          <!-- create inner style components: vl-style-circle, vl-style-icon, vl-style-fill, vl-style-stroke & etc -->
          <template v-if="style.styles">
            <component
              v-for="(st, cmp) in style.styles"
              :key="cmp"
              :is="cmp"
              v-bind="st"
            >
              <!-- vl-style-fill, vl-style-stroke if provided -->
              <vl-style-fill v-if="st.fill" v-bind="st.fill"></vl-style-fill>
              <vl-style-stroke
                v-if="st.stroke"
                v-bind="st.stroke"
              ></vl-style-stroke>
            </component>
          </template>
        </component>
      </template>
    </component>
  </div>
</template>

<script>
// import ScaleLine from "ol/control/ScaleLine";
import { kebabCase, range, random, camelCase } from "lodash";

export default {
  name: "LayerCmp",

  props: {
    localLayers: {
      type: Array,
      default: function () {
        return [];
      },
    },

    remoteLayers: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  methods: {
    geomTypeToCmp(type) {
      return "vl-geom-" + kebabCase(type);
    },
  },
};
</script>