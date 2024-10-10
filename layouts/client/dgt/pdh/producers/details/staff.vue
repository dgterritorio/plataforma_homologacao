<template>
  <SimpleDetails :title="$t('Staff List')">
    <template v-slot:body>
      <LocalTable
        class="ma-6"
        :headers="columns"
        :data.sync="record.staff"
        hideFooter
        :height="null"
      ></LocalTable>
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
      columns: [
        {
          text: this.$t("Member Name"),
          value: "name",
          align: "left",
        },

        {
          text: this.$t("Member Type"),
          value: "type",
          renderer: {
            type: "simple",
            value: "type",
            fn: function (value) {
              switch (value) {
                case 0:
                  return "Diretor";
                  break;
                default:
                  return "Técnico";
                  break;
              }
            },
          },
        },
        {
          text: this.$t("Academic Skills"),
          value: "skills",
        },
      ],
    };
  },
};
</script>