<template>
  <SimpleDetails :title="$t('Evaluations')">
    <template v-slot:body>
      <LocalTable
        :title="$t('Tasks')"
        class="ma-6"
        :headers="columns"
        :data.sync="record.evaluations"
        hideFooter
        :height="null"
        @obs="onObservations"
      ></LocalTable>

      <LocalTable
        :title="$t('Consistency Analysis Result')"
        class="ma-6"
        :height="analysis.length ? 400 : null"
        :headers="analysisColumns"
        :data="analysis"
        hideFooter
      ></LocalTable>

      <v-dialog v-model="showObservations" max-width="600">
        <SimpleDetails :title="$t('Observations')" style="margin: 0 !important">
          <template v-slot:tools>
            <v-btn text icon @click="showObservations = false" class="mx-1">
              <v-icon>{{ "mdi-close" }}</v-icon>
            </v-btn>
          </template>

          <template v-slot:body>
            <v-row
              style="min-height: 350px"
              class="body-1 shrinked-row"
              align="stretch"
            >
              <v-col sm="12" md="12" lg="12">
                <DisplayField
                  class="py-4 body-1"
                  style="height: 85%"
                  :options="{ outlined: false, height: 300, readonly: true }"
                  :model="
                    selected.observations
                      ? selected.observations
                      : 'Sem Observações.'
                  "
                ></DisplayField>
              </v-col>
            </v-row>
            <v-row>
              <v-col offset="8" sm="4" md="4" lg="4">
                <v-btn
                  block
                  outlined
                  color="primary"
                  @click="showObservations = false"
                  >{{ $t("Go Back") }}</v-btn
                >
              </v-col>
            </v-row>
          </template>
        </SimpleDetails>
      </v-dialog>
    </template>
  </SimpleDetails>
</template>
<script>
import LocalTable from "@/components/tables/basic.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import Textarea from "@/components/forms/fields/textarea.vue";
import DisplayField from "@/components/forms/fields/display.vue";

export default {
  components: {
    LocalTable,
    SimpleDetails,
    // Textarea,
    DisplayField,
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
      showObservations: false,

      selected: {},

      store: null,

      columns: [
        {
          text: this.$t("Name"),
          value: "evaluation_type",
          renderer: {
            type: "remotesimple",
            store: "entities/EvaluationTypes",
            text: "description",
            value: "code",
            storeRead: "all",
          },
        },
        {
          text: this.$t("Evaluation Date"),
          value: "end_date",
          renderer: {
            type: "simple",
            value: "end_date",
            fn: function (value) {
              return value ? value.split("T")[0] : "-";
            },
          },
        },
        {
          text: this.$t("Consistency Percentage"),
          value: "percentage_errors",
          renderer: {
            type: "simple",
            value: "percentage_errors",
            fn: function (value) {
              const str = value !== null && !isNaN(value) ? value + "" : null;

              if (!str) {
                return "-";
              }

              const isFloating = str.indexOf(".") > -1;
              const parsed = isFloating ? str.replace(".", ",") : str;

              return parsed + " %";
            },
          },
        },
        // {
        //   text: this.$t("Percentage Accepted"),
        //   value: "percentage_accepted",
        //   renderer: {
        //     type: "simple",
        //     value: "percentage_accepted",
        //     fn: function (value, record) {
        //       if (record.accordinly === "1") {
        //         return value ? "Sim" : "Não";
        //       } else {
        //         return "-";
        //       }
        //     },
        //   },
        // },
        {
          text: this.$t("Result"),
          value: "accordingly",
          renderer: {
            type: "simple",
            value: "accordingly",
            fn: function (value) {
              switch (value) {
                case "0":
                  return "Não Aplicável";
                case "1":
                  return "Não Conforme";
                case "2":
                  return "Conforme";
                default:
                  return "";
              }
            },
          },
        },
        {
          text: this.$t("Budget (€)"),
          value: "budget",
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
        {
          text: this.$t("Observações"),
          value: "action",
          renderer: {
            type: "action",
            event: "obs",
            icon: "mdi-magnify",
          },
        },
      ],

      analysisColumns: [
        {
          text: this.$t("Rule Name"),
          value: "name",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Rule Code"),
          value: "code",
          sortable: false,
        },
        {
          text: this.$t("Total Elements"),
          value: "total",
          sortable: false,
        },
        {
          text: this.$t("Success"),
          value: "good",
          sortable: false,
        },
        {
          text: this.$t("Fail"),
          value: "bad",
          sortable: false,
        },
      ],

      analysis: [],
    };
  },

  created: async function () {
    if (process.client) {
      const evaluationTypesStore = this.$store.$db().model("EvaluationTypes");

      const isLoaded = evaluationTypesStore.store().state.entities[
        "EvaluationTypes"
      ].loaded;

      if (!isLoaded) {
        evaluationTypesStore.api().read();
      }

      this.store = this.evaluationTypesStore;

      const requestId = this.record.request.id;

      this.analysis = await this.requestAnalysisResult(requestId);
    }
  },

  methods: {
    onObservations: function (record) {
      this.selected = record;

      this.showObservations = true;
    },

    requestAnalysisResult: async function (requestId) {
      try {
        const result = await this.$axios.post(
          "/api/homologation/evaluation/getanalysis",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return result.data;
      } catch (e) {
        console.log("Error loading results ");

        return [];
      }
    },
  },
};
</script>