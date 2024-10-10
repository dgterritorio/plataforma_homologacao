<template>
  <v-chip
    :color="record['color']"
    class="text-center d-flex justify-center"
    style="border-radius: 8px; width: 100%"
  >
    <div class="font-weight-medium" style="min-width: 100px">
      {{ $t(record[renderer.text]) }}
    </div>
  </v-chip>
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
    };
  },

  computed: {
    // Find record to display at this row cell
    record: function () {
      // Value property to get the record from store
      const value = this.header.value;

      // Renderer options
      const store = this.renderer.store;
      const itemValue = this.renderer.value;

      // Data from store. Function if from vuex-orm
      const findFn = this.$store.getters[`${store}/query`];

      if (!findFn) {
        return {};
      }

      // Row item
      const item = this.item;

      const record = findFn().where(itemValue, item[value]).first();

      // return record
      return record ? record : {};
    },
  },
};
</script>