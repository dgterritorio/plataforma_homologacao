<template>
  <SimpleDetails :title="$t('Equipments List')">
    <template v-slot:body>
      <LocalTable class="ma-6" :headers="columns" :data.sync="equipments" hideFooter :height="null"></LocalTable>
    </template>
  </SimpleDetails>
</template>
<script>
import LocalTable from "@/components/tables/basic.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  components: {
    LocalTable,
    SimpleDetails,
  },

  props: {
    record: {
      type: Object,
      handler: function () {
        return {};
      },
    },
  },

  data() {
    return {
      equipments: [],

      columns: [
        {
          text: "#",
          value: "order",
          width: 80,
          sortable: false,
        },
        {
          text: this.$t("Equipment Name"),
          value: "name",
        },
      ],
    };
  },

  created: function () {
    if (this.record.equipments) {
      this.equipments = this.record.equipments.map(function (e, idx) {
        return { order: idx + 1, name: e.name };
      });
    }
  },
};
</script>