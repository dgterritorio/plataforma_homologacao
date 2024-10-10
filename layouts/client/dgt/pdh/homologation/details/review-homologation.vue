<template>
  <v-card>
    <v-card-title
      class="d-flex justify-space-between elevation-1"
      style="z-index: 10"
    >
      {{ $t("State History") }}
      <v-icon @click="onClose">mdi-close</v-icon>
    </v-card-title>

    <v-card-text class="px-8 py-6" ref="formbody">
      <v-row align="start" class="shrinked-row">
        <v-col :sm="6" :md="6" :lg="6" style="padding-bottom: 0">
          <!-- Base Details -->

          <DisplayField
            :options="{ text: $t('Intervening'), align: 'center' }"
            :model="record.intervening_name"
          ></DisplayField>

          <DisplayField
            :options="{ text: $t('Intervening User Type'), align: 'center' }"
            :model="record.intervening ? $t('Evaluator') : $t('Applicant')"
          ></DisplayField>
        </v-col>
        <v-col
          :sm="6"
          :md="6"
          :lg="6"
          class="d-flex justify-center align-center"
        >
          <!-- State -->
          <State :state="record.code" :size="200" :showTitle="false"></State>
        </v-col>

        <v-col sm="12" md="12" lg="12" style="padding-top: 0">
          <!-- Dates -->
          <v-row justify="start" class="shrinked-row">
            <v-col sm="12" md="4" lg="4">
              <DisplayField
                :options="{ text: $t('Start Date'), align: 'center' }"
                :model="
                  record.start_date
                    ? record.start_date.split('T')[0]
                    : 'Sem data'
                "
              ></DisplayField>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <DisplayField
                :options="{ text: $t('End Date'), align: 'center' }"
                :model="
                  record.end_date
                    ? record.end_date.split('T')[0]
                    : $t('In Progress')
                "
              ></DisplayField>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <DisplayField
                :options="{ text: $t('Business Days'), align: 'center' }"
                :model="
                  record.duration +
                  ' ' +
                  (record.duration === 1 ? $t('day') : $t('dias'))
                "
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="4" lg="4" v-if="hadSuspensionsText">
              <DisplayField
                :options="{ text: $t('Had Interruptions'), align: 'center' }"
                :model="hadSuspensionsText"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="8" lg="8" v-if="hadSuspensionsText">
              <DisplayField
                :options="{
                  text: $t('Business Days (Interruptions)'),
                  align: 'center',
                }"
                :model="daysSuspensionText"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{
                  text: $t('Observations'),
                  align: 'center',
                }"
                :model="observations"
              ></DisplayField>
            </v-col>
          </v-row>
        </v-col>

        <v-col sm="12" md="12" lg="12" class="pb-4">
          <!-- Summary -->
          <VTable
            :title="$t('State Summary')"
            :height="null"
            :headers="summaryHeader"
            :data.sync="summary"
            hideFooter
            @goto="onGoTo"
          ></VTable>
        </v-col>

        <!-- Documents -->
        <v-col
          sm="12"
          md="12"
          lg="12"
          v-if="hasDocuments"
          class="pb-4"
          ref="documents"
        >
          <VTable
            v-if="record.intervening"
            :title="$t('Reviewed Documents')"
            :height="null"
            :headers="reviewedDocumentsHeader"
            :data.sync="documents"
            hideFooter
            @download="onDownload"
          ></VTable>

          <VTable
            v-else-if="!record.intervening"
            :title="$t('Submitted Documents')"
            :height="null"
            :headers="documentsHeader"
            :data.sync="documents"
            hideFooter
            @download="onDownload"
          ></VTable>
        </v-col>

        <!-- Cartography -->
        <v-col
          sm="12"
          md="12"
          lg="12"
          v-if="hasCartography"
          class="py-4"
          ref="cartography"
        >
          <v-card>
            <v-card-title class="mx-0">{{
              $t("Uploaded Cartograhpy")
            }}</v-card-title>

            <VMap
              :record="{
                request: {
                  id: record.request_id,
                  vectorial: cartography.vectorial,
                },
                cartography: cartography,
              }"
            ></VMap>
          </v-card>
        </v-col>

        <!-- Nextcloud -->
        <v-col
          sm="12"
          md="12"
          lg="12"
          v-if="hasCartography"
          class="py-4"
          ref="nextcloud"
        >
          <v-card>
            <v-card-title class="mx-0">{{
              $t("Uploaded Cartograhpy Files")
            }}</v-card-title>

            <NextcloudMirror
              :items="nextcloudLs"
              @refresh="onRefreshNextcloud"
            ></NextcloudMirror>
          </v-card>
        </v-col>

        <!-- Payments -->
        <v-col
          sm="12"
          md="12"
          lg="12"
          v-if="hasPayments"
          class="py-4"
          ref="payments"
        >
          <VTable
            v-if="record.code === 7 || record === 8"
            :title="$t('Payments')"
            :height="null"
            :headers="paymentsHeader"
            :data.sync="payments"
            hideFooter
            @download="onDownload"
          ></VTable>

          <VTable
            v-else-if="record.code === 2 || record.code === 4"
            :title="$t('Homologation Conditions Setted')"
            :height="null"
            :headers="setConditionsHeader"
            :data.sync="payments"
            hideFooter
          ></VTable>

          <VTable
            v-else-if="record.code === 5"
            :title="$t('Homologation Conditions Reviewed')"
            :height="null"
            :headers="acceptConditionsHeader"
            :data.sync="payments"
            hideFooter
          ></VTable>

          <VTable
            v-if="record.code === 6"
            :title="$t('Invoice Issue')"
            :height="null"
            :headers="emitInvoiceHeader"
            :data.sync="payments"
            hideFooter
          ></VTable>
        </v-col>

        <!-- Evaluations -->
        <v-col
          sm="12"
          md="12"
          lg="12"
          v-if="hasEvaluations"
          class="py-4"
          ref="evaluations"
        >
          <VTable
            :title="$t('Homologation Result')"
            :height="null"
            :headers="evaluationsHeaders"
            :data.sync="evaluations"
            hideFooter
          ></VTable>
        </v-col>

        <!-- Suspensions -->
        <v-col
          sm="12"
          md="12"
          lg="12"
          v-if="hasSuspensions"
          class="py-4"
          ref="suspensions"
        >
          <VTable
            :title="$t('Processing Interruptions')"
            :height="null"
            :headers="suspensionHeader"
            :data.sync="record.suspensions"
            hideFooter
          ></VTable>
        </v-col>

        <!-- Request Changes -->
        <v-col
          sm="12"
          md="12"
          lg="12"
          v-if="hasRequestChanges"
          class="py-4"
          ref="requestmodifications"
        >
          <VTable
            :title="$t('Request Property Changes')"
            :height="null"
            :headers="requestChangesHeader"
            :data.sync="requestChanges"
            hideFooter
          ></VTable>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions
      class="py-4 px-10 fixed-card-footer elevation-1 d-flex justify-end"
      style="z-index: 10"
    >
      <v-spacer></v-spacer>
      <v-btn width="150" outlined color="primary" @click="onClose">{{
        $t("Close")
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import VTable from "@/components/tables/basic.vue";
import DisplayField from "@/components/forms/fields/display.vue";
import State from "@/layouts/client/dgt/pdh/custom/symbology/state-icon2.vue";
import VMap from "@/layouts/client/dgt/pdh/homologation/details/map.vue";
import NextcloudMirror from "@/layouts/client/dgt/pdh/custom/nextcloudMirror.vue";

export default {
  components: {
    VTable,
    DisplayField,
    State,
    VMap,
    NextcloudMirror,
  },

  props: {
    record: {
      type: Object,
      default: function () {
        return {
          id: null,
        };
      },
    },

    previousState: {
      type: Object,
      default: function () {
        return {
          id: null,
        };
      },
    },
  },

  data() {
    return {
      invoiceStates: [5, 6],

      hasDocuments: false,
      hasCartography: false,
      hasEvaluations: true,
      hasPayments: true,
      // hasModifications: false,

      observations: "",

      summaryHeader: [
        {
          text: this.$t("Tarefa"),
          value: "task",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Conclusion"),
          value: "conclusion",
          sortable: false,
        },
        {
          text: this.$t("Number"),
          value: "number",
          sortable: false,
        },
        {
          text: this.$t("Implica Ciclo de Correção"),
          value: "requires_correction",
          sortable: false,
          renderer: {
            type: "simple",
            value: "requires_correction",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
        },
        {
          text: this.$t("Jump To"),
          value: "jump",
          renderer: {
            type: "action",
            event: "goto",
            icon: "mdi-debug-step-over",
          },
          sortable: false,
        },
      ],

      documentsHeader: [
        {
          text: this.$t("Document Designation"),
          value: "description",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Upload Date"),
          value: "creation_date",
          renderer: {
            type: "simple",
            value: "creation_date",
            fn: function (value) {
              return value ? value.split("T")[0] : "";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("File Version"),
          value: "version",
          sortable: false,
        },
        {
          text: this.$t("File Name"),
          value: "original_name",
          sortable: false,
        },
        {
          text: this.$t("Digitally Signed"),
          value: "signed",
          sortable: false,
          renderer: {
            type: "simple",
            value: "signed",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("Signatory"),
          value: "signer_name",
          hide: true,
          sortable: false,
          renderer: {
            type: "simple",
            value: "signer_name",
            fn: function (value) {
              return value ? value : "Sem signatário";
            },
          },
        },
        {
          text: this.$t("Download"),
          value: "download",
          sortable: false,
          renderer: {
            type: "action",
            event: "download",
            icon: "mdi-download",
          },
          sortable: false,
        },
      ],
      reviewedDocumentsHeader: [
        {
          text: this.$t("Document Designation"),
          value: "description",
          align: "left",
          sortable: false,
        },
        // {
        //   text: this.$t("Mandatory"),
        //   value: "mandatory",
        //   sortable: false,
        //   renderer: {
        //     type: "simple",
        //     value: "mandatory",
        //     fn: function (value) {
        //       return value ? "Sim" : "Não";
        //     },
        //   },
        // },
        {
          text: this.$t("Upload Date"),
          value: "creation_date",
          sortable: false,
          renderer: {
            type: "simple",
            value: "creation_date",

            fn: function (value) {
              return value ? value.split("T")[0] : "";
            },
          },
        },
        {
          text: this.$t("File Version"),
          value: "version",
          sortable: false,
        },
        {
          text: this.$t("File Name"),
          value: "original_name",
          sortable: false,
        },
        {
          text: this.$t("Digitally Signed"),
          value: "signed",
          sortable: false,
          renderer: {
            type: "simple",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("Signatory"),
          value: "signer_name",
          sortable: false,
          hide: true,
          renderer: {
            type: "simple",
            value: "signer_name",
            fn: function (value) {
              return !value || value.length === 0 ? "Sem signatário" : value;
            },
          },
        },
        {
          text: this.$t("According"),
          value: "invalid",
          sortable: false,
          renderer: {
            type: "icon",
            value: "invalid",
            fn: function (value) {
              return value ? "mdi-close" : "mdi-check";
            },
            colorFn: function (value) {
              return value ? "red" : "primary";
            },
          },
        },
        {
          text: this.$t("Download"),
          value: "download",
          sortable: false,
          renderer: {
            type: "action",
            event: "download",
            icon: "mdi-download",
            color: "primary",
          },
        },
      ],
      paymentsHeader: [
        {
          text: this.$t("Document Designation"),
          value: "description",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("File Name"),
          value: "original_name",
          sortable: false,
        },
        {
          text: this.$t("Value"),
          value: "value",
          renderer: {
            type: "simple",
            value: "value",
            fn: function (value) {
              const isFloating = value && value.indexOf(".") > -1;
              const parsed = isFloating ? value.replace(".", ",") : value;

              return parsed + " €";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("Emittion Date"),
          value: "emitted_date",
          renderer: {
            type: "simple",
            value: "emitted_date",
            fn: function (value) {
              return value ? value.split("T")[0] : "";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("Paid Date"),
          value: "paid_date",
          renderer: {
            type: "simple",
            value: "paid_date",
            fn: function (value) {
              return value ? value.split("T")[0] : "";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("Invoice Proof"),
          value: "download",
          renderer: {
            type: "action",
            event: "download",
            icon: "mdi-download",
            disabler: function (item) {
              return !item.document_id;
            },
          },
        },
      ],
      evaluationsHeaders: [
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
          sortable: false,
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
          sortable: false,
        },
        {
          text: this.$t("Consistency Percentage"),
          value: "percentage_errors",
          renderer: {
            type: "simple",
            value: "percentage_errors",
            fn: function (value) {
              const isFloating = value && value.indexOf(".") > -1;
              const parsed = isFloating ? value.replace(".", ",") : value;

              return parsed ? parsed + " %" : "-";
            },
          },
          sortable: false,
        },
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
          sortable: false,
        },
        // {
        //   text: this.$t("Observações"),
        //   value: "action",
        //   renderer: {
        //     type: "action",
        //     event: "obs",
        //     icon: "mdi-magnify",
        //   },
        // },
      ],
      setConditionsHeader: [
        {
          text: this.$t("Description"),
          value: "placeholder",
          align: "left",
          sortable: false,
          renderer: {
            type: "simple",
            fn: function () {
              return "Taxa de Homologação";
            },
          },
        },
        {
          text: this.$t("Value"),
          value: "value",
          renderer: {
            type: "simple",
            value: "value",
            fn: function (value) {
              const isFloating = value && value.indexOf(".") > -1;
              const parsed = isFloating ? value.replace(".", ",") : value;

              return parsed + " €";
            },
          },
          sortable: false,
        },
      ],
      acceptConditionsHeader: [
        {
          text: this.$t("Description"),
          value: "description_placeholder",
          align: "left",
          sortable: false,
          renderer: {
            type: "simple",
            value: "placeholder",
            fn: function () {
              return "Taxa de Homologação";
            },
          },
        },
        {
          text: this.$t("Value"),
          value: "value",
          renderer: {
            type: "simple",
            value: "value",
            fn: function (value) {
              const isFloating = value && value.indexOf(".") > -1;
              const parsed = isFloating ? value.replace(".", ",") : value;

              return parsed + " €";
            },
          },
          sortable: false,
        },
        // {
        //   text: this.$t("Emitted Date"),
        //   value: "emitted_date",
        // },
        {
          text: this.$t("Taxa de Homologação Aceite"),
          value: "applicant_accepted",
          renderer: {
            type: "simple",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
        },
      ],
      emitInvoiceHeader: [
        {
          text: this.$t("Description"),
          value: "placeholder",
          align: "left",
          sortable: false,
          renderer: {
            type: "simple",
            fn: function () {
              return "Taxa de Homologação";
            },
          },
        },
        {
          text: this.$t("Value"),
          value: "value",
          renderer: {
            type: "simple",
            value: "value",
            fn: function (value) {
              const isFloating = value && value.indexOf(".") > -1;
              const parsed = isFloating ? value.replace(".", ",") : value;

              return parsed + " €";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("Emitted Date"),
          value: "emitted_date",
        },
      ],
      suspensionHeader: [
        {
          text: this.$t("Start Date"),
          value: "start_date",
          sortable: false,
          renderer: {
            type: "simple",
            value: "start_date",
            fn: function (v) {
              return v ? v.split("T")[0] : "";
            },
          },
        },
        {
          text: this.$t("End Date"),
          value: "end_date",
          sortable: false,
          renderer: {
            type: "simple",
            value: "end_date",
            fn: function (v) {
              return v ? v.split("T")[0] : "";
            },
          },
        },
        {
          text: this.$t("Duration"),
          value: "duration",
          sortable: false,
          renderer: {
            type: "simple",
            value: "duration",
            fn: function (v) {
              if (v <= 1) {
                return "Menos de um dia";
              } else {
                return v + " dias";
              }
            },
          },
        },
      ],
      requestChangesHeader: [
        {
          text: this.$t("Description"),
          value: "observations",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Modification Date"),
          value: "start_date",
          sortable: false,
          renderer: {
            type: "simple",
            value: "start_date",
            fn: function (v) {
              return v ? v.split("T")[0] : "";
            },
          },
        },
      ],

      documents: [],
      cartography: null,
      nextcloudLs: [
        {
          name: this.$t("Root"),
          children: [],
          isDirectory: true,
          loading: false,
          open: true,
        },
      ],
      payments: [],
      evaluations: [],
      summary: [],
    };
  },

  created: async function () {
    if (process.client) {
      const store = this.$store.$db().model("EvaluationTypes");

      store.api().read({ once: true });

      const user = this.$auth.user;

      if (user && user.group_id !== 2) {
        this.evaluationsHeaders.push({
          text: this.$t("Budget (€)"),
          value: "budget",
          sortable: false,
          renderer: {
            type: "simple",
            value: "budget",
            fn: function (value) {
              const isFloating = value && value.indexOf(".") > -1;
              const parsed = isFloating ? value.replace(".", ",") : value;

              return parsed ? parsed + " €" : "-";
            },
          },
        });
      }
    }

    await this.requestHistory();
  },

  methods: {
    requestHistory: async function () {
      const record = this.record;

      this.hasDocuments = false;
      this.hasCartography = false;
      this.hasEvaluations = false;
      this.hasPayments = false;

      this.$store.commit("SET_LOADING", true);

      const stateObservations = this.record.observations;

      this.observations =
        stateObservations && stateObservations.length
          ? stateObservations
          : this.$t("No relevant observations.");

      // Documents
      const documents = await this.requestDocuments(record);
      // Cartography
      const cartography = await this.requestCartography(record);

      let nextcloudRoot = this.nextcloudLs[0];
      let nextcloudChildren = [];

      // Nextcloud
      if (cartography) {
        nextcloudRoot.loading = true;

        nextcloudChildren = await this.requestLsNextcloud(record, cartography);

        nextcloudRoot.children = nextcloudChildren;

        nextcloudRoot.loading = false;
      } else {
        nextcloudRoot.children = [];
      }

      // Payments
      const payments = await this.requestPayments(record);

      // Evaluations
      const evaluations = await this.requestEvaluations(record);

      this.documents = documents;
      this.cartography = cartography;
      this.payments = payments;
      this.evaluations = evaluations;

      this.summary = this.generateSummary();

      this.hasDocuments = !!documents.length;
      this.hasCartography = !!cartography;
      this.hasEvaluations = !!evaluations.length;
      this.hasPayments = !!payments.length;

      this.$store.commit("SET_LOADING", false);
    },

    requestDocuments: async function (record) {
      try {
        const requestId = record.request_id;

        let stateId = record.id;

        if (record.intervening && this.previousState) {
          stateId = this.previousState.id;
        }

        const result = await this.$axios.post(
          "/api/homologation/document/getallversions",
          {
            requestId: requestId,
            stateId: record.code === 50 ? null : stateId,
            beforeCode: record.code === 50 ? 50 : null,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }

      return [];
    },

    requestCartography: async function (record) {
      try {
        const requestId = record.request_id;

        let stateId = record.id;

        if (record.intervening && this.previousState) {
          stateId = this.previousState.id;
        }

        const url =
          record.code === 50
            ? "/api/homologation/cartography/get"
            : "/api/homologation/cartography/getallversions";

        const params =
          record.code === 50
            ? {
                requestId: requestId,
              }
            : {
                requestId: requestId,
                stateId: stateId,
              };

        const result = await this.$axios.post(url, params);

        if (result.error) {
          throw result.error;
        }

        return result.data[0];
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }

      return {};
    },

    requestLsNextcloud: async function (record, cartography) {
      const id = record.request_id;
      const version = cartography.version;
      const vectorial = cartography.vectorial;

      try {
        const result = await this.$axios.post(
          "/api/homologation/cartography/ls",
          {
            requestId: id,
            version: version,
            vectorial: vectorial,
          }
        );

        if (result.error) {
          throw error;
        }

        return result.data;
      } catch (e) {
        return [];
      }
    },

    requestEvaluations: async function (record) {
      try {
        const requestId = record.request_id;
        const stateId = record.id;

        const result = await this.$axios.post(
          "/api/homologation/evaluation/getall",
          {
            requestId: requestId,
            stateId: stateId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }

      return [];
    },

    requestPayments: async function (record) {
      try {
        const requestId = record.request_id;
        let stateId =
          (record.code === 5 || record.code === 8) && this.previousState
            ? this.previousState.id
            : record.id;

        const result = await this.$axios.post(
          "/api/homologation/receipt/getdocuments",
          {
            requestId: requestId,
            stateId: stateId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        for (let i = 0; i < result.data.length; i++) {
          const row = result.data[i];

          if (row.creation_date) {
            row.creation_date = row.creation_date.split("T")[0];
          }

          if (row.emitted_date) {
            row.emitted_date = row.emitted_date.split("T")[0];
          }

          if (row.paid_date) {
            row.paid_date = row.paid_date.split("T")[0];
          }
        }

        return result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }

      return [];
    },

    generateSummary: function () {
      const summary = [];

      const isEvaluation = !!this.record.intervening;

      const documents = this.documents;
      const cartography = this.cartography;
      const payments = this.payments;
      const evaluations = this.evaluations;
      const suspensions = this.record.suspensions;
      const regimes = this.record.regimetypes;
      const htypes = this.record.homologationtypes;

      let task,
        conclusion,
        number,
        requires_correction = false;

      /**
       * DOCUMENTS
       */
      if (documents.length) {
        // Evaluation
        if (isEvaluation) {
          task = this.$t("Documents Reviewing");

          const invalidMap = {};

          documents.forEach(function (doc) {
            if (invalidMap.hasOwnProperty(doc.type)) {
              const entry = invalidMap[doc.type];

              // Update version/invalid
              if (entry.version < doc.version) {
                entry.invalid = doc.invalid;
                entry.version = doc.version;
              }
            } else {
              invalidMap[doc.type] = {
                invalid: doc.invalid,
                version: doc.version,
              };
            }
          });

          let invalidDocuments = 0;
          let validDocuments = 0;

          for (let imap in invalidMap) {
            if (invalidMap[imap].invalid) {
              invalidDocuments++;
            } else {
              validDocuments++;
            }
          }
          // const invalidDocuments = documents.reduce(function (acc, curr) {
          //   return curr.invalid ? acc + 1 : acc;
          // }, 0);

          conclusion =
            invalidDocuments === 0
              ? this.$t("Documentos Conforme")
              : this.$t("Alguns Documentos Não Conforme");
          number = invalidDocuments === 0 ? validDocuments : invalidDocuments;
          requires_correction = invalidDocuments !== 0;
        } else {
          // Not Evaluation
          task = this.$t("Documents Upload");
          conclusion = this.$t("Documents Uploaded");
          number = documents.reduce(function (acc, curr) {
            return acc + 1;
          }, 0);
          requires_correction = false;
        }

        summary.push({
          task: task,
          conclusion: conclusion,
          number: number,
          requires_correction: requires_correction,
          ref: "documents",
        });
      }

      /**
       * Cartography
       */
      if (cartography) {
        task = null;
        conclusion = null;
        number = null;
        requires_correction = false;

        // Evaluation
        if (isEvaluation) {
          task = this.$t("Cartography Reviewing");
          conclusion =
            cartography.invalid === 0
              ? this.$t("Cartografia Conforme")
              : this.$t("Cartografia Não Conforme");
          number = 1;
          requires_correction = cartography.invalid;
        } else {
          // Not Evaluation
          task = this.$t("Cartography Upload");
          conclusion = this.$t("Cartography Uploaded");
          number = 1;
          requires_correction = false;
        }

        summary.push({
          task: task,
          conclusion: conclusion,
          number: number,
          requires_correction: requires_correction,
          ref: "cartography",
        });
      }

      /**
       * Payments
       */
      const code = this.record.code;

      if (payments.length && code !== 8) {
        task = null;
        conclusion = null;
        number = null;
        requires_correction = false;

        switch (code) {
          case 2:
          case 4:
            task = this.$t("Set Homologation Conditions");
            conclusion = this.$t("Conditions Setted");
            number = 1;
            requires_correction = false;
            break;
          case 5:
            task = this.$t("Review Homologation Conditions");
            conclusion = this.$t("Homologation Conditions Accepted");
            number = 1;
            requires_correction = false;
            break;
          case 6:
            task = this.$t("Homologation Invoice Issue");
            conclusion = this.$t("Invoice Emitted");
            number = 1;
            requires_correction = false;
            break;
          case 7:
            task = this.$t("Homologation Tax Payment");
            conclusion = this.$t("Tax Paid");
            number = 1;
            requires_correction = false;
            break;
          // case 8:
          //   task = this.$t("Review Payment Proof");

          //   break;
          // case 9:
          //   task = this.$t("Upload valid payment proof");
          //   break;
        }

        summary.push({
          task: task,
          conclusion: conclusion,
          number: number,
          requires_correction: requires_correction,
          ref: "payments",
        });
      }

      /**
       * Evaluations
       */
      if (evaluations.length) {
        task = null;
        conclusion = null;
        number = null;
        requires_correction = false;

        // Evaluation
        if (isEvaluation) {
          task = this.$t("Homologação");

          const invalidEvaluations = evaluations.reduce(function (acc, curr) {
            if (curr.accordingly === "2" || curr.accordingly === "0") {
              return acc;
            } else {
              return acc + 1; //curr.percentage_accepted ? acc : acc + 1;
            }
          }, 0);

          conclusion =
            invalidEvaluations === 0
              ? this.$t("Homologação Conforme")
              : this.$t("Homologação Não Conforme");
          number =
            invalidEvaluations === 0 ? evaluations.length : invalidEvaluations;
          requires_correction = !!invalidEvaluations;
        } else {
          // Not Evaluation
          task = this.$t("Consulta da Homologação");
          conclusion = this.$t("Homologação Consultada");
          number = evaluations.length;
          requires_correction = false;
        }

        summary.push({
          task: task,
          conclusion: conclusion,
          number: number,
          requires_correction: requires_correction,
          ref: "evaluations",
        });
      }

      /**
       * Suspensions
       */

      if (suspensions && suspensions.length) {
        task = null;
        conclusion = null;
        number = null;
        requires_correction = false;

        const interruptions = suspensions.length;
        conclusion =
          this.hadSuspensionsText && this.daysSuspensionText
            ? this.hadSuspensionsText +
              " " +
              this.$t("for") +
              " " +
              this.daysSuspensionText.toLowerCase()
            : "";

        summary.push({
          task: this.$t("Processing Interruption"),
          conclusion: conclusion,
          number: suspensions.length,
          requires_correction: false,
          ref: "suspensions",
        });
      }

      if (regimes && regimes.length) {
        task = null;
        conclusion = null;
        number = null;
        requires_correction = false;

        const lastRegime = regimes[regimes.length - 1];

        conclusion = lastRegime.observations;

        summary.push({
          task: this.$t("Homologation Regime Modification"),
          conclusion: conclusion,
          number: regimes.length,
          requires_correction: false,
          ref: "requestmodifications",
        });
      }

      if (htypes && htypes.length) {
        task = null;
        conclusion = null;
        number = null;
        requires_correction = false;

        const lastType = htypes[htypes.length - 1];

        conclusion = lastType.observations;

        summary.push({
          task: this.$t("Homologation Type Modification"),
          conclusion: conclusion,
          number: htypes.length,
          requires_correction: false,
          ref: "requestmodifications",
        });
      }

      return summary;
    },

    onRefreshNextcloud: async function () {
      const record = this.record;
      const cartography = this.cartography;

      let nextcloudRoot = this.nextcloudLs[0];
      let nextcloudChildren = [];

      // Nextcloud
      if (cartography) {
        nextcloudRoot.loading = true;

        nextcloudChildren = await this.requestLsNextcloud(record, cartography);

        nextcloudRoot.children = nextcloudChildren;

        nextcloudRoot.loading = false;
      } else {
        nextcloudRoot.children = [];
      }
    },

    onDownload: async function (item) {
      const documentId = item.hasOwnProperty("document_id")
        ? item.document_id
        : item.id;

      try {
        const requestId = this.record.request_id;

        const result = await this.$axios.post(
          "/api/homologation/document/download",
          {
            documentId: documentId,
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

    onGoTo: function (item) {
      const ref = item.ref;

      const cmp = this.$refs[ref];
      const body = this.$refs["formbody"];

      if (cmp.scrollIntoView) {
        cmp.scrollIntoView();
      } else {
        const scrollHeight = params.scrollHeight;

        body.scrollTop = scrollHeight;
      }
    },

    onClose: function () {
      this.$emit("close");
    },
  },

  computed: {
    isEvaluation: function () {
      return !!this.record.intervening;
    },

    hasSuspensions: function () {
      return (
        this.record.hasOwnProperty("suspensions") &&
        this.record.suspensions.length
      );
    },

    hasRequestChanges: function () {
      const hasTypeChanges =
        this.record.hasOwnProperty("homologationtypes") &&
        this.record.homologationtypes.length;
      const hasRegimeChanges =
        this.record.hasOwnProperty("regimetypes") &&
        this.record.regimetypes.length;

      return hasTypeChanges || hasRegimeChanges;
    },

    requestChanges: function () {
      const htypes = this.record.homologationtypes;
      const regimes = this.record.regimetypes;

      const hasRegimeChanges = regimes && regimes.length;
      const hasTypeChanges = htypes && htypes.length;

      if (!hasRegimeChanges && !hasTypeChanges) {
        return [];
      }

      if (hasTypeChanges && hasRegimeChanges) {
        return htypes.concat(regimes);
      }

      if (hasTypeChanges) {
        return htypes;
      }

      if (hasTypeChanges && hasRegimeChanges) {
        return regimes;
      }

      return [];
    },

    hadSuspensionsText: function () {
      const record = this.record;

      const suspensions = record.suspensions;

      if (!suspensions) {
        return null;
      }

      const len = suspensions.length;

      return (
        len +
        " " +
        (len === 1 ? this.$t("interruption") : this.$t("interruptions"))
      );
    },

    daysSuspensionText: function () {
      const record = this.record;

      const suspensions = record.suspensions;

      if (!suspensions) {
        return null;
      }

      // COunt days
      const days = suspensions.reduce(function (acc, curr) {
        return curr.duration ? acc + curr.duration : acc;
      }, 0);

      if (days <= 1) {
        return this.$t("Less than a day");
      } else {
        return days + " " + this.$t("days");
      }
    },
  },

  watch: {
    "record.id": function (newId, oldId) {
      if (oldId !== null) {
        this.requestHistory();
      }
    },
  },
};
</script>
<style scoped>
</style>