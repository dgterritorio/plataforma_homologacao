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
import RequestInfo from "@/layouts/client/dgt/pdh/producers/details/request.vue";
import ContactsInfo from "@/layouts/client/dgt/pdh/producers/details/contacts.vue";
import StaffInfo from "@/layouts/client/dgt/pdh/producers/details/staff.vue";
import ActivitiesInfo from "@/layouts/client/dgt/pdh/producers/details/activities.vue";
import EquipmentsInfo from "@/layouts/client/dgt/pdh/producers/details/equipments.vue";
import DocumentsInfo from "@/layouts/client/dgt/pdh/producers/details/documents.vue";
import ManageState from "@/layouts/client/dgt/pdh/producers/details/manage.vue";
import TramitationHistory from "@/layouts/client/dgt/pdh/producers/details/history.vue";

export default {
  name: "EvaluatorRequest",

  components: {
    Details,
    RequestInfo,
    ContactsInfo,
    StaffInfo,
    ActivitiesInfo,
    EquipmentsInfo,
    // ProductInfo,
    // TramitationHistory,
    // ApplicantInfo,
    // EntitiesInfo,
    // DocumentsInfo,
    // PaymentsInfo,
    // EvaluationsInfo,
    // ManageState,
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
          title: this.$t("Contacts"),
          icon: "mdi-card-account-phone",
          cmp: ContactsInfo,
        },
        {
          type: "cmp",
          title: this.$t("Staff"),
          icon: "mdi-account-group",
          cmp: StaffInfo,
        },

        // {
        //   type: "cmp",
        //   title: this.$t("Activities"),
        //   icon: "mdi-map-plus",
        //   cmp: ActivitiesInfo,
        // },
        {
          type: "cmp",
          title: this.$t("Equipment"),
          icon: "mdi-hammer-wrench",
          cmp: EquipmentsInfo,
        },

        {
          type: "divider",
        },
        {
          type: "subheader",
          title: this.$t("Tramitation"),
        },
        {
          type: "cmp",
          title: this.$t("Manage"),
          icon: "mdi-file-document-edit-outline",
          cmp: ManageState,
        },
        {
          type: "cmp",
          title: this.$t("Documents"),
          icon: "mdi-file-document",
          cmp: DocumentsInfo,
        },
        // {
        //   type: "cmp",
        //   title: this.$t("Payments"),
        //   icon: "mdi-currency-eur",
        //   cmp: PaymentsInfo,
        // },
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
        request: {
          must_intervene: null,
        },
        contacts: {},
        states: [],
        staff: [],
        activities: [],
        equipment: [],
        auth: {
          email: null,
          password: null,
        },
      },

      requestsStore: null,
    };
  },

  created: async function () {
    this.stateTypesStore = this.$store.$db().model("ProducerStateTypes");
    this.requestsStore = this.$store.$db().model("ProducerRequests");

    if (process.client) {
      const isLoaded = this.stateTypesStore.store().state.entities[
        "ProducerStateTypes"
      ].loaded;

      if (!isLoaded) {
        this.stateTypesStore.api().read();
      }

      const requestId = this.$route.params.id;

      await this.findRequest(requestId);
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

      if (!record.cpr_code) {
        record.cpr_code = "Sem Código";
      }

      // if (!record.obs) {
      //   record.obs = "Sem Observações";
      // }

      this.record.request = record;

      await this.requestInfo(this.record);
    },

    requestStates: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post("/api/producer/state/getall", {
          requestId: requestId,
        });

        if (result.error) {
          throw result.error;
        }

        this.record.states = result.data;
      } catch (e) {
        console.log("Error on fetching request states");
      }
    },

    requestStaff: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post("/api/producer/staff/get", {
          requestId: requestId,
        });

        if (result.error) {
          throw result.error;
        }

        this.record.staff = result.data;
      } catch (e) {
        console.log("Error on fetching request cartography");
      }
    },

    requestActivities: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post("/api/producer/activity/get", {
          requestId: requestId,
        });

        if (result.error) {
          throw result.error;
        }

        this.record.activities = result.data;
      } catch (e) {
        console.log("Error on fetching request cartography");
      }
    },

    requestEquipments: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post("/api/producer/equipment/get", {
          requestId: requestId,
        });

        if (result.error) {
          throw result.error;
        }

        this.record.equipments = result.data;
      } catch (e) {
        console.log("Error on fetching request cartography");
      }
    },

    requestDocuments: async function (record) {
      try {
        const requestId = record.request.id;

        const result = await this.$axios.post("/api/producer/document/getall", {
          requestId: requestId,
        });

        if (result.error) {
          throw result.error;
        }

        this.record.documents = result.data;
      } catch (e) {
        console.log("Error on fetching request cartography");
      }
    },

    requestInfo: async function (record) {
      await this.requestStates(record);

      await this.requestStaff(record);

      await this.requestActivities(record);

      await this.requestEquipments(record);

      await this.requestDocuments(record);
    },

    onGoBack: function () {
      this.$router.push("/producers/list");
    },
  },

  watch: {
    "record.request.code": async function (code, oldCode) {
      if (oldCode === undefined || code === oldCode) {
        return;
      }

      const requestId = this.$route.params.id;

      await this.findRequest(requestId, true);
    },
  },
};
</script>
</script>