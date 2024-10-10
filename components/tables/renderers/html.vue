<!--<template>
  <div :class="alignment">
    {{ record }}
  </div>
</template>-->
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
      // renderer: this.header.renderer,
      alignment: "",
      // record: "",
    };
  },

  render: function (h) {
    const self = this;

    return h("td", {
      domProps: {
        innerHTML: self.updateValue(),
      },
    });
  },

  //  created: function () {
  //     console.log("I CREATE");

  //   this.record = this.updateValue();
  // },

  methods: {
    updateValue: function () {
      const valueKey = this.header.renderer.value;

      if (!this.item) {
        return "";
      }

      const value = this.item[valueKey];

      // const calign = renderer.align;
      // this.alignment = calign ? calign : "text-center";

      const fn = this.header.renderer.fn;

      if (fn) {
        return fn(value, this.item);
      }

      return value;
    },

    // refresh: async function () {
    //   console.log("I REFRESH");
    //   // this.record = this.updateValue();
    // },
  },

  // watch: {
  //   item: {
  //     handler: function () {
  //       this.record = this.updateValue();
  //     },
  //   },
  // },

  // computed: {
  //   record: function() {
  //     const renderer = this.renderer;
  //     const value = this.item[renderer.value];

  //     const calign = renderer.align;
  //     this.alignment = calign ? calign : "text-center";

  //     const fn = renderer.fn;

  //     if (fn) {
  //       return fn(value, this.item);
  //     }

  //     return value;
  //   }
  // }
};
</script>