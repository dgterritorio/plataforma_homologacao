<template>
  <!-- :title="$t('Tramitation Details')" -->
  <!-- <SimpleCard flat>
  <template v-slot:body>-->
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails :title="$t('Status Details')">
        <template v-slot:body>
          <v-row>
            <!-- <v-col sm="12" md="12" lg="12" v-if="details[fields[0].value]">
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
            </v-col> -->

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
            <v-col :sm="12" :md="12" :lg="12">
              <v-btn
                v-if="mustIntervene && !record.request.finished"
                block
                dark
                color="primary darken-2"
                readonly
                @click="onComplete"
              >
                <v-icon medium left>{{ "mdi-page-next-outline" }}</v-icon>
                {{ $t("Complete") }}</v-btn
              >

              <v-btn
                text
                v-else
                block
                color="gray"
                readonly
                @click="onComplete"
                >{{ $t("No Actions to Take") }}</v-btn
              >
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-dialog
      content-class="actionform"
      v-model="evaluateDialog"
      max-width="950"
      scrollable
      persistent
      v-if="mustIntervene && isAllowedState"
    >
      <component
        :is="'State' + record.request.code"
        v-if="record.request.must_intervene"
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
import TramitationSymbology from "@/layouts/client/dgt/pdh/homologation/details/symbology-tramitation.vue";
import SimpleCard from "@/components/cards/simplecard.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import DisplayField from "@/components/forms/fields/display.vue";

import State1 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage1.vue";
import State3 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage3.vue";
import State5 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage5.vue";
import State7 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage7.vue";
import State9 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage9.vue";

import State51 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage51.vue";
import State55 from "@/layouts/client/dgt/pdh/homologation/stages/preprocessing/stage55.vue";

export default {
  components: {
    TramitationSymbology,
    SimpleCard,
    SimpleDetails,
    FormSection,
    DisplayField,

    State1,
    State3,
    State5,
    State7,
    State9,

    State51,
    State55,
  },

  props: {
    record: {
      type: Object,
      default: {},
    },
  },

  data() {
    return {
      evaluateDialog: false,

      allowedStates: [1, 3, 5, 7, 9, 51, 55],

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
    this.parseStateInfo(this.state);
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

    parseStateInfo: function (state) {
      const start_date = state.start_date;
      const deadline_date = state.deadline_date;

      this.details["deadline_date"] = deadline_date
        ? this.parseDate(deadline_date)
        : this.$t("No deadline");
      this.details[
        "intervening_description"
      ] = this.record.request.intervening_description;
      this.details["start_date"] = this.parseDate(start_date);

      this.details["deadline"] = this.state.deadline_date
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
    },

    onComplete: function () {
      this.evaluateDialog = true;
    },

    // onCancel: async function () {
    //   const request = this.record.request;
    //   const requestId = request.id;

    //   const result = await this.$axios.post("/api/homologation/state/cancel", {
    //     requestId: requestId,
    //     observations: "",
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
          "<p>Formulário de gestão de estado do requerimento submetido!</p> \
          <p>Os dados submetidos serão avaliados pela nossa equipa e em breve será contactado com instruções adicionais ou com o resultado \
         do processo.</p>",
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

    isAllowedState: function(){
        const request = this.record.request;

        const code = request ? request.code : null;

        return code && this.allowedStates.includes(code);
    }
  },

  watch: {
    state: {
      handler: function (newState) {
        this.parseStateInfo(newState);
      },
    },
  },
};
</script>
<style>
.actionform {
  height: 100vh;
}
</style>