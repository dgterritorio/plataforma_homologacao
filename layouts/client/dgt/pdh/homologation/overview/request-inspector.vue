<template>
  <v-row>
    <v-col>
      <client-only>
        <Details
          :record="record"
          :panels="detailPanels"
          @back="onGoBack"
        ></Details>
      </client-only>
    </v-col>
  </v-row>
</template>

<script>
import Details from "@/components/cards/details.vue";
import RequestInfo from "@/layouts/client/dgt/pdh/homologation/details/request.vue";
import ApplicantInfo from "@/layouts/client/dgt/pdh/homologation/details/applicant.vue";
import EntitiesInfo from "@/layouts/client/dgt/pdh/homologation/details/entities.vue";
import OwnerInfo from "@/layouts/client/dgt/pdh/homologation/details/owner.vue";
import ProductInfo from "@/layouts/client/dgt/pdh/homologation/details/product.vue";
import DocumentsInfo from "@/layouts/client/dgt/pdh/homologation/details/documents.vue";
import PaymentsInfo from "@/layouts/client/dgt/pdh/homologation/details/payments.vue";
import EvaluatorsInfo from "@/layouts/client/dgt/pdh/homologation/details/evaluators.vue";
import EvaluationsInfo from "@/layouts/client/dgt/pdh/homologation/details/evaluations.vue";
import ManageState from "@/layouts/client/dgt/pdh/homologation/details/manage-evaluator.vue";
import TramitationHistory from "@/layouts/client/dgt/pdh/homologation/details/history.vue";

