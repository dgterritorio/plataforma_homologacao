<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Invoice Issuance')">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Inserir o valor da taxa aplicável pela tramitação da homologação da
            cartografia.
          </div>

          <Numberfield
            ref="clipboardTarget"
            class="ml-6"
            :options="{
              text: '', //$t('Preço pela prestação de serviços'),
              hint: '150,0',
              placeholer: $t('Digite o valor'),
              suffix: '€',
              validation: ['float'],
              lg: 4,
              md: 4,
              sm: 4,
              isNumber: true,
              system: 'pt-PT',
            }"
            :model="value"
            v-model="value"
          ></Numberfield>

          <!-- <v-btn block text outlined color="primary" @click="onUpdateReceiptInfo">{{$t('Save')}}</v-btn> -->
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import Numberfield from "@/components/forms/fields/number.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

export default {
  name: "DocumentReview",

  components: {
    Numberfield,
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
      },

      value: null,
    };
  },

  created: async function () {
    const receipt = await this.requestReceiptInfo();

    if (receipt) {
      this.receipt = receipt;

      this.value = this.receipt.value;
    }

    this.validate();
  },

  methods: {
    validate: function () {
      this.$emit("validating", true);

      const value = this.receipt.value;

      const valid = value && !isNaN(value);

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.valid;

      if (valid) {
        let value = this.value;

        value = value ? value.toString().replace(".", ",") : value;

        return {
          action: this.$t("Set Tax Value"),
          conclusion: this.$t("Tax Value set") + ": " + value + "€",
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Set Tax Value"),
          conclusion: this.$t("Tax not set"),
          number: 1,
          advance: false,
        };
      }
    },

    requestReceiptInfo: async function () {
      const requestId = this.record.id;
      const stateId = this.record.state_id;

      try {
        const result = await this.$axios.post("/api/homologation/receipt/get", {
          requestId: requestId,
          stateId: stateId,
        });

        if (result.error) {
          throw error;
        }

        return result.data.length ? result.data[0] : null;
      } catch (e) {
        return null;
      }
    },

    updateReceiptInfo: async function (params) {
      const requestId = this.record.id;
      const stateId = this.record.state_id;
      const value = params.value;
      const paidDate = params.paidDate;

      if (!params.value) {
        return;
      }

      const receipt = this.receipt;

      try {
        const result = await this.$axios.post("/api/homologation/receipt/set", {
          receiptId: receipt.id ? receipt.id : null,
          requestId: requestId,
          stateId: stateId,
          value: value,
          paidDate: paidDate,
        });

        if (result.error) {
          throw error;
        }

        const row = result.data[0];

        receipt.value = value;
        receipt.paidDate = paidDate;

        if (!receipt.hasOwnProperty("id") && row && row.hasOwnProperty("id")) {
          receipt.id = row.id;
        }

        return true;
      } catch (e) {
        return false;
      }
    },

    save: async function () {
      const info = { value: this.value };

      const result = await this.updateReceiptInfo(info);

      if (result) {
        this.receipt.value = this.value;

        this.validate();

        return true;
      } else {
        this.value = this.receipt.value;
        return false;
      }
    },
  },
};
</script>