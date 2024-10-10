<template>
  <FormSection :title="title" class="ma-3">
    <template v-slot:body>
      <div class="ma-6 body-1 text-justify unselectable">
        Após a análise de consistência da cartografia terminar, deve verificar e assinalar a conformidade do resultado.
      </div>

      <!-- <v-row justify="center">
        <v-col offset="1" :sm="5" :md="5" :lg="5"> -->
      <DisplayField
        v-if="computing"
        class="mx-12"
        :options="{ text: $t('Analysis Status') }"
        :model="result"
      >
        <template v-slot:prefix>
          <v-icon color="primary">{{ resultIcon }}</v-icon>
        </template>
      </DisplayField>

      <Combobox
        class="mx-12"
        :options="{
          text: $t('Analysis Result'),
          items: items,
          lg: 4,
          md: 4,
          sm: 4,
          defaultValue: accordingly,
        }"
        v-model="accordingly"
      ></Combobox>
      <!-- </v-col> -->

      <!-- <v-col :sm="5" :md="5" :lg="5"> -->
      <DisplayField
        v-if="!computing"
        class="mx-12"
        :options="{ text: $t('Number of Errors') }"
        :model="errors + ' ' + (errors !== 1 ? $t('errors') : $t('error'))"
      ></DisplayField>
      <!-- </v-col>
      </v-row> -->

      <div v-if="!computing" class="ma-6 body-1 text-justify unselectable">
        Caso seja necessário, deve também redigir um conjunto de observações que
        ajudem a compreensão do resultado da avaliação.
      </div>

      <Textareafield
        v-if="!computing"
        class="mx-12"
        :options="{
          text: $t('Relevant Observations'),
          limit: 1000,
          validation: ['float'],
          suffix: '%',
          lg: 2,
          md: 2,
          sm: 2,
          model: observations,
        }"
        :model="observations"
        v-model="observations"
      ></Textareafield>

      <div class="ma-6 body-1 text-justify unselectable">
        A tabela seguinte irá listar todas as
        regras utilizadas para avaliar a consistência da cartografia.
      </div>

      <RemoteTable
        :height="400"
        :headers="columns"
        :data="data"
        hideFooter
      ></RemoteTable>
    </template>
  </FormSection>
</template>
<script>
import ModernSwitch from "@/layouts/client/dgt/pdh/custom/modern-switch.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import CartographyMixin from "@/layouts/client/dgt/pdh/mixins/cartography.js";
import RemoteTable from "@/components/tables/basic.vue";

import DisplayField from "@/components/forms/fields/display.vue";
import Combobox from "@/components/forms/fields/remotecombobox.vue";
import Textareafield from "@/components/forms/fields/textarea.vue";

