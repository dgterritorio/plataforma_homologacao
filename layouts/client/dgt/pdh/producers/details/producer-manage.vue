<template>
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails :title="$t('Status Details')">
        <template v-slot:body>
          <v-row>
            <!-- <v-col sm="12" md="12" lg="12" v-if="details[fields[0].value]">
              <DisplayField :options="{text:fields[0].label}" :model="details[fields[0].value]"></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12" v-if="details[fields[0].value]">
              <DisplayField :options="{text:fields[1].label}" :model="details[fields[1].value]"></DisplayField>
            </v-col>-->

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
          <EvaluationSymbology :record="record"></EvaluationSymbology>
        </template>
      </SimpleDetails>

      <SimpleDetails :title="$t('Manage State')" class="my-6">
        <template v-slot:body>
          <v-row>
            <v-col :sm="12" :md="12" :lg="12">
              <v-btn
                v-if="mustIntervene && !record.request.finished"
                block
                dark
                color="green darken-2"
                readonly
                @click="onComplete"
                >{{ $t("Complete State") }}</v-btn
              >

              <v-btn
                v-else-if="
                  record.request.finished &&
                  (record.request.code === 3 || record.request.code === 105)
                "
                block
                dark
                color="green darken-2"
                readonly
                @click="onComplete"
                >{{ $t("Cessar Atividade") }}</v-btn
              >

              <v-btn v-else block color="gray" readonly>{{
                $t("No Actions to Take")
              }}</v-btn>
            </v-col>

            <!-- <v-col :sm="12" :md="12" :lg="12">
              <v-divider style="margin: 0"></v-divider>
            </v-col>

            <v-col :sm="12" :md="12" :lg="12">
              <v-btn
                block
                dark
                color="red darken-2"
                readonly
                @click="onCancel"
              >{{$t('Cancel Request')}}</v-btn>
            </v-col>-->
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-dialog
      content-class="actionform"
      v-model="evaluateDialog"
      max-width="950"
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
import DisplayField from "@/components/forms/fields/display.vue";

import State1 from "@/layouts/client/dgt/pdh/producers/stages/stage1.vue";
import State3 from "@/layouts/client/dgt/pdh/producers/stages/stage3.vue";
import State105 from "@/layouts/client/dgt/pdh/producers/stages/stage105.vue";

export default {
  components: {
    SimpleDetails,
    FormSection,

    DisplayField,
    EvaluationSymbology,

    State1,
    State3,
    State105,
  },
  props: {
    record: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      allowedStates: [1, 3, 105],
      evaluateDialog: false,
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
    };
  },

  created: function () {
    if (this.state) {
      const start_date = this.record.request.start_date;
      const deadline_date = this.state.deadline_date;

      this.details["deadline_date"] = deadline_date
        ? this.parseDate(deadline_date)
        : "Sem data limite";
      this.details[
        "intervening_description"
      ] = this.record.request.intervening_description;
      this.details["start_date"] = this.parseDate(start_date);

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

    // onCancel: async function () {
    //   const request = this.record.request;
    //   const requestId = request.id;

    //   const { email, password } = this.auth;

    //   const result = await this.$axios.post("/api/producer/state/cancel", {
    //     requestId: requestId,
    //     obs: "",
    //     email: email,
    //     password: password,
    //   });

    //   if (!result.error) {
    //     request.code = result.data[0].code;

    //     request.$save();
    //   }
    // },

    // onRevert: async function () {
    //   const request = this.record.request;
    //   const requestId = request.id;

    //   const { email, password } = this.auth;

    //   const result = await this.$axios.post("/api/producer/state/revert", {
    //     requestId: requestId,
    //     email: email,
    //     password: password,
    //   });

    //   if (!result.error) {
    //     request.code = result.data[0].code;

    //     request.$save();
    //   }
    // },

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
          "<p>O formulário de gestão do registo foi submetido!</p> \
          <p>Os dados submetidos serão avaliados pela DGT e em breve será contactado com instruções adicionais ou com o resultado \
         do registo.</p>",
        okText: "Confirmar",
      });

      // await this.$store.dispatch("homologationList/setState", {
      //   requestId: requestId,
      //   code: code
      // });
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
      let request = this.record.request;

      return (
        request.must_intervene ||
        ((request.code === 3 || request.code === 105) && request.finished)
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