<template>
  <SimpleDetails :title="$t('Despesas')">
    <template v-slot:body>
      <LocalTable
        :title="'Taxa de Homologação'"
        class="ma-6 mb-12"
        :headers="columns"
        :data.sync="record.payments"
        hideFooter
        :height="null"
        @download="onDownload"
      ></LocalTable>

      <LocalTable
        v-if="record.evaluations"
        :title="'Despesas de Avaliações Internas'"
        class="ma-6"
        :headers="evaluationsColumns"
        :data.sync="expenses"
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
          text: this.$t("Name"),
          value: "description",
          align: "left",
        },
        {
          text: this.$t("Value"),
          value: "value",
          renderer: {
            type: "simple",
            value: "value",
            fn: function (value) {
              const str = value !== null && !isNaN(value) ? value + "" : null;

              if (!str) {
                return "-";
              }

              const isFloating = str.indexOf(".") > -1;
              const parsed = isFloating ? str.replace(".", ",") : str;

              return parsed + " €";
            },
          },
        },
        {
          text: this.$t("Emittion Date"),
          value: "emitted_date",
          renderer: {
            type: "simple",
            value: "emitted_date",
            fn: function (value) {
              return value ? value.split("T")[0] : "Por emitir";
            },
          },
        },
        {
          text: this.$t("Paid Date"),
          value: "paid_date",
          renderer: {
            type: "simple",
            value: "paid_date",
            fn: function (value) {
              return value ? value.split("T")[0] : "Por pagar";
            },
          },
        },
        {
          text: this.$t("Invoice"),
          value: "download",
          renderer: {
            type: "action",
            event: "download",
            icon: "mdi-download",
            disabler: function(item){
              return !item.document_id;
            }
          },
        },
      ],

      evaluationsColumns: [
        {
          text: this.$t("Task"),
          value: "evaluation_type",
          align: "left",
          sortable: false,
          renderer: {
            type: "remotesimple",
            store: "entities/EvaluationTypes",
            text: "description",
            value: "code",
            storeRead: "all",
          },
        },
        {
          text: this.$t("Task Execution Date"),
          value: "end_date",
          sortable: false,
          renderer: {
            type: "simple",
            value: "end_date",
            fn: function (value) {
              return value ? value.split("T")[0] : "-";
            },
          },
        },
        {
          text: this.$t("Budget (€)"),
          value: "budget",
          sortable: false,
          renderer: {
            type: "simple",
            value: "budget",
            fn: function (value) {
              const str = value !== null && !isNaN(value) ? value + "" : null;

              if (!str) {
                return "-";
              }

              const isFloating = str.indexOf(".") > -1;
              const parsed = isFloating ? str.replace(".", ",") : str;

              return parsed + " €";
            },
          },
        },
      ],
    };
  },

  created: async function () {
    if (process.client) {
      const evaluationTypesStore = this.$store.$db().model("EvaluationTypes");

      if (this.record.evaluations) {
        evaluationTypesStore.api().read({ once: true });
      }
    }
  },

  methods: {
    onDownload: async function (item) {
      try {
        const requestId = this.record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/document/download",
          {
            documentId: item.document_id,
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const data = result.data;
        const file = data[0];

        const name = file.name;
        const stream = file.stream;
        const mime = file.mime;

        const a = document.createElement("a");
        a.href = "data:" + mime + ";base64," + escape(stream);
        a.download = name ? name : "document.pdf";
        a.click();
      } catch (e) {
        console.log("Error downloading pdf: ");
      }
    },
  },

  computed: {
    expenses: function () {
      if (!this.record || !this.record.evaluations) {
        return [];
      }

      const evaluations = this.record.evaluations;

      return evaluations.filter(function (row) {
        return row.budget !== null;
      });
    },
  },
};
</script>