export default {
  name: "EvaluatorRequest",

  components: {
    Details,
    ProductInfo,
    TramitationHistory,
    ApplicantInfo,
    EntitiesInfo,
    OwnerInfo,
    DocumentsInfo,
    PaymentsInfo,
    EvaluatorsInfo,
    EvaluationsInfo,
    ManageState,
  },

  data() {
    return {
      detailPanels: [
        {
          type: "subheader",
          title: this.$t("Details"),
        },
        {
          type: "cmp",
          title: this.$t("Request"),
          icon: "mdi-card-text-outline",
          cmp: RequestInfo,
        },
        {
          type: "cmp",
          title: this.$t("Applicant"),
          icon: "mdi-account",
          cmp: ApplicantInfo,
        },
        {
          type: "cmp",
          title: this.$t("Owner"),
          icon: "mdi-account-network",
          cmp: OwnerInfo,
        },
        {
          type: "cmp",
          title: this.$t("Entities"),
          icon: "mdi-account-group",
          cmp: EntitiesInfo,
        },
        {
          type: "cmp",
          title: this.$t("Product"),
          icon: "mdi-map",
          cmp: ProductInfo,
        },

        // {
        //   type: "divider",
        // },
        // {
        //   type: "subheader",
        //   title: this.$t("Tramitation"),
        // },
        // {
        //   type: "cmp",
        //   title: this.$t("Manage"),
        //   icon: "mdi-file-document-edit-outline",
        //   cmp: ManageState,
        // },
        // {
        //   type: "cmp",
        //   title: this.$t("Documents"),
        //   icon: "mdi-file-document",
        //   cmp: DocumentsInfo,
        // },
        // {
        //   type: "cmp",
        //   title: this.$t("Payments"),
        //   icon: "mdi-currency-eur",
        //   cmp: PaymentsInfo,
        // },
        // {
        //   type: "cmp",
        //   title: this.$t("Evaluators"),
        //   icon: "mdi-account-network",
        //   cmp: EvaluatorsInfo,
        // },
        // {
        //   type: "cmp",
        //   title: this.$t("Evaluations"),
        //   icon: "mdi-form-select",
        //   cmp: EvaluationsInfo,
        // },
        // {
        //   type: "cmp",
        //   title: this.$t("History"),
        //   icon: "mdi-history",
        //   cmp: TramitationHistory,
        // },
        {
          type: "divider",
        },
        {
          type: "subheader",
          title: this.$t("Tramitation"),
        },
        {
          type: "cmp",
          title: this.$t("Documents"),
          icon: "mdi-file-document",
          cmp: DocumentsInfo,
        },
        {
          type: "cmp",
          title: this.$t("Expenses"),
          icon: "mdi-currency-eur",
          cmp: PaymentsInfo,
        },
        {
          type: "cmp",
          title: this.$t("Evaluators"),
          icon: "mdi-account-network",
          cmp: EvaluatorsInfo,
        },
        {
          type: "cmp",
          title: this.$t("Evaluations"),
          icon: "mdi-form-select",
          cmp: EvaluationsInfo,
        },
        {
          type: "cmp",
          title: this.$t("History"),
          icon: "mdi-history",
          cmp: TramitationHistory,
        },
        {
          type: "divider",
        },
        {
          type: "event",
          title: "Voltar",
          icon: "mdi-subdirectory-arrow-left",
          color: "red",
          event: "back",
        },
      ],

      record: {
        request: {},
        states: [],
        cartography: {},
        documents: [],
        producers: [],
        applicant: {},
        supervisor: {},
        entities: [],
        entity_members: [],
        payments: [],
        evaluators: [],
        evaluations: [],
        owner: {},
      },

      requestsStore: null,
    };
  },

  created: async function () {
    try {
      this.stateTypesStore = this.$store.$db().model("HomologationStateTypes");
      this.requestsStore = this.$store.$db().model("HomologationRequests");

      if (process.client) {
        const isLoaded = this.stateTypesStore.store().state.entities[
          "HomologationStateTypes"
        ].loaded;

        if (!isLoaded) {
          this.stateTypesStore.api().read();
        }

        const requestId = this.$route.params.id;

        await this.findRequest(requestId);
      }
    } catch (e) {
      // console.log("EEOR ", e);
    }
  },

  methods: {
    findRequest: async function (id, refresh) {
      const store = this.requestsStore;

      if (!store) {
        return;
      }

      let record = store.find(id);

      if (!record || refresh) {
        await store.api().read({
          clear: !refresh,
          forceReload: true,
          filters: [{ operator: "eq", property: "id", value: id }],
        });

        record = store.find(id);
      }

      if (!record) {
        this.$router.push("/404");

        return;
      }

      this.record.request = record;

      await this.requestInfo(this.record);
    },

    requestStates: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/state/getall",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.states = result.data;
      } catch (e) {
        // console.log("Error on fetching request states", e);
      }
    },

    requestCartography: async function (record) {
      try {
        const requestId = record.request.id;
        const vectorial = record.request.vectorial;

        const result = await this.$axios.post(
          "/api/homologation/cartography/get",
          {
            requestId: requestId,
            vectorial: vectorial,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.cartography = result.data[0];
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestApplicant: async function (record) {
      try {
        const applicantId = record.request.applicant_id;
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/applicant/get",
          {
            applicantId: applicantId,
            requestId: requestId
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.applicant = result.data[0];
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestProducers: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post("/api/request/producers/get", {
          requestId: requestId,
        });

        if (result.error) {
          throw result.error;
        }

        this.record.producers = result.data[0];
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestDocuments: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/document/getall",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.documents = result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestEntities: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/entities/get",
          {
            id: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.entities = result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestMembers: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/entities/getmembers",
          {
            id: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.entity_members = result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestPayments: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/receipt/getdocuments",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.payments = result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestEvaluators: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/evaluators/getall",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.evaluators = result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestEvaluations: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/evaluation/getall",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.evaluations = result.data;
      } catch (e) {
        // console.log("Error on fetching request cartography", e);
      }
    },

    requestOwner: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post("/api/homologation/owner/get", {
          requestId: requestId,
        });

        if (result.error) {
          throw result.error;
        }

        this.record.owner = result.data[0];
      } catch (e) {
        console.log("Error on fetching request cartography");
      }
    },

    requestInfo: async function (record) {
      await this.requestStates(record);

      await this.requestCartography(record);

      await this.requestApplicant(record);

      await this.requestDocuments(record);

      await this.requestEntities(record);

      await this.requestMembers(record);

      await this.requestPayments(record);

      await this.requestEvaluators(record);

      await this.requestEvaluations(record);

      await this.requestOwner(record);
    },

    onGoBack: function () {
      this.$router.push("/homologation/list-inspector");
    },
  },

  watch: {
    "record.request.code": async function (code, oldCode) {
      if (!oldCode || code === oldCode) {
        return;
      }

      const requestId = this.$route.params.id;

      await this.findRequest(requestId, true);
    },
  },
};
</script>
</script>