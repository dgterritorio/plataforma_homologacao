<template>
  <div :class="alignment" v-html="$t(record)" />
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
      record: "",
      alignment: "",
      subscription: null,
    };
  },

  created: function () {
    if (process.client) {
      this.record = this.getRecord();

      const self = this;

      this.subscription = this.$store.subscribeAction((action, state) => {
        if (action.type === "context/fireEvt") {
          if (action.payload.event === "preferences-update") {
            self.record = self.getRecord();
          }
        }
      });
    }
  },

  beforeDestroy: function () {
    if (this.subscription) {
      this.subscription();
    }
  },

  methods: {
    getRecord: function () {
      const renderer = this.renderer;

      const itemValue = renderer.hasOwnProperty("value")
        ? renderer.value
        : this.header.value;

      const value = this.item[itemValue];

      const calign = renderer.align;
      this.alignment = calign ? calign : "text-center";

      const fn = renderer.fn;

      if (fn) {
        return fn(value, this.item);
      }

      const cv = renderer.cv;
      if (cv && cv.unitFrom && cv.prefKey) {
        const preferences = this.$store.getters["preferences/values"];

        const decPlaces =
          preferences[`${cv.prefKey}-places`] != null
            ? preferences[`${cv.prefKey}-places`]
            : cv.decPlaces != null
            ? cv.decPlaces
            : -1;

        const showUnit = cv.showUnit ? cv.showUnit : false;
        const locale = cv.locale ? cv.locale : "pt";

        return this.$u.convert(
          value,
          cv.unitFrom,
          preferences[cv.prefKey],
          decPlaces,
          locale,
          showUnit
        );
      }

      return value;
    },
  },

  watch: {
    item: {
      handler: function (oldv, newv) {
        this.record = this.getRecord();
      },
    },
  },
};
</script>