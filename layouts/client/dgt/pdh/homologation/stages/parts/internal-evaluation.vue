<template>
  <FormSection :title="title" class="ma-3">
    <template v-slot:body>
      <div class="ma-6 body-1 text-justify unselectable">
        Para cada avaliação deve de assinalar o seu resultado e a data de
        termino da avaliação. No caso da avaliação detetar erros, deve também
        indicar a percentagem de erros.
      </div>

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

      <div class="mx-8">
        <Datefield
          v-if="accordingly !== '0'"
          :options="{ text: $t('Analysis Date'), lg: 4, md: 4, sm: 4 }"
          v-model="evaluation.end_date"
        ></Datefield>
      </div>

      <!-- <ModernSwitch :config="switchCfg" :model="accordingly" @change="accordingly = $event"></ModernSwitch> -->

      <Numberfield
        class="mx-12"
        v-if="accordingly === '1' && requiresPercent"
        :options="{
          text: $t('Error Percentage'),
          validation: ['float'],
          suffix: '%',
          lg: 4,
          md: 4,
          sm: 4,
          model: percentageErrors,
          system: 'pt-PT',
        }"
        :model="percentageErrors"
        v-model="percentageErrors"
      ></Numberfield>

      <div
        v-if="accordingly !== '0' && requiresBudget"
        class="mt-2 ma-6 body-1 text-justify unselectable"
      >
        Insira o valor monetário associado ao trabalho executado.
      </div>

      <Numberfield
        class="mx-12"
        v-if="accordingly !== '0' && requiresBudget"
        :options="{
          text: $t('Fieldwork Budget'),
          validation: ['float'],
          suffix: '€',
          lg: 4,
          md: 4,
          sm: 4,
          model: budget,
          system: 'pt-PT',
        }"
        :model="budget"
        v-model="budget"
      ></Numberfield>

      <div class="mt-2 ma-6 body-1 text-justify unselectable">
        Caso seja necessário, deve também redigir um conjunto de observações que
        ajudem a compreensão do resultado da avaliação.
      </div>

      <Textareafield
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
    </template>
  </FormSection>
</template>
<script>
import Datefield from "@/components/forms/fields/date.vue";
import Textfield from "@/components/forms/fields/text.vue";
import Combobox from "@/components/forms/fields/remotecombobox.vue";
import Textareafield from "@/components/forms/fields/textarea.vue";
import ModernSwitch from "@/layouts/client/dgt/pdh/custom/modern-switch.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import Numberfield from "@/components/forms/fields/number.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";

