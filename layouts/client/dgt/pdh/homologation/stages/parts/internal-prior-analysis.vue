<template>
  <v-row>
    <v-col>
      <FormSection :title="$t('Exception Regime')">
        <template v-slot:body>
          <div
            class="ma-6 body-1  text-justify unselectable"
          >Deve analisar a área coberta pela cartografia a homologar e decidir se a tramitação pode ser executada em regime normal.</div>

          <ModernSwitch class="mx-3" :config="switchCfg" :model="exceptional" @change="exceptional = $event"></ModernSwitch>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import Textfield from "@/components/forms/fields/text.vue";
import Datefield from "@/components/forms/fields/date.vue";
import NextcloudMirror from "@/layouts/client/dgt/pdh/custom/nextcloudMirror.vue";
import ModernSwitch from "@/layouts/client/dgt/pdh/custom/modern-switch.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";

export default {
  name: "CartographyReview",

  components: {
    Textfield,
    NextcloudMirror,
    Datefield,
    ModernSwitch,
    FormSection,
  },

  mixins: [ActionFormMixin],

  data() {
    return {
      exceptional: false,

      switchCfg: {
        valid: {
          label: this.$t("Normal Regime"),
          value: false,
          color: "primary",
          icon: "mdi-check-outline",
        },
        invalid: {
          label: this.$t("Exceptional Regime"),
          value: true,
          color: "red",
          icon: "mdi-alert-outline",
        },
      },
    };
  },

  created: async function () {
    this.exceptional = this.record.exceptional_regime;

    await this.validate(true);
  },

  methods: {
    validate: async function (force) {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      const valid = force ? false : this.record.exceptional_regime !== null;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.record.exceptional_regime;

      if (!valid) {
        return {
          action: this.$t("Set Homologation Regime"),
          conclusion: this.$t("Regime set to normal"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Set Homologation Regime"),
          conclusion: this.$t("Regime set to exceptional"),
          number: 1,
          advance: true,
        };
      }
    },

    updateExceptional: async function (flag) {
      const exceptional = flag;
      const requestId = this.record.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/request/setexceptional",
          {
            requestId: requestId,
            exceptional: exceptional,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return true;
      } catch (e) {
        console.log("Error downloading pdf: ");

        return false;
      }
    },

    save: async function () {
      const exceptional = this.exceptional;

      const result = await this.updateExceptional(exceptional);

      if (result) {
        this.record.exceptional_regime = exceptional;
      } else {
        this.exceptional = this.record.exceptional_regime;
      }

      this.validate();

      return true;
    },
  },
};
</script>