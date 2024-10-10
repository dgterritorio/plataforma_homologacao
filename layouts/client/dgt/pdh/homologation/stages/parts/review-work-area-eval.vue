<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Review Work Area')">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Deve rever se a área afetada pela cartografia foi extraída com
            sucesso. A extração da área é um processo automático que pode
            demorar algum tempo para cartografia de elevado volume. Pressione
            "Refrescar" para atualizar o estado da extração da área.
          </div>

          <v-row style="margin: 0">
            <v-col :sm="12" :md="12" :lg="12">
              <BaseMap :record="mapPayload" height="300"></BaseMap>
              <v-btn
                class="mt-2"
                outlined
                block
                @click="requestCartography(record)"
              >
                <v-icon>{{ "mdi-refresh" }}</v-icon>
                {{ $t("Refresh State") }}
              </v-btn>
            </v-col>

            <v-col :sm="12" :md="12" :lg="12" class="mt-4 mx-0 px-0">
              <div class="ma-3 mx-6 mt-0 body-1 text-justify unselectable">
                Deve assinalar uma das opções seguintes:
              </div>

              <ModernSwitch
                :config="switchCfg"
                :model="userAccepted"
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

export default {
  name: "CartographyReview",

  components: {
    BaseMap,
    FormSection,
    ModernSwitch,
  },

  mixins: [ActionFormMixin],

  data() {
    return {
      work_area: {
        recovered: false,
        bbox: null,
      },

      userAccepted: false,

      mapPayload: {
        cartography: {},
        request: {},
      },

      switchCfg: {
        valid: {
          color: "primary",
          value: true,
          label: this.$t("Work Area Recovered"),
          icon: "mdi-check",
        },
        invalid: {
          color: "red",
          value: false,
          label: this.$t("Work Area Not Recovered"),
          icon: "mdi-close",
        },
      },
    };
  },

  created: async function () {
    const record = this.record;

    this.mapPayload.request.vectorial = record.vectorial;
    this.mapPayload.request.id = record.id;

    await this.requestCartography(record);

    this.userAccepted =
      this.work_area.recovered === true && this.work_area.bbox !== null;

    await this.validate(!this.userAccepted);
  },

  methods: {
    validate: async function (force) {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      const valid = force ? false : true; //this.userAccepted;//!this.work_area.recovered && this.work_area.bbox !== null;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.userAccepted;

      if (valid) {
        return {
          action: this.$t("Review Work Area"),
          conclusion: this.$t("Work Area Recovered"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Review Work Area"),
          conclusion: this.$t("Work Not Area Recovered"),
          number: 1,
          advance: false,
        };
      }
    },

    // requestWorkAreaRecovery: async function () {
    //   return { recovered: false, bbox: {} };
    // },

    requestCartography: async function (record) {
      try {
        this.mapPayload.cartography = {};

        const requestId = record.id;
        const vectorial = record.vectorial;

        const result = await this.$axios.post(
          "/api/homologation/cartography/get",
          {
            requestId: requestId,
            vectorial: vectorial,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const carto = result.data[0];

        this.mapPayload.cartography = carto;

        this.work_area = {
          recovered: carto.work_area_recovered,
          bbox: carto.bbox,
        };
      } catch (e) {
        console.log("Error on fetching request cartography");
      }
    },

    updateRecovered: async function (recovered) {
      const vectorial = this.record.vectorial;
      const cartography = this.mapPayload.cartography;

      try {
        const result = await this.$axios.post(
          "/api/homologation/cartography/setworkarea",
          {
            cartographyId: cartography.id,
            vectorial: vectorial,
            recovered: recovered,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return true;
      } catch (e) {
        // console.log("Error");

        return false;
      }
    },

    save: async function () {
      const flag = this.userAccepted;

      const result = await this.updateRecovered(flag);

      if (!result) {
        return false;
      }

      this.validate();

      return true;
    },

    onChangeValid: async function (flag) {
      this.userAccepted = flag;
    },
  },

  computed: {
    recovery_result: function () {
      return this.work_area.bbox
        ? this.$t("Area Recovered")
        : this.$t("Area not recovered");
    },
    recovery_result_icon: function () {
      return this.work_area.bbox ? "mdi-check" : "mdi-close";
    },
  },
};
</script>