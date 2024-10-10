<template>
  <span>{{ formatDate(item[renderer.value], renderer.separator) }}</span>
</template>

<script>
export default {
  props: {
    header: {
      type: Object,
      default: function() {
        return {};
      }
    },

    item: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },

  data() {
    return {
      renderer: {
        separator: null,
        value: null
      }
    };
  },

  created: function() {
    this.renderer = this.header.renderer;
  },

  methods: {
    formatDate(tstamp, separator) {
      if (!tstamp || !tstamp.length) {
        return "";
      }

      const tstampObj = new Date(tstamp);

      let day = tstampObj.getDate();
      let month = tstampObj.getMonth() + 1;
      let year = tstampObj.getFullYear();

      if (!separator) {
        separator = "/";
      }

      if (day < 10) {
        day = "0" + day;
      }

      if (month < 10) {
        month = "0" + month;
      }

      return day + separator + month + separator + year;
    }
  }
};
</script>