export default {
  name: "CartographyReview",

  components: {
    RemoteTable,
    ModernSwitch,
    FormSection,
    DisplayField,
    Combobox,
    Textareafield,
  },

  mixins: [ActionFormMixin, CartographyMixin],

  data() {
    return {
      evaluationType: 1,

      validationResult: false,
      validating: false,
      validationResult: true,

      accordingly: null,
      evaluation: null,
      observations: null,

      evaluation: {
        accordingly: null,
        end_date: null,
        observations: "",
        budget: null,
      },

      computing: false,

      items: [
        { text: this.$t("Accordingly"), value: "2", icon: "mdi-check" },
        { text: this.$t("Not accordingly"), value: "1", icon: "mdi-close" },
      ],

      switchCfg: {
        valid: {
          label: this.$t("Accordingly"),
          value: true,
          color: "primary",
          icon: "mdi-check",
        },
        invalid: {
          label: this.$t("Not Accordingly"),
          value: false,
          color: "red",
          icon: "mdi-close",
        },
      },

      columns: [
        {
          text: this.$t("Rule Name"),
          value: "name",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Rule Code"),
          value: "code",
          sortable: false,
        },
        {
          text: this.$t("Total Elements"),
          value: "total",
          sortable: false,
        },
        {
          text: this.$t("Success"),
          value: "good",
          sortable: false,
        },
        {
          text: this.$t("Fail"),
          value: "bad",
          sortable: false,
        },
      ],

      // Analysis data
      data: [],
    };
  },

  created: async function () {
    const record = this.record;

    const data = await this.requestAnalysisResult({
      requestId: record.id,
    });

    this.data = data;

    this.computing = !data.length;

    const evaluation = await this.requestEvaluation();

    if (evaluation) {
      this.evaluation.accordingly = evaluation.accordingly;
      this.accordingly = evaluation.accordingly;
      this.observations = evaluation.observations;
    } else {
      this.accordingly = !this.computing && this.errors === 0 ? "2" : "1";
    }

    await this.validate();
  },

  methods: {
    validate: async function () {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      const { accordingly } = this.evaluation;

      const valid = accordingly !== null; //this.errors === 0;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.isAccordingly;

      if (valid) {
        return {
          action: this.$t("Consistency Analysis"),
          conclusion: this.$t("Accordingly"),
          number: this.len,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Consistency Analysis"),
          conclusion: this.$t("Not Accordingly"),
          number: this.errors,
          advance: false,
        };
      }
    },

    requestAnalysisResult: async function (params) {
      const requestId = params.requestId;

      try {
        const result = await this.$axios.post(
          "/api/homologation/evaluation/getanalysis",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return result.data;
      } catch (e) {
        console.log("Error loading results ");

        return [];
      }
    },

    requestEvaluation: async function () {
      const record = this.record;

      const stateId = record.state_id;
      const requestId = record.id;
      const evaluationType = this.evaluationType;

      try {
        const result = await this.$axios.post(
          "/api/homologation/evaluation/get",
          {
            requestId: requestId,
            stateId: stateId,
            evaluationType: evaluationType,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const data = result.data;

        return data.length ? data[0] : null;
      } catch (e) {
        console.log("Error getting evalution");

        return null;
      }
    },

    updateEvaluation: async function (params) {
      const record = this.record;

      const stateId = record.state_id;
      const requestId = record.id;
      const evaluationType = this.evaluationType;
      const accordingly = params.accordingly;
      const observations = params.observations;

      const endDate = new Date().toISOString().split("T")[0];

      try {
        const result = await this.$axios.post(
          "/api/homologation/evaluation/set",
          {
            requestId: requestId,
            stateId: stateId,
            evaluationType: evaluationType,
            endDate: endDate,
            accordingly: accordingly,
            percentageErrors: null,
            budget: null,
            observations: observations,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return result;
      } catch (e) {
        console.log("Error getting evalutions");
        return null;
      }
    },

    save: async function () {
      const evaluation = this.evaluation;
      const accordingly = this.accordingly;
      const observations = this.observations;

      const result = await this.updateEvaluation({
        accordingly: accordingly,
        observations: observations,
      });

      if (result) {
        this.evaluation.accordingly = accordingly;
        this.evaluation.observations = observations;
      } else {
        this.accordingly = this.evaluation.accordingly;
        this.observations = this.evaluation.observations;
      }

      this.validate();

      return true;
    },
  },

  computed: {
    errors: function () {
      return this.data.reduce(function (total, el) {
        return el.bad > 0 ? total + el.bad : total;
      }, 0);
    },

    len: function () {
      return this.data.length;
    },

    result: function () {
      if (this.computing) {
        return this.$t("Processing") + "...";
      }
      return this.isAccordingly ? this.$t("Success") : this.$t("Failure");
    },

    resultIcon: function () {
      if (this.computing) {
        return "mdi-reload";
      }

      return this.isAccordingly ? "mdi-check" : "mdi-close";
    },

    isAccordingly: function () {
      return this.accordingly === "2";
    },
  },
};
</script>