<template>
  <div :style="'color:' + iconColor" :class="!isBold ? '' : 'font-weight-medium'">
    <v-icon :color="color">{{ record }}</v-icon> {{ text }}
  </div>
</template>
<script>
export default {
  props: {
    header: {
      type: Object,
      default: function () {
        return {};
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
    };
  },

  computed: {
    record: function () {
      const renderer = this.renderer;
      const value = this.item[renderer.value];

      const fn = renderer.fn;

      if (fn) {
        return fn(value, this.item);
      }

      return value;
    },

    color: function () {
      const renderer = this.renderer;

      if (renderer.hasOwnProperty("color")) {
        return renderer.color;
      }

      const value = this.item[renderer.value];

      const fn = renderer.colorFn;

      if (fn) {
        return fn(value, this.item);
      }

      return value;
    },

    iconColor: function () {
      if (this.color) {
        let iconColor = "primary";

        switch (this.color) {
          case "grey":
          case "red":
            iconColor = this.color;
            break;
          case "primary":
            iconColor = "var(--v-primary-base)";
            break;
          default:
            iconColor = "black";
            break;
        }

        return iconColor;
      }

      return "black";
    },

    text: function () {
      const renderer = this.renderer;

      if (renderer.hasOwnProperty("text")) {
        return renderer.text;
      }

      const value = this.item[renderer.value];

      const fn = renderer.textFn;

      if (fn) {
        return fn(value, this.item);
      }

      return "";
    },

    isBold: function () {
      if (!this.renderer.hasOwnProperty("bold")) {
        return true;
      }

      return this.renderer.bold;
    },
  },
};
</script>