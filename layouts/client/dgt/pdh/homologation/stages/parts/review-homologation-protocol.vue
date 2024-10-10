<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Review Work Area')">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Deve definir se a cartografia foi submetida a protocolo.
          </div>

          <v-row style="margin: 0">
            <v-col :sm="12" :md="12" :lg="12" class="mx-0 px-0">
              <ModernSwitch
                :config="switchCfg"
                :model="userInput"
                @change="onChangeValid($event)"
              ></ModernSwitch>
            </v-col>
          </v-row>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import BaseMap from "@/layouts/client/dgt/pdh/homologation/details/map.vue";
import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import ModernSwitch from "@/layouts/client/dgt/pdh/custom/modern-switch.vue";
import Displayfield from "@/components/forms/fields/display.vue";

export default {
  name: "CartographyReview",

  components: {
    BaseMap,
    FormSection,
    ModernSwitch,
    Displayfield,
  },

  mixins: [ActionFormMixin],

  data() {
    return {
      userInput: false,

      protocolPayload: {
        protocol: false,
        requestId: null,
      },

      switchCfg: {
        valid: {
          color: "primary",
          value: true,
          label: this.$t("With Protocol"),
          icon: "mdi-check",
        },
        invalid: {
          color: "primary",
          value: false,
          label: this.$t("Without Protocol"),
          icon: "mdi-close",
        },
      },
    };
  },

  created: async function () {
    const record = this.record;

    const protocolPayload = this.protocolPayload;

    protocolPayload.protocol = record.protocol;
    protocolPayload.requestId = record.id;

    this.userInput = record.protocol;

    await this.validate(true);
  },

  methods: {
    validate: async function (force) {
      this.$emit("validating", true);

      const valid = force ? false : true; //this.userInput;//!this.work_area.recovered && this.work_area.bbox !== null;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.protocolPayload.protocol;

      if (valid) {
        return {
          action: this.$t("Set Protocol"),
          conclusion: this.$t("With Protocol"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Set Protocol"),
          conclusion: this.$t("Without Protocol"),
          number: 1,
          advance: true,
        };
      }
    },

    updateProtocol: async function (withProtocol) {
      const requestId = this.record.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/request/setprotocol",
          {
            requestId: requestId,
            protocol: withProtocol,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.protocolPayload.protocol = withProtocol;

        return true;
      } catch (e) {
        // console.log("Error");

        return false;
      }
    },

    save: async function () {
      const flag = this.userInput;

      const result = await this.updateProtocol(flag);

      if (!result) {
        return false;
      }

      this.validate();

      return true;
    },

    onChangeValid: async function (flag) {
      this.userInput = flag;
    },
  },
};
</script>