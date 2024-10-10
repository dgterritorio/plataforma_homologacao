<template>
  <v-row>
    <v-col>
      <FormSection :title="$t('Review Conditions')">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Deve aceitar ou recusar as condições definidas para o inicio da
            homologação da cartografia. Caso decida recusar, a tramitação passa
            para um estado "Indeferido", terminando de esta forma a progressão
            do processo.
          </div>

          <Numberfield
            ref="clipboardTarget"
            class="ml-6"
            :options="{
              text: $t('Preço pela prestação de serviços'),
              placeholer: $t('Digite o valor'),
              suffix: '€',
              validation: ['float'],
              lg: 2,
              md: 2,
              sm: 2,
              readonly: true,
              system: 'pt-PT',
            }"
            :model="receipt.value"
          ></Numberfield>

          <v-row>
            <ModernSwitch
              :config="switchCfg"
              :model="applicantAccepted"
              @change="onChangeValid($event)"
            ></ModernSwitch>
          </v-row>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import ModernSwitch from "@/layouts/client/dgt/pdh/custom/modern-switch.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import Numberfield from "@/components/forms/fields/number.vue";
import Displayfield from "@/components/forms/fields/display.vue";

export default {
  name: "DocumentReview",

  components: {
    Numberfield,
    ModernSwitch,
    FormSection,
    Displayfield,
  },

  mixins: [ActionFormMixin],

  props: {
    validating: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      receipt: {
        value: null,
        applicant_accepted: null,
      },

      applicantAccepted: false,

      switchCfg: {
        valid: {
          label: this.$t("Accept Conditions"),
          value: true,
          icon: "mdi-check",
        },
        invalid: {
          label: this.$t("Refuse Conditions"),
          value: false,
          icon: "mdi-close",
        },
      },
    };
  },

  created: async function () {
    this.$emit("updatevalid", true);

    const receipt = await this.requestReceiptInfo();

    if (receipt) {
      this.receipt = receipt;

      this.value = receipt.value;

      this.applicantAccepted = receipt.applicant_accepted;
    }

    this.validate();
  },

  methods: {
    validate: function () {
      this.$emit("validating", true);

      const value = this.receipt.value;

      const valid =
        value && !isNaN(value) && this.receipt.applicant_accepted !== null;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.receipt.applicant_accepted;

      if (valid) {
        return {
          action: this.$t("Review Conditions"),
          conclusion: this.$t("Conditions accepted"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Review Conditions"),
          conclusion: this.$t("Conditions refused"),
          number: 1,
          advance: false,
        };
      }
    },

    requestReceiptInfo: async function () {
      const requestId = this.record.id;
      const stateId = this.record.state_id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/receipt/getlast",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw error;
        }

        return result.data.length ? result.data[0] : null;
      } catch (e) {
        return null;
      }
    },

    updateReceiptInfo: async function (receipt) {
      try {
        const result = await this.$axios.post(
          "/api/homologation/receipt/setaccepted",
          receipt
        );

        if (result.error) {
          throw error;
        }

        return true;
      } catch (e) {
        return false;
      }
    },

    save: async function () {
      const id = this.receipt.id;
      const accepted = this.applicantAccepted;

      if (this.receipt.applicant_accepted === accepted) {
        return true;
      }

      const isSaved = await this.updateReceiptInfo({
        receiptId: id,
        accepted: accepted,
      });

      if (isSaved) {
        this.receipt.applicant_accepted = accepted;
      } else {
        accepted = this.receipt.applicant_accepted;
      }

      return isSaved;
    },

    onChangeValid: async function (value) {
      this.applicantAccepted = value;
    },
  },
};
</script>