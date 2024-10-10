<template>
  <td>{{ value }}</td>
</template>
<script>
export default {
  props: {
    value: null,

    // item: {
    //   type: Object,
    //   default: function () {
    //     return {};
    //   },
    // },

    // header: {
    //   type: Object,
    //   default: function () {
    //     return {};
    //   },
    // },

    timeout: {
      type: Number,
      default: 20,
    },
  },

  mounted: function () {
    const self = this;

    setTimeout(function () {
      self.$emit("rendered");
    }, this.timeout);
  },
};
</script>