<template>
  <v-row>
    <v-col>
      <FormSection :title="$t('Invoice Issuance')">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Tendo o requerente aceite as condições de homologação, deve emitir a
            fatura com a taxa de homologação e enviar a mesma através do
            contacto do requerente de homologação.
          </div>

          <Numberfield
            ref="clipboardTarget"
            class="mx-6"
            :options="{
              text: $t('Homologation Tax'),
              validation: ['float'],
              suffix: '€',
              lg: 2,
              md: 2,
              sm: 2,
              readonly: true,
              system: 'pt-PT',
            }"
            v-model="receipt.value"
          ></Numberfield>

          <div class="ma-6 body-1 text-justify unselectable">
            Deve também assinalar a data de emissão da fatura.
          </div>

          <div style="margin: 8px">
            <Datefield
              ref="clipboardTarget"
              :options="{
                text: $t('Invoice Emittion Date'),
                lg: 4,
                md: 4,
                sm: 4,
              }"
              :model="receipt.emitted_date"
              v-model="receipt.emitted_date"
            ></Datefield>
          </div>

          <ModernSwitch
            class="mx-3"
            :config="switchCfg"
            :model="invoiceEmitted"
            @change="invoiceEmitted = $event"
          ></ModernSwitch>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
// import Textfield from "@/components/forms/fields/text.vue";
import Datefield from "@/components/forms/fields/date.vue";
import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import ModernSwitch from "@/layouts/client/dgt/pdh/custom/modern-switch.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import Numberfield from "@/components/forms/fields/number.vue";

export default {
  name: "DocumentReview",

  components: {
    Numberfield,
    Datefield,
    ModernSwitch,
    FormSection,
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
        emitted_date: null,
      },

      invoiceEmitted: false,

      switchCfg: {
        valid: {
          color: "primary",
          value: true,
          label: this.$t("Invoice Emitted"),
          icon: "mdi-check",
        },
        invalid: {
          color: "red",
          value: false,
          label: this.$t("Invoice not emitted"),
          icon: "mdi-close",
        },
      },
    };
  },

  created: async function () {
    const receipt = await this.requestReceiptInfo();

    this.receipt = receipt;

    const date = this.receipt.emitted_date;

    if (date) {
      this.receipt.emitted_date = date.substr(0, 10);
    }

    this.invoiceEmitted = !!date;

    this.validate();
  },

  methods: {
    validate: function () {
      this.$emit("validating", true);

      const valid = this.receipt.emitted_date !== null && this.invoiceEmitted;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.valid;

      if (valid) {
        return {
          action: this.$t("Emit Invoice"),
          conclusion: this.$t("Invoice emitted"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Emit Invoice"),
          conclusion: this.$t("Invoice not emitted"),
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

    updateReceiptInfo: async function (params) {
      const receiptId = this.receipt.id;
      const emittedDate = params.emittedDate;

      if (!params.emittedDate) {
        return;
      }

      try {
        const result = await this.$axios.post("/api/homologation/receipt/set", {
          receiptId: receiptId,
          emittedDate: emittedDate,
        });

        if (result.error) {
          throw error;
        }

        return true;
      } catch (e) {
        return false;
      }
    },

    save: async function () {
      const isEmitted = this.invoiceEmitted;
      const date = this.receipt.emitted_date;

      if (!date) {
        return false;
      }
      const result = await this.updateReceiptInfo({ emittedDate: date });

      if (result) {
        this.receipt.emitted_date = date;
      } else {
        this.invoiceEmitted = !!this.receipt.emitted_date;
      }

      return result;
    },
  },
};
</script>