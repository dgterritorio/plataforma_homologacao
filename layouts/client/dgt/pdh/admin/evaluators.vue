<template>
  <v-row>
    <v-col>
      <VTable
        :headers="headers"
        :store="'HomologationRequests'"
        :title="$t('Requests List')"
        :sortBy="'start_date'"
        :sortDesc="true"
        @manage="onManage"
      ></VTable>
    </v-col>

    <!-- Assignemnt dialog -->
    <v-dialog v-model="assignmentDialog" persistent max-width="800" scrollable>
      <v-card>
        <v-card-title class="headline unselectable d-flex mb-2">
          <v-icon class="mr-2" color="red">{{ "mdi-alert" }}</v-icon
          >Delegação da Tramitação do Requerimento
        </v-card-title>

        <v-divider class="ma-0 pa-0"></v-divider>

        <v-card-text class="body-1 unselectable pb-2 justify-text my-6 px-10">
          <p>Selecione o utilizador a quem deseja delegar a tramitação.</p>
          <VTable
            ref="assignedEvaluators"
            :headers="evaluationAssignmentHeaders"
            :store="'PossibleEvaluators'"
            :autoLoad="false"
            selectable
            @select="selectedEvaluator = $event"
            @unselect="selectedEvaluator = null"
          ></VTable>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="onCloseEvaluationAssignment">
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            text
            :disabled="!selectedEvaluator"
            @click="onAssigning"
          >
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Delegar tramitação
            {{
              selectedEvaluator
                ? "a " + selectedEvaluator.name.split(" ")[0]
                : ""
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import VTable from "@/components/tables/basic.vue";
export default {
  components: {
    VTable,
  },
  data() {
    return {
      headers: [
        {
          text: this.$t("Request ID"),
          value: "id",
          width: 160,
          filterable: {
            operator: "eq",
          },
        },
        {
          text: this.$t("Cartography Name"),
          value: "name",
          align: "left",
          filterable: {
            type: "string",
          },
        },
        {
          text: this.$t("Estado da Tramitação"),
          value: "code",
          renderer: {
            type: "chip",
            store: "entities/HomologationStateTypes",
            text: "description",
            value: "code",
            storeRead: "all",
          },
        },
        {
          text: this.$t("Assigned Evaluator"),
          value: "evaluation_owner_name",
          filterable: {
            type: "string",
          },
        },
        // {
        //   text: this.$t("Assigned Evaluator Email"),
        //   value: "evaluation_owner_email",
        // },
        {
          text: this.$t("Manage Ownership"),
          value: "manage",
          width: 30,
          renderer: {
            type: "action",
            icon: "mdi-pencil",
            event: "manage",
          },
        },
      ],

      evaluationAssignmentHeaders: [
        {
          text: this.$t("Name"),
          value: "name",
          align: "left",
        },
        {
          text: this.$t("email"),
          value: "email",
        },
      ],

      assignmentDialog: false,

      selectedEvaluator: null,
      selectedRequest: null,
    };
  },

  created: function () {
    if (process.client) {
      const store = this.$store.$db().model("HomologationStateTypes");

      store.api().read({ once: true });
    }
  },

  methods: {
    requestPossibleEvaluators: async function (excludeId) {
      const store = this.$store.$db().model("PossibleEvaluators");

      if (store && this.$auth.user) {
        store.api().read({
          filters: excludeId
            ? [
                {
                  property: "id",
                  operator: "noteq",
                  value: excludeId,
                },
              ]
            : null,
        });
      }
    },

    onManage: async function (record) {
      const assignedEvaluatorId = record.evaluation_owner_id;

      await this.requestPossibleEvaluators(assignedEvaluatorId);

      this.selectedRequest = record;
      this.selectedEvaluator = null;
      this.assignmentDialog = true;
    },

    onAssigning: async function () {
      const selectedEvaluator = this.selectedEvaluator;

      if (!selectedEvaluator || !selectedEvaluator.hasOwnProperty("id")) {
        // TODO: Print error
        return;
      }

      const evaluatorId = selectedEvaluator.id;
      const requestId = this.selectedRequest.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/evaluator/assign",
          {
            requestId: requestId,
            evaluatorId: evaluatorId,
          },
          {
            progress: true,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.selectedRequest.is_evaluation_owner = false;
        this.selectedRequest.requiresEvaluationOwner = false;
        this.selectedRequest.evaluation_owner_id = selectedEvaluator.id;
        this.selectedRequest.evaluation_owner_name = selectedEvaluator.name;

        this.selectedRequest.$save();

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text:
            "<p>A tramitação foi delegada com sucesso a " +
            selectedEvaluator.name +
            ".</p>",
          okText: "Confirmar",
        });
      } catch (e) {
        // this.$store.commit("SET_DIALOGMSG", {
        //   title: "Erro!",
        //   icon: "mdi-alert",
        //   color: "red",
        //   text:
        //     "<p>A tramitação foi delegada com sucesso a:</p><ul><li>" +
        //     selectedEvaluator.name +
        //     "</li><li>" +
        //     selectedEvaluator.email +
        //     "</li></ul>",
        //   okText: "Confirmar",
        // });
      }

      this.onCloseEvaluationAssignment();
    },

    onCloseEvaluationAssignment: function () {
      const table = this.$refs.assignedEvaluators;

      if (table) {
        table.unselectAll();
      }

      this.selectedEvaluator = null;
      this.assignmentDialog = false;
    },
  },
};
</script>