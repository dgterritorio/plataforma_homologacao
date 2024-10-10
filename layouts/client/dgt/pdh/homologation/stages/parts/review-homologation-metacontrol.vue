<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Review Work Area')">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Deve definir se a tramitação deve incluir a avaliação de
            metacontrolo.
          </div>

          <v-row style="margin: 0">
            <v-col :sm="12" :md="12" :lg="12">
              <Displayfield
                class="mx-6"
                :options="{
                  text: `${$t('Request Has Supervisory Report')}?`,
                }"
                :model="hasSupervisory"
              ></Displayfield>
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" class="mx-0 px-0">
              <div class="ma-3 mx-6 mt-0 body-1 text-justify unselectable">
                Deve assinalar uma das opções seguintes:
              </div>

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

      metacontrolPayload: {
        metacontrol: false,
        requestId: null,
        hasSupervisory: false,
      },

      switchCfg: {
        valid: {
          color: "primary",
          value: true,
          label: this.$t("With Metacontrol"),
          icon: "mdi-check",
        },
        invalid: {
          color: "primary",
          value: false,
          label: this.$t("Without Metacontrol"),
          icon: "mdi-close",
        },
      },
    };
  },

  created: async function () {
    const record = this.record;

    const metacontrolPayload = this.metacontrolPayload;

    metacontrolPayload.metacontrol = record.metacontrol;
    metacontrolPayload.requestId = record.id;

    this.userInput = record.metacontrol;

    await this.requestHasSupervisory(metacontrolPayload);

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
      const valid = this.metacontrolPayload.metacontrol;

      if (valid) {
        return {
          action: this.$t("Set Metacontrol"),
          conclusion: this.$t("With Metacontrol"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Set Metacontrol"),
          conclusion: this.$t("Without Metacontrol"),
          number: 1,
          advance: true,
        };
      }
    },

    requestHasSupervisory: async function (record) {
      try {
        const requestId = record.requestId;

        const result = await this.$axios.post(
          "/api/homologation/request/gethassupervisory",
          {
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const { has_supervisory } = result.data[0];

        this.metacontrolPayload.hasSupervisory = has_supervisory;
      } catch (e) {
        console.log("Error on fetching request supervisory check");

        this.metacontrolPayload.hasSupervisory = null;
      }
    },

    updateMetacontrol: async function (withMetacontrol) {
      const requestId = this.record.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/request/setmetacontrol",
          {
            requestId: requestId,
            metacontrol: withMetacontrol,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.metacontrolPayload.metacontrol = withMetacontrol;

        return true;
      } catch (e) {
        // console.log("Error");

        return false;
      }
    },

    save: async function () {
      const flag = this.userInput;

      const result = await this.updateMetacontrol(flag);

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

  computed: {
    hasSupervisory: function () {
      return this.metacontrolPayload.hasSupervisory
        ? this.$t("Yes")
        : this.$t("No");
    },
  },
};
</script>