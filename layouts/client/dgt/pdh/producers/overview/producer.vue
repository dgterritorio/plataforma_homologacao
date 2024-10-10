<template>
  <v-row align="center" justify="center">
    <v-col v-if="!loggedIn" sm="12" md="12" lg="12">
      <!-- <img alt :src="$p('/imgs/dgt-logo.png')" class="mb-12" />
    </v-col>
    <v-col sm="4" md="4" lg="4" v-if="!loggedIn" align-self="center">
      <v-row>
        <v-col>
          <v-text-field
            v-model="producer.email"
            name="email"
            label="Email"
            type="email"
            prepend-icon="mdi-email"
            :readonly="readonly"
          />

          <v-text-field
            v-model="producer.password"
            name="password"
            label="Password"
            type="password"
            prepend-icon="mdi-key"
            :readonly="readonly"
          />

          <v-btn
            class="my-4"
            block
            variant="primary"
            v-if="!readonly"
            @click="onClick"
          >{{ $t('Login') }}</v-btn>
        </v-col>
      </v-row>-->
    </v-col>

    <v-col v-else>
      <client-only>
        <Details :record="record" :panels="detailPanels"></Details>
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
import ManageState from "@/layouts/client/dgt/pdh/producers/details/producer-manage.vue";
import TramitationHistory from "@/layouts/client/dgt/pdh/producers/details/history.vue";

import sha1 from "crypto-js/sha1";

export default {
  name: "producer-cards",

  components: {
    Details,
    RequestInfo,
    ContactsInfo,
    StaffInfo,
    ActivitiesInfo,
    EquipmentsInfo,
    ManageState,
  },

  props: ["token"],

  data() {
    return {
      producer: {
        email: null,
        name: null,
        password: null,
      },

      record: {
        request: {},
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

      dialog: false,
      dialog2: false,
      error: false,

      readonly: false,
      color: "grey",
      stateStr: "",

      loggedIn: false,
      requestId: null,
      entityPassword: null,

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
        {
          type: "cmp",
          title: this.$t("History"),
          icon: "mdi-history",
          cmp: TramitationHistory,
        },
        // {
        //   type: "divider",
        // },
        // {
        //   type: "event",
        //   title: "Voltar",
        //   icon: "mdi-subdirectory-arrow-left",
        //   color: "red",
        //   event: "back",
        // },
      ],

      record: {
        request: {},
        contacts: {},
        states: [],
        staff: [],
        activities: [],
        equipment: [],
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

      const token = this.token;

      await this.findRequest(token);
    }
  },

  methods: {
    findRequest: async function (token, refresh) {
      const store = this.requestsStore;

      if (!store) {
        return;
      }

      let record;
      let queried = store.query().where("login_hash", token).get();

      if (queried.length) {
        record = queried[0];
      }

      if (!record || refresh) {
        await store.api().read({
          clear: !refresh,
          forceReload: true,
          filters: [
            { operator: "eq", property: "login_hash", value: token },
          ],
        });

        queried = store.query().where("login_hash", token).get();

        if (queried.length) {
          record = queried[0];
        }
      }

      if (!record) {
        this.loggedIn = false;

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
      this.loggedIn = true;

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
  },
  watch: {
    "record.request.code": async function (code, oldCode) {
      if (oldCode === undefined || code === oldCode) {
        return;
      }

      const hash = this.token;

      await this.findRequest(hash, true);
    },
  },
};
</script>
