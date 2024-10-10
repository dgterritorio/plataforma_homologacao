<template>
  <SimpleDetails :title="$t('Tramitation Documents')">
    <template v-slot:body>
      <LocalTable class="ma-6" :headers="columns" :data.sync="activities" hideFooter :height="null"></LocalTable>
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
      activities: [],
      columns: [
        {
          text: "#",
          value: "order",
          sortable: false,
        },
        {
          text: this.$t("Name"),
          value: "description",
        },
      ],
    };
  },

  created: function () {
    if (this.record.activities) {
      this.activities = this.record.activities.map(function (e, idx) {
        return { order: idx + 1, description: e.description };
      });
    }
  },
};
</script>