export default {
  name: "CartographyReview",

  components: {
    Datefield,
    Textfield,
    Textareafield,
    ModernSwitch,
    FormSection,
    Combobox,
    Numberfield,
  },

  mixins: [ActionFormMixin],

  data() {
    return {
      accordingly: null,
      percentageErrors: null,
      budget: null,
      observations: "",
      requiresPercent: false,
      requiresBudget: false,

      switchCfg: {
        valid: {
          label: this.$t("Accordingly"),
          value: "2",
          color: "primary",
          icon: "mdi-check",
        },
        invalid: {
          label: this.$t("Not Accordingly"),
          value: "1",
          color: "red",
          icon: "mdi-close",
        },
      },

      items: [
        { text: this.$t("Accordingly"), value: "2", icon: "mdi-check" },
        { text: this.$t("Not accordingly"), value: "1", icon: "mdi-close" },
      ],

      evaluation: {
        accordingly: null,
        end_date: null,
        observations: "",
        budget: null,
      },
    };
  },

  created: async function () {
    switch (this.options.evaluationId) {
      case 3: // completude
      case 4: // exatidão temática
      case 5: // completude sumária
        this.requiresPercent = true;

      case 2: // exatidao posicional
      case 6: // controlo geogr+afico
      case 7: // consistência geom
      case 10: // controlo geo ndd1
      case 11: // exatidão pos ndd2
      case 12: // controlo geo ndd2
        this.switchCfg["inapplicable"] = {
          label: this.$t("Not Applicable"),
          value: "0",
          color: "orange",
          icon: "mdi-minus",
        };

        this.items.push({
          text: this.$t("Not Applicable"),
          value: "0",
          color: "orange",
          icon: "mdi-minus",
        });

        break;
      default:
        break;
    }

    switch (this.options.evaluationId) {
      case 2: // exatidao posicional
      case 3: // completude
        this.requiresBudget = true;
        break;
      default:
        break;
    }

    const result = await this.requestEvaluation();

    if (result) {
      this.evaluation.end_date = result.end_date
        ? result.end_date.substr(0, 10)
        : null;
      this.evaluation.accordingly = result.accordingly;

      this.accordingly = result.accordingly;
      this.percentageErrors = result.percentage_errors;
      this.observations = result.observations;
      this.budget = result.budget;
    }

    await this.validate();
  },

  methods: {
    validate: async function () {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      let valid = this.accordingly !== null;

      if (this.accordingly !== "0") {
        valid = valid && this.evaluation.end_date !== null;
      }

      if (this.accordingly === "1" && this.requiresPercent) {
        const percent = this.percentageErrors;

        const validPercent = this.validateNumber(percent);

        valid = valid && validPercent;
      }

      if (this.accordingly !== "0" && this.requiresBudget) {
        const budget = this.budget;

        const validBudget = this.validateNumber(budget);

        valid = valid && validBudget; //this.budget !== null && !!this.budget.length;
      }

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    validateNumber: function (value) {
      let valid = false;

      switch (typeof value) {
        case "string":
          valid = !!value.length && !isNaN(value);
          break;
        case "number":
          valid = true;
          break;
        default:
          valid = false;
          break;
      }

      return valid;
    },

    getReport: function () {
      const valid = this.accordingly === "2";

      switch (this.accordingly) {
        case "0":
          return {
            action: this.title,
            conclusion: this.$t("Not Applicable"),
            number: 1,
            advance: true,
          };
          break;
        case "1":
          return {
            action: this.title,
            conclusion: this.$t("Not Accordingly"),
            number: 1,
            advance: false,
          };
          break;
        case "2":
          return {
            action: this.title,
            conclusion: this.$t("Accordingly"),
            number: 1,
            advance: true,
          };
          break;
      }

      // if (valid) {
      //   return {
      //     action: this.title,
      //     conclusion: this.$t("Accordingly"),
      //     number: 1,
      //     advance: true,
      //   };
      // } else {
      //   return {
      //     action: this.title,
      //     conclusion: this.$t("Not Accordingly"),
      //     number: 1,
      //     advance: false,
      //   };
      // }
    },

    requestEvaluation: async function () {
      const record = this.record;

      const stateId = record.state_id;
      const requestId = record.id;
      const evaluationType = this.options.evaluationId;

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
        console.log("Error downloading pdf: ");

        return null;
      }
    },

    updateEvaluation: async function (params) {
      const record = this.record;

      const stateId = record.state_id;
      const requestId = record.id;
      const evaluationType = this.options.evaluationId;
      const accordingly = params.accordingly;
      const endDate = accordingly === "0" ? null : params.endDate;

      const errors =
        accordingly === "1" && this.validateNumber(params.percentageErrors)
          ? params.percentageErrors
          : null;

      const budget =
        accordingly !== "0" && this.validateNumber(params.budget)
          ? params.budget
          : null;

      // const percentageErrors = accordingly !== "1" ? null : errors;
      // const budget = isValidBudget ? params.budget : null;
      const observations = params.observations;

      try {
        const result = await this.$axios.post(
          "/api/homologation/evaluation/set",
          {
            requestId: requestId,
            stateId: stateId,
            evaluationType: evaluationType,
            endDate: endDate,
            accordingly: accordingly,
            percentageErrors: errors,
            budget: budget,
            observations: observations,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return result;
      } catch (e) {
        console.log("Error updating evaluation ");
        return null;
      }
    },

    save: async function () {
      const evaluation = this.evaluation;
      const accordingly = this.accordingly;
      const percentageErrors = this.percentageErrors;
      const budget = this.budget;
      const observations = this.observations;

      const result = await this.updateEvaluation({
        accordingly: accordingly,
        endDate: evaluation.end_date,
        percentageErrors: percentageErrors,
        budget: budget,
        observations: observations,
      });

      if (result) {
        this.evaluation.accordingly = accordingly;
        this.evaluation.percentage_errors = percentageErrors;
        this.evaluation.budget = budget;
        this.evaluation.observations = observations;
      } else {
        this.accordingly = this.evaluation.accordingly;
        this.percentageErrors = this.evaluation.percentageErrors;
        this.budget = this.evaluation.budget;
        this.observations = this.evaluation.observations;
      }

      this.validate();

      return true;
    },
  },
};
</script>