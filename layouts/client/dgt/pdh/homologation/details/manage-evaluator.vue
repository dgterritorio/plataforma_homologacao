<template>
  <!-- <SimpleCard flat>
  <template v-slot:body>-->
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails :title="$t('Status Details')">
        <template v-slot:body>
          <v-row>
            <v-col sm="12" md="12" lg="12" v-if="details[fields[0].value]">
              <DisplayField
                :options="{ text: fields[0].label }"
                :model="details[fields[0].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12" v-if="details[fields[0].value]">
              <DisplayField
                :options="{ text: fields[1].label }"
                :model="details[fields[1].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[2].label }"
                :model="details[fields[2].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[3].label }"
                :model="details[fields[3].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[4].label }"
                :model="details[fields[4].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[5].label }"
                :model="details[fields[5].value]"
              ></DisplayField>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails :title="$t('Tramitation State')">
        <template v-slot:body>
          <TramitationSymbology :record="record"></TramitationSymbology>
        </template>
      </SimpleDetails>

      <SimpleDetails :title="$t('Manage State')" class="my-6">
        <template v-slot:body>
          <v-row>
            <v-col sm="12" md="12" lg="12" class="pb-0">
              <p class="font-weight-medium text--secondary ma-0">
                Avançar Estado
              </p>
            </v-col>
            <v-col :sm="12" :md="12" :lg="12" v-if="canComplete">
              <v-btn
                block
                dark
                color="primary darken-2"
                readonly
                @click="onComplete"
              >
                <v-icon medium left>{{ "mdi-page-next-outline" }}</v-icon>
                {{ $t("Complete State") }}</v-btn
              >
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" v-else-if="!mustComplete">
              <v-btn text block color="gray" readonly>{{
                $t("No Actions to Take")
              }}</v-btn>
            </v-col>

            <v-col
              :sm="12"
              :md="12"
              :lg="12"
              v-else-if="mustComplete && !canComplete"
            >
              <v-btn text block color="gray" readonly>{{
                isSuspended
                  ? $t("Suspended State")
                  : $t("No Permission to Manage")
              }}</v-btn>
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" v-if="canCancel">
              <v-divider style="margin: 0"></v-divider>
            </v-col>

            <v-col sm="12" md="12" lg="12" v-if="hasAdvancedOptions">
              <p class="font-weight-medium text--secondary ma-0 pb-0">
                {{ $t("Advanced Options") }}
              </p>
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" v-if="canDelegate">
              <v-btn
                outlined
                block
                dark
                color="primary darken-2"
                readonly
                @click="onBeforeAssigning"
              >
                <v-icon medium left>{{ "mdi-account-convert" }}</v-icon>
                {{ $t("Delegar Tramitação") }}</v-btn
              >
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" v-if="canSuspend || canResume">
              <v-btn
                outlined
                block
                dark
                color="primary darken-2"
                readonly
                @click="onBeforeSuspend"
              >
                <v-icon medium left>{{
                  canSuspend
                    ? "mdi-pause-circle-outline"
                    : "mdi-play-circle-outline"
                }}</v-icon>
                {{
                  canSuspend
                    ? $t("Suspender Tramitação")
                    : $t("Resumir Tramitação")
                }}</v-btn
              >
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" v-if="canModifyType">
              <v-btn
                outlined
                block
                dark
                color="primary darken-2"
                readonly
                @click="onBeforeChangeType"
              >
                <v-icon medium left>{{ "mdi-playlist-edit" }}</v-icon>
                {{ $t("Modificar Tipo de Homologação") }}</v-btn
              >
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" v-if="canModifyRegime">
              <v-btn
                outlined
                block
                dark
                color="primary darken-2"
                readonly
                @click="onBeforeChangeRegime"
              >
                <v-icon medium left>{{ "mdi-playlist-edit" }}</v-icon>
                {{ $t("Modificar Regime de Homologação") }}</v-btn
              >
            </v-col>

            <!-- Desativada -->
            <!-- <v-col :sm="12" :md="12" :lg="12" v-if="canRevert">
              <v-btn
                block
                dark
                outlined
                color="primary darken-2"
                readonly
                @click="onBeforeRevert"
              >
                <v-icon medium left>{{ "mdi-progress-close" }}</v-icon>
                {{ $t("Revert State") }}</v-btn
              >
            </v-col> -->

            <v-col :sm="12" :md="12" :lg="12" v-if="canCancel">
              <v-divider style="margin: 0"></v-divider>
            </v-col>

            <v-col sm="12" md="12" lg="12" v-if="canCancel" class="pb-0">
              <p class="font-weight-medium text--secondary ma-0">
                {{ $t("Request Cancelation") }}
              </p>
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" v-if="canCancel">
              <v-btn
                outlined
                block
                dark
                color="red darken-2"
                readonly
                @click="cancelDialog = true"
              >
                <v-icon medium left>{{ "mdi-close-circle" }}</v-icon>
                {{ $t("Cancel Request") }}</v-btn
              >
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-dialog v-model="cancelDialog" max-width="350" scrollable>
      <v-card>
        <v-card-title class="headline unselectable d-flex mb-2">
          <v-icon class="mr-2" color="red">{{ "mdi-alert" }}</v-icon
          >Cessação de Tramitação
        </v-card-title>

        <v-card-text class="body-1 unselectable pb-2 justify-text">
          <div
            v-html="
              '<p>Está prestes cessar a tramitação de este processo.</p><p>Tem a certeza que deseja continuar?</p>'
            "
          ></div>
        </v-card-text>

        <v-card-actions>
          <v-btn color="grey" text @click="cancelDialog = false">
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Não
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="onCancel">
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Sim
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          <Table
            ref="assignedEvaluators"
            :headers="evaluationAssignmentHeaders"
            :store="'PossibleEvaluators'"
            selectable
            @select="selectedEvaluator = $event"
            @unselect="selectedEvaluator = null"
          ></Table>
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

    <!-- Change Type Dialod-->
    <v-dialog
      v-model="homologationTypeDialog"
      persistent
      max-width="500"
      scrollable
    >
      <v-card>
        <v-card-title class="headline unselectable d-flex mb-2">
          <v-icon class="mr-2" color="red">{{ "mdi-alert" }}</v-icon
          >Alteração do Tipo de Homologação
        </v-card-title>

        <v-divider class="ma-0 pa-0"></v-divider>

        <v-card-text class="body-1 unselectable pb-2 justify-text mt-6 px-10">
          <DisplayField
            :options="{ text: 'Tipo de Homologação Atual:' }"
            :model="currentHomologationType"
          ></DisplayField>

          <VCombobox
            :options="{
              text: 'Mudar para:',
              items: homologationTypes,
              itemText: 'text',
              itemValue: 'value',
            }"
            v-model="selectedHomologationType"
          ></VCombobox>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="onCloseChangeType">
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            text
            :disabled="
              !selectedHomologationType ||
              record.request.homologation_type === selectedHomologationType
            "
            @click="onChangeType(selectedHomologationType)"
          >
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Modificar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Regime Dialod-->
    <v-dialog
      v-model="homologationRegimeDialog"
      persistent
      max-width="500"
      scrollable
    >
      <v-card>
        <v-card-title class="headline unselectable d-flex mb-2">
          <v-icon class="mr-2" color="red">{{ "mdi-alert" }}</v-icon
          >Alteração do Regime de Homologação
        </v-card-title>

        <v-divider class="ma-0 pa-0"></v-divider>

        <v-card-text class="body-1 unselectable pb-2 justify-text mt-6 px-5">
          <DisplayField
            :options="{ text: 'Regime de Homologação Atual:' }"
            :model="
              record.request.exceptional_regime
                ? 'Regime Excecional'
                : 'Regime Normal'
            "
          ></DisplayField>

          <DisplayField
            :options="{ text: 'Modificar para:' }"
            :model="
              selectedHomologationRegime ? 'Regime Excecional' : 'Regime Normal'
            "
          ></DisplayField>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="onCloseChangeRegime">
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            text
            :disabled="
              selectedHomologationRegime === null ||
              record.request.exceptional_regime === selectedHomologationRegime
            "
            @click="onChangeRegime(selectedHomologationRegime)"
          >
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            Modificar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="evaluateDialog"
      content-class="actionform"
      max-width="1000"
      scrollable
      persistent
      v-if="mustIntervene && isAllowedState"
    >
      <component
        :is="'State' + record.request.code"
        v-if="mustIntervene"
        :title="$t('Evaluate')"
        :record="record.request"
        :states.sync="record.states"
        @close="evaluateDialog = false"
        @submit="onSubmit"
      ></component>
    </v-dialog>
  </v-row>

  <!-- </template>
  </SimpleCard>-->
</template>
<script>
import Table from "@/components/tables/basic.vue";
import TramitationSymbology from "@/layouts/client/dgt/pdh/homologation/details/symbology-tramitation.vue";

import StateInfo from "@/layouts/client/dgt/pdh/custom/symbology/state-icon.vue";
import SimpleCard from "@/components/cards/simplecard.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import DisplayField from "@/components/forms/fields/display.vue";
import VCombobox from "@/components/forms/fields/remotecombobox.vue";

import State2 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage2.vue";
import State4 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage4.vue";
import State6 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage6.vue";
import State8 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage8.vue";

import State50 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage50.vue";
import State52 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage52.vue";
import State53 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage53.vue";
// import State54 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage53.vue";

export default {
  components: {
    Table,
    TramitationSymbology,
    SimpleCard,
    SimpleDetails,
    FormSection,
    DisplayField,
    VCombobox,

    State2,
    State4,
    State6,
    State8,
    State50,
    State52,
    State53,
    // State54,
  },
  props: {
    record: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      allowedStates: [2, 4, 6, 8, 50, 52, 53],
      cancelDialog: false,
      evaluateDialog: false,
      assignmentDialog: false,
      homologationTypeDialog: false,
      homologationRegimeDialog: false,
      fields: [
        {
          label: this.$t("Last Intervening"),
          value: "last_intervening",
        },
        {
          label: this.$t("Last Intervening Email"),
          value: "last_intervening_email",
        },

        {
          label: this.$t("Deadline"),
          value: "deadline",
        },

        {
          label: this.$t("Remaining Time"),
          value: "remaining_days",
        },
        {
          label: this.$t("Start Date"),
          value: "start_date",
        },
        {
          label: this.$t("Deadline Date"),
          value: "deadline_date",
        },
      ],
      details: {},

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
      selectedEvaluator: null,
      selectedHomologationType: null,
      selectedHomologationRegime: null,

      homologationTypes: [
        { text: "Tipo A", value: 2 },
        { text: "Tipo B", value: 3 },
      ],
    };
  },

  created: function () {
    if (this.state) {
      const start_date = this.record.request.start_date;
      const deadline_date = this.state.deadline_date;

      this.details["deadline_date"] = deadline_date
        ? this.parseDate(deadline_date)
        : this.$t("No deadline");
      this.details[
        "intervening_description"
      ] = this.record.request.intervening_description;
      this.details["start_date"] = this.parseDate(start_date);
      this.details["deadline"] = this.state.deadline
        ? this.state.deadline + this.$t(" business days")
        : this.$t("No deadline");

      this.details["last_intervening"] = this.record.request.last_intervening;
      this.details[
        "last_intervening_email"
      ] = this.record.request.last_intervening_email;

      this.details["deadline"] = this.state.deadline_date
        ? this.state.deadline + this.$t(" business days")
        : this.$t("No deadline");

      this.details["ellapsed_days"] = this.state.deadline_date
        ? this.state.ellapsed_days + this.$t(" business days")
        : this.$t("No deadline");
      this.details["remaining_days"] = this.state.deadline_date
        ? this.state.remaining_days + this.$t(" business days")
        : this.$t("No deadline");
    }
  },

  methods: {
    parseDate: function (tstamp) {
      if (!tstamp || !tstamp.length) {
        return "";
      }

      const tstampObj = new Date(tstamp);

      let day = tstampObj.getDate();
      let month = tstampObj.getMonth() + 1;
      let year = tstampObj.getFullYear();

      if (day < 10) {
        day = "0" + day;
      }

      if (month < 10) {
        month = "0" + month;
      }

      return day + "-" + month + "-" + year;
    },

    onComplete: function () {
      this.evaluateDialog = true;
    },

    onCancel: async function () {
      const request = this.record.request;
      const requestId = request.id;
      const stateId = request.state_id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/cancel",
          {
            stateId: stateId,
            requestId: requestId,
            observations: "",
          },
          {
            progress: true,
          }
        );

        if (result.error) {
          throw result.error;
        }

        request.code = result.data[0].code;

        request.$save();

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text: "<p>A tramitação do requerimento foi cessada!</p>",
          okText: "Confirmar",
        });

        this.cancelDialog = false;
      } catch (e) {
        this.cancelDialog = false;

        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-alert",
          color: "red",
          text: "<p>Não foi possível cessar a tramitação.</p>",
          okText: "Confirmar",
        });
      }
    },

    onBeforeRevert: function () {
      const self = this;

      this.$store.commit("SET_DIALOGMSG", {
        title: "Aviso!",
        icon: "mdi-alert",
        color: "red",
        text:
          "<p>Reverter a tramitação para o estado anterior impossibilita voltar ao estado atual.</p> <p>Deseja continuar?</p>",
        okText: "Confirmar",
        cancelText: "Cancelar",
        okFn: async function () {
          await self.onRevert();
        },
      });
    },

    onRevert: async function () {
      const request = this.record.request;
      const requestId = request.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/revert",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        request.code = result.data[0].code;

        request.$save();

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text: "<p>Estado da tramitação revertido com sucesso.</p>",
          okText: "Confirmar",
        });
      } catch (e) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-alert",
          color: "red",
          text: "<p>Não foi possível reverter o estado da tramitação.</p>",
          okText: "Confirmar",
        });
      }
    },

    onCloseChangeType: function () {
      this.selectedHomologationType = null;
      this.homologationTypeDialog = false;
    },

    onBeforeChangeType: function () {
      const self = this;

      this.$store.commit("SET_DIALOGMSG", {
        title: "Aviso!",
        icon: "mdi-alert",
        color: "red",
        text:
          "<p>A modificação do tipo de homologação irá alterar as tarefas de avaliação interna durante o processo de homologação da cartografia.</p> <p>Deseja continuar?</p>",
        okText: "Confirmar",
        cancelText: "Cancelar",
        okFn: async function () {
          self.selectedHomologationType = self.record.request.homologation_type;
          self.homologationTypeDialog = true;
        },
      });
    },

    onCloseChangeRegime: function () {
      this.selectedHomologationRegime = null;
      this.homologationRegimeDialog = false;
    },

    onBeforeChangeRegime: function () {
      const self = this;

      this.$store.commit("SET_DIALOGMSG", {
        title: "Aviso!",
        icon: "mdi-alert",
        color: "red",
        text:
          "<p>A modificação do regime de homologação irá alterar as tarefas de avaliação interna durante o processo de homologação da cartografia.</p> <p>Deseja continuar?</p>",
        okText: "Confirmar",
        cancelText: "Cancelar",
        okFn: async function () {
          self.selectedHomologationRegime = !self.record.request
            .exceptional_regime;
          self.homologationRegimeDialog = true;
        },
      });
    },

    onChangeType: async function (type) {
      const request = this.record.request;
      const requestId = request.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/changetype",
          {
            requestId: requestId,
            type: type,
            stateId: request.state_id,
          }
        );

        if (result.error) {
          throw result.error;
        }

        request.code = result.data[0].code;

        request.$save();

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text: "<p>Tipo de homologação modificado para: </p>",
          okText: "Confirmar",
        });
      } catch (e) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-alert",
          color: "red",
          text: "<p>Não foi possível modificar o tipo de homologação.</p>",
          okText: "Confirmar",
        });
      }

      this.onCloseChangeType();
    },

    onChangeRegime: async function (regime) {
      const request = this.record.request;
      const requestId = request.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/changeregime",
          {
            requestId: requestId,
            regime: regime,
            stateId: request.state_id,
          }
        );

        if (result.error) {
          throw result.error;
        }

        request.code = result.data[0].code;

        request.$save();

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text:
            "<p>Regime de homologação modificado para: " +
            (regime ? "Regime Excecional" : "Regime Normal") +
            " </p>",
          okText: "Confirmar",
        });
      } catch (e) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-alert",
          color: "red",
          text: "<p>Não foi possível modificar o regime de homologação.</p>",
          okText: "Confirmar",
        });
      }

      this.onCloseChangeRegime();
    },

    onBeforeSuspend: function () {
      const self = this;

      const canSuspend = this.canSuspend;
      const canResume = this.canResume;

      let text, fn;

      if (canSuspend) {
        text =
          "<p>Está prestes a suspender a tramitação.</p> <p>Deseja continuar?</p>";
        fn = this.onSuspend;
      } else if (canResume) {
        text =
          "<p>Está prestes a resumir a tramitação.</p> <p>Deseja continuar?</p>";

        fn = this.onResume;
      } else {
        return;
      }

      this.$store.commit("SET_DIALOGMSG", {
        title: "Aviso!",
        icon: "mdi-alert",
        color: "red",
        text: text,
        okText: "Confirmar",
        cancelText: "Cancelar",
        okFn: async function () {
          await fn();
        },
      });
    },

    onSuspend: async function () {
      const request = this.record.request;
      const requestId = request.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/suspend",
          {
            requestId: requestId,
            stateId: request.state_id,
          }
        );

        if (result.error) {
          throw result.error;
        }

        request.code = result.data[0].code;

        request.$save();

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text: "<p>Tramitação suspendida!</p>",
          okText: "Confirmar",
        });
      } catch (e) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-alert",
          color: "red",
          text: "<p>Não foi possível suspender a tramitação.</p>",
          okText: "Confirmar",
        });
      }
    },

    onResume: async function () {
      const request = this.record.request;
      const requestId = request.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/resume",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        request.code = result.data[0].code;

        request.$save();

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text: "<p>Tramitação resumida!</p>",
          okText: "Confirmar",
        });
      } catch (e) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-alert",
          color: "red",
          text: "<p>Não foi possível resumir a tramitação.</p>",
          okText: "Confirmar",
        });
      }
    },

    requestPossibleEvaluators: async function () {
      const store = this.$store.$db().model("PossibleEvaluators");

      if (store && this.$auth.user) {
        store.api().read();
      }
    },

    onBeforeAssigning: function () {
      const self = this;

      this.$store.commit("SET_DIALOGMSG", {
        title: this.$t("Warning") + "!",
        icon: "mdi-alert",
        color: "red",
        text:
          "<p>Ao delegar a responsabilidade da tramitação de este requerimento, vai prescindir da capacidade de gerir o estado da tramitaçao!</p><p> Deseja prosseguir?</p>",
        okText: "Confirmar",
        cancelText: "Cancelar",
        okFn: function () {
          self.assignmentDialog = true;
          self.selectedEvaluator = null;
          self.requestPossibleEvaluators();
        },
      });
    },

    onAssigning: async function () {
      const selectedEvaluator = this.selectedEvaluator;

      if (!selectedEvaluator || !selectedEvaluator.hasOwnProperty("id")) {
        // TODO: Print error
        return;
      }

      const evaluatorId = selectedEvaluator.id;
      const requestId = this.record.request.id;

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

        this.record.request.is_evaluation_owner = false;
        this.record.request.requiresEvaluationOwner = false;
        this.record.request.evaluation_owner_id = selectedEvaluator.id;
        this.record.request.evaluation_owner_name = selectedEvaluator.name;

        this.record.request.$save();

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

    onSubmit: async function (code) {
      const requestId = this.record.id;

      const request = this.record.request;

      request.code = code;

      request.$save();

      this.$store.commit("SET_DIALOGMSG", {
        title: "Sucesso!",
        icon: "mdi-check",
        color: "green",
        text:
          "<p>Formulário de gestão de estado do requerimento submetido!</p>",
        okText: "Sair",
      });
    },
  },

  computed: {
    state: function () {
      const states = this.record.states;

      if (states && states.length) {
        return states[states.length - 1];
      } else {
        return {};
      }
    },

    mustIntervene: function () {
      return this.record.request.must_intervene;
    },

    requiresEvaluationOwner: function () {
      return this.record.request.requires_evaluation_owner;
    },

    isEvaluationOwner: function () {
      return this.record.request.is_evaluation_owner;
    },

    currentHomologationType: function () {
      const type = this.record.request.homologation_type;

      const found = this.homologationTypes.find((r) => r.value === type);

      if (found) {
        return found.text;
      } else {
        return "Tipo Indefinido";
      }
    },

    canComplete: function () {
      return (
        this.mustIntervene &&
        !this.record.request.finished &&
        (this.requiresEvaluationOwner || this.isEvaluationOwner) &&
        !this.isSuspended
      );
    },

    mustComplete: function () {
      return this.mustIntervene && !this.record.request.finished;
    },

    canDelegate: function () {
      return !this.record.request.finished && this.isEvaluationOwner;
    },

    canCancel: function () {
      return !this.record.request.finished && this.isEvaluationOwner;
    },

    canRevert: function () {
      return this.canDelegate && !this.isSuspended && !this.disableRevert;
    },

    disableRevert: function () {
      const states = this.record.states;

      if (!(this.record.request.code < 56)) {
        return true;
      }

      let wasLastIntervening;

      let first, second;

      let i = states.length - 1;
      let current;

      while (i > 0) {
        current = states[i];

        const reverted = current.reverted;
        const code = current.code;

        if (!reverted && code < 300) {
          if (!first) {
            first = current;
          } else if (!second) {
            second = current;
            break;
          }
        }

        i--;
      }

      if (second) {
        const intervening = second.intervening;

        return !intervening;
      } else {
        return true;
      }
    },

    canModifyType: function () {
      return this.canDelegate && !this.isSuspended && !this.disableModifyType;
    },

    disableModifyType: function () {
      return !(this.record.request.code < 52);
    },

    canModifyRegime: function () {
      return this.canDelegate && !this.isSuspended && !this.disableModifyRegime;
    },

    disableModifyRegime: function () {
      return !(this.record.request.code < 52);
    },

    isSuspended: function () {
      return this.record.request.code === 305;
    },

    canSuspend: function () {
      return this.canDelegate && !this.isSuspended && !this.disableSuspend;
    },

    disableSuspend: function () {
      return !(this.record.request.code < 56);
    },

    canResume: function () {
      return this.canDelegate && this.isSuspended;
    },

    hasAdvancedOptions: function () {
      return (
        this.canSuspend ||
        this.canResume ||
        this.canModifyType ||
        this.canModifyRegime ||
        this.canRevert ||
        this.canDelegate
      );
    },

    isAllowedState: function(){
        const request = this.record.request;

        const code = request ? request.code : null;

        return code && this.allowedStates.includes(code);
    }
  },
};
</script>
<style>
.actionform {
  height: 100vh;
}
</style>