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
import EntitiesInfo from "@/layouts/client/dgt/pdh/homologation/details/entities.vue";
import OwnerInfo from "@/layouts/client/dgt/pdh/homologation/details/owner.vue";
import ProductInfo from "@/layouts/client/dgt/pdh/homologation/details/product.vue";
import DocumentsInfo from "@/layouts/client/dgt/pdh/homologation/details/documents.vue";
import ManageState from "@/layouts/client/dgt/pdh/homologation/details/manage-applicant.vue";
import TramitationHistory from "@/layouts/client/dgt/pdh/homologation/details/history.vue";

export default {
  name: "EvaluatorRequest",

  components: {
    Details,
    ProductInfo,
    TramitationHistory,
    EntitiesInfo,
    OwnerInfo,
    DocumentsInfo,
    ManageState,
  },

  data() {
    return {
      detailPanels: [
        {
          type: "subheader",
          title: "Details",
        },
        {
          type: "cmp",
          title: "Request",
          icon: "mdi-card-text-outline",
          cmp: RequestInfo,
        },
        {
          type: "cmp",
          title: "Entities",
          icon: "mdi-account-group",
          cmp: EntitiesInfo,
        },
        {
          type: "cmp",
          title: this.$t("Owner"),
          icon: "mdi-account-network",
          cmp: OwnerInfo,
        },
        {
          type: "cmp",
          title: "Product",
          icon: "mdi-map",
          cmp: ProductInfo,
        },

        {
          type: "divider",
        },
        {
          type: "subheader",
          title: "Tramitation",
        },
        {
          type: "cmp",
          title: "Details",
          icon: "mdi-file-document-edit-outline",
          cmp: ManageState,
        },
        {
          type: "cmp",
          title: "Documents",
          icon: "mdi-file-document",
          cmp: DocumentsInfo,
        },
        {
          type: "cmp",
          title: "History",
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
        supervisor: {},
        entities: [],
        entity_members: [],
        owner: {},
      },

      stateTypesStore: null,
      requestsStore: null,
    };
  },

  created: async function () {
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
        const result = await this.$axios.post(
          "/api/homologation/state/getall",
          {
            requestId: record.request.id,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.record.states = result.data;
      } catch (e) {
        console.log("Error on fetching request states");
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
        console.log("Error on fetching request cartography");
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
        console.log("Error on fetching request cartography");
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
        console.log("Error on fetching request cartography");
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
        console.log("Error on fetching request cartography");
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
        console.log("Error on fetching request cartography");
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

      await this.requestDocuments(record);

      await this.requestEntities(record);

      await this.requestMembers(record);

      await this.requestOwner(record);
    },

    onGoBack: function () {
      this.$router.push("/homologation/list");
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

<style>
.ho {
  overflow: hidden;
}
</style>
