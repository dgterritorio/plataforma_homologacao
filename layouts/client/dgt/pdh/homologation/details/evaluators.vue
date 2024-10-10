<template>
  <SimpleDetails :title="$t('Evaluations')">
    <template v-slot:body>
      <LocalTable
        class="ma-6"
        :headers="columns"
        :data.sync="record.evaluators"
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
      store: null,

      columns: [
        {
          text: this.$t("Ordem"),
          value: "ord",
          sortable: false,
        },
        {
          text: this.$t("Name"),
          value: "name",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Email"),
          value: "email",
          sortable: false,
        },
        {
          text: this.$t("State Added"),
          value: "code",
          sortable: false,
          renderer: {
            type: "chip",
            store: "entities/HomologationStateTypes",
            text: "description",
            value: "code",
            storeRead: "all",
          },
        },
        {
          text: this.$t("Date Added"),
          value: "date_added",
          sortable: false,
        },
        {
          text: this.$t("Permissão"),
          value: "owner",
          sortable: false,
          renderer: {
            type: "icon",
            value: "owner",
            color: "primary",
            fn: function (value) {
              return value ? "mdi-pencil" : "mdi-text-box-search";
            },
            textFn: function (value) {
              return value ? "Edição" : "Leitura";
            },
          },
        },
      ],
    };
  },
};
</script>