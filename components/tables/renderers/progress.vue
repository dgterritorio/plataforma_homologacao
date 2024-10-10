<template>
  <v-progress-linear
    class="text-elevation"
    readonly
    rounded
    :color="color"
    height="25"
    :value="value"
  >
    <template v-if="!renderer.hideValue">
      <strong>{{ text }}{{ symbol }}</strong>
    </template>
  </v-progress-linear>
</template>

<script>
export default {
  props: {
    header: {
      type: Object,
      default: function () {
        return {
          renderer: {},
        };
      },
    },

    item: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },

  data() {
    return {
      renderer: this.header.renderer,
      color: null,
      value: "primary",
      text: "",
      symbol: null,
    };
  },

  created: function () {
    this.setup();
  },

  methods: {
    // Find record to display at this row cell
    setup: function () {
      // Value property to get the record from store
      const itemValue = this.header.value;
      const itemColor = this.renderer.color;

      const fn = this.renderer.fn;

      // Row item
      const item = this.item;

      let value, symbol, color, text;

      // if there is a function
      if (fn) {
        const res = fn(item);

        if (typeof res === "object") {
          value = res.value;
          color = res.color;
          symbol = res.symbol;
          text = res.text ? res.text : Math.ceil(value);
        } else {
          value = res;
          symbol = this.renderer.symbol;
          color = "primary";
          text = Math.ceil(value);
        }
      } else {
        // value
        value = item[itemValue];
        color = item[itemColor];
        symbol = this.renderer.symbol;
        text = Math.ceil(item[itemValue]);
      }

      this.color = color;
      this.symbol = symbol;
      this.text = text;
      this.value = value;
    },
  },
};
</script>
<style scoped>
.text-elevation >>> .v-progress-linear__content {
  z-index: 0;
}
</style>