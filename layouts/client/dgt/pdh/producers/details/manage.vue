<template>
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails
        :title="$t('Status Details')"
        :record="details"
        :fields="fields"
      ></SimpleDetails>
    </v-col>

    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails :title="$t('Tramitation State')">
        <template v-slot:body>
          <EvaluationSymbology :record="record"></EvaluationSymbology>
        </template>
      </SimpleDetails>

      <SimpleDetails :title="$t('Manage State')" class="my-6">
        <template v-slot:body>
          <v-row>
            <v-col :sm="12" :md="12" :lg="12">
              <v-btn
                v-if="
                  (mustIntervene && !record.request.finished) ||
                  (record.request.finished && record.request.code === 100)
                "
                block
                dark
                color="green darken-2"
                @click="onComplete"
                >{{ $t("Complete State") }}</v-btn
              >
              <!-- <v-btn v-else block color="gray">{{$t('No Actions to Take')}}</v-btn> -->
            </v-col>

            <v-col
              :sm="12"
              :md="12"
              :lg="12"
              v-if="mustIntervene && !record.request.finished"
            >
              <v-divider style="margin: 0"></v-divider>
            </v-col>

            <!-- <v-col :sm="12" :md="12" :lg="12">
              <v-btn
                block
                dark
                color="orange darken-2"
                readonly
                @click="onRevert"
              >{{$t('Revert State')}}</v-btn>
            </v-col>-->

            <v-col :sm="12" :md="12" :lg="12" v-if="!record.request.finished">
              <v-btn
                block
                dark
                color="red darken-2"
                readonly
                @click="cancelDialog = true"
                >{{ $t("Cancel Registration") }}</v-btn
              >
            </v-col>

            <v-col
              :sm="12"
              :md="12"
              :lg="12"
              v-if="record.request.finished && record.request.code !== 100"
            >
              <v-btn block color="gray" readonly>{{
                $t("No Actions to Take")
              }}</v-btn>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-dialog v-model="cancelDialog" max-width="350" scrollable>
      <v-card>
        <v-card-title class="headline unselectable d-flex mb-2">
          <v-icon class="mr-2" color="red">{{ "mdi-alert" }}</v-icon
          >Cancelamento do Registo
        </v-card-title>

        <v-card-text class="body-1 unselectable pb-2 justify-text">
          <div
            v-html="
              '<p>Está prestes cancelar o registo de mera comunicação prévia.</p><p>Tem a certeza que deseja continuar?</p>'
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

    <v-dialog
      content-class="actionform"
      v-model="evaluateDialog"
      max-width="1000"
      scrollable
      v-if="mustIntervene && isAllowedState"
    >
      <component
        :is="'State' + record.request.code"
        v-if="mustIntervene"
        :title="$t('Manage State Form')"
        :record="record.request"
        :states.sync="record.states"
        :auth="record.auth"
        @close="evaluateDialog = false"
        @submit="onSubmit"
      ></component>
    </v-dialog>
  </v-row>
</template>
<script>
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import EvaluationSymbology from "@/layouts/client/dgt/pdh/producers/details/symbology-evaluation.vue";

import State0 from "@/layouts/client/dgt/pdh/producers/stages/stage0.vue";
import State2 from "@/layouts/client/dgt/pdh/producers/stages/stage2.vue";
import State100 from "@/layouts/client/dgt/pdh/producers/stages/stage100.vue";

export default {
  components: {
    SimpleDetails,
    FormSection,
    EvaluationSymbology,

    State0,
    State2,
    State100,
  },
  props: {
    record: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      allowedStates: [0, 2, 100],
      cancelDialog: false,
      evaluateDialog: false,
      fields: [
        // {
        //   label: this.$t("Last Intervening"),
        //   value: "last_intervening",
        // },
        // {
        //   label: this.$t("Last Intervening Email"),
        //   value: "last_intervening_email",
        // },

        {
          label: this.$t("Deadline"),
          value: "deadline",
        },

        {
          label: this.$t("Remaining Time"),
          value: "remaining",
        },
        {
          label: this.$t("Start Date"),
          value: "state_start_date",
        },
        {
          label: this.$t("Deadline Date"),
          value: "deadline_date",
        },
      ],
      details: {},
    };
  },

  created: function () {
    if (this.state) {
      const state_start_date = this.record.request.state_start_date;
      const deadline_date = this.state.deadline_date;

      this.details["deadline_date"] = this.parseDate(deadline_date);
      this.details[
        "intervening_description"
      ] = this.record.request.intervening_description;
      this.details["state_start_date"] = this.parseDate(state_start_date);
      this.details["deadline_date"] = "Sem data limite";
      this.details["deadline"] = this.state.deadline
        ? this.state.deadline + this.$t(" work days")
        : this.$t("No deadline");

      this.details["remaining"] = this.state.deadline_date
        ? this.state.remaining_days + this.$t(" business days")
        : this.$t("Indeterminado");
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
          "/api/producer/state/cancel",
          {
            stateId: stateId,
            requestId: requestId,
            obs: "",
          },
          {
            progress: true,
          }
        );

        this.cancelDialog = false;

        if (!result.error) {
          request.code = result.data[0].code;

          request.$save();

          this.$store.commit("SET_DIALOGMSG", {
            title: "Sucesso!",
            icon: "mdi-check",
            color: "green",
            text:
              "<p>O processo de registo por mera comunicação prévia foi cancelado.</p>",
            okText: "Confirmar",
          });
        }
      } catch (e) {
        this.cancelDialog = false;
      }
    },

    onRevert: async function () {
      const request = this.record.request;
      const requestId = request.id;

      const result = await this.$axios.post("/api/producer/state/revert", {
        requestId: requestId,
      });

      if (!result.error) {
        request.code = result.data[0].code;

        request.$save();
      }
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
        text: "<p>O formulário de gestão do registo foi submetido!</p>",
        okText: "Confirmar",
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
      const request = this.record.request;

      return (
        request.must_intervene || (request.finished && request.code === 100)
      );
    },

    isAllowedState: function () {
      const request = this.record.request;

      const code = request ? request.code : null;

      return code !== null && this.allowedStates.includes(code);
    },
  },
};
</script>
<style>
.actionform {
  height: 100vh;
}
</style>