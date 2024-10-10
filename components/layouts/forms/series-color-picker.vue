<template>
  <tr class="dashboard-color-picker">
    <td class="subtitle-2">{{ title }} </td>
    <td style="padding: 0 8px">
      <v-menu transition="slide-y-transition" bottom right>
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
            :class="{
              'dashboard-color-selected-square': true,
              'dashboard-color-selected-empty': empty,
            }"
            :style="!empty ? `background: ${rgba}; border-color: ${rgb}` : ''"
          ></div>
        </template>
        <v-color-picker
          ref="color-picker"
          dot-size="25"
          hide-canvas
          hide-inputs
          hide-sliders
          mode="rgba"
          show-swatches
          swatches-max-height="300"
          :value="value_"
          v-model="value_"
          @input="onInput"
        ></v-color-picker>
      </v-menu>
    </td>

    <td style="padding: 0 8px">
      <v-slider
        hide-details
        :min="0"
        :max="100"
        :step="10"
        :color="rgb"
        tick-size="4"
        :value.sync="opacity"
        v-model="opacity"
        @end="onSlideEnd"
      ></v-slider>
    </td>
  </tr>
</template>
<script>
import colors from "vuetify/es5/util/colors";

export default {
  props: {
    title: {
      type: String,
      default: "",
    },

    value: {
      type: Object,
      default: function () {
        return {
          r: 0,
          g: 0,
          b: 0,
          a: 0,
        };
      },
    },
  },

  created: function () {
    this.value_ = this.parse(this.value);
  },

  data() {
    return {
      value_: this.value,
      opacity: 50,
      timer: null,
      swatches: null,
    };
  },

  model: {
    prop: "value_",
    event: "input",
  },

  computed: {
    rgba: function () {
      const { r, g, b, a } = this.value_;

      return `rgba(${r},${g},${b},${a})`;
    },

    rgb: function () {
      const { r, g, b } = this.value_;

      return `rgba(${r},${g},${b},1.0)`;
    },

    empty: function () {
      return !this.value_;
    },
  },

  methods: {
    chunk: function (str, size = 1) {
      const chunked = [];
      let index = 0;
      while (index < str.length) {
        chunked.push(str.substr(index, size));
        index += size;
      }
      return chunked;
    },

    hexToRGBA: function (hex) {
      const rgba = this.chunk(hex.slice(1), 2).map((c) => parseInt(c, 16));

      return {
        r: rgba[0],
        g: rgba[1],
        b: rgba[2],
        // a: Math.round((rgba[3] / 255) * 100) / 100,
      };
    },

    genRandom: function () {
      const keys = Object.keys(colors);
      const len = keys.length;

      const randomIdx = Math.floor(Math.random() * len);

      const randomPalette = colors[keys[randomIdx]];

      const hex = randomPalette.base ? randomPalette.base : randomPalette.black;

      console.log(hex);

      const rgba = this.hexToRGBA(`${hex}FF`);

      rgba.a = 0.5;

      return rgba;
    },

    parse: function (value) {
      if (!value) {
        value = this.genRandom();
      }

      this.opacity = Math.floor(value.a * 100);

      return value;
    },

    onInput: function (value) {
      this.value_.a = 0.5;
      this.opacity = 50;

      this.$emit("input", this.value_);
    },

    onSlideEnd: function (value) {
      const absolute = value / 100.0;

      this.value_.a = absolute;

      this.$emit("input", this.value_);
    },
  },
};
</script>
<style scoped>
.dashboard-color-picker {
  width: 100%;
  padding: 0 12px;
}

.dashboard-color-selected-square {
  width: 100%;
  height: 25px;
  border-radius: 2px;
  border: 3px solid;
}
</style>