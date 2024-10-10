<template>
  <FormSection :title="title" class="ma-3">
    <template v-slot:body>
      <div class="ma-6 body-1  text-justify unselectable">
        Deve verificar o resultado da análise de consistência da cartografia em questão.
      </div>

      <v-row>
        <v-col offset="1" :sm="5" :md="5" :lg="5">
          <DisplayField class="mx-6" :options="{text: $t('Analysis Result')}" :model="result">
            <template v-slot:prefix>
              <v-icon :color="computing || accordingly ? 'primary' : 'red'">{{resultIcon}}</v-icon>
            </template>
          </DisplayField>
        </v-col>

        <v-col :sm="5" :md="5" :lg="5">
          <DisplayField
            v-if="!computing"
            class="mx-6"
            :options="{text: $t('Number of Errors')}"
            :model="errors + ' ' + (errors !== 1 ? $t('errors') : $t('error'))"
          ></DisplayField>
        </v-col>
      </v-row>

      <div class="ma-6 body-1  text-justify unselectable">
        A tabela seguinte lista todas as regras utilizadas
        para avaliar a consistência da cartografia.
      </div>

      <RemoteTable :height="400" :headers="columns" :data="data" hideFooter></RemoteTable>
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

export default {
  name: "CartographyReview",

  components: {
    RemoteTable,
    ModernSwitch,
    FormSection,
    DisplayField,
  },

  mixins: [ActionFormMixin, CartographyMixin],

  data() {
    return {
      validationResult: false,
      validating: false,
      validationResult: true,

      accordingly: false,

      computing: false,

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

    await this.validate();
  },

  methods: {
    validate: async function () {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      const valid = true; //this.errors === 0;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.errors === 0;

      if (valid) {
        return {
          action: this.$t("Review Consistency Analysis"),
          conclusion: this.$t("Consistency Analysis Reviewed"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Review Consistency Analysis"),
          conclusion: this.$t("Consistency Analysis Not Reviewed"),
          number: 1,
          advance: true,
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
      return this.accordingly ? this.$t("Success") : this.$t("Failure");
    },

    resultIcon: function () {
      if (this.computing) {
        return "mdi-reload";
      }

      return this.accordingly ? "mdi-check" : "mdi-close";
    },
  },
};
</script>