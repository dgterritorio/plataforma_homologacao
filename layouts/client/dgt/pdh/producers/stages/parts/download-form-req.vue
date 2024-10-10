<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Download Activity Cessation Form')">
        <template v-slot:body>
          <div class="mt-6 mx-6 body-1 text-justify unselectable">
            Nesta tarefa deve descarregar e guardar o formulário de cessação de atividade. O formulário deve ser assinado digitalmente e submetido
            na tarefa seguinte.
          </div>

          <v-row class="mt-6">
            <v-col offset="1" sm="11" md="11" lg="11">
              <v-btn color="primary" @click="onCessationForm">{{$t('Download Form')}}</v-btn>
            </v-col>
          </v-row>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import DocumentsMixin from "@/layouts/client/dgt/pdh/mixins/documents.js";

export default {
  name: "DocumentReview",

  components: {
    FormSection,
  },

  mixins: [ActionFormMixin, DocumentsMixin],

  data() {
    return {};
  },

  created: function () {
    const record = this.record;

    this.$emit("updatevalid", true);
  },

  methods: {
    getReport: function () {
      const valid = this.valid;

      // if (valid) {
      return {
        action: this.$t("Form Download"),
        conclusion: this.$t("Form Downloaded"),
        number: 1,
        advance: true,
      };
      // } else {
      //   return {
      //     action: this.$t("Upload documents"),
      //     conclusion: this.$t("Some documents are missing"),
      //     number: this.documentsMissing.length,
      //     advance: false,
      //   };
      // }
    },

    validate: function () {
      this.$emit("validating", true);

      let valid = true;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    onCessationForm: async function () {
      const record = this.record;

      const cessation = {
        name: record.name,
        vat: record.vat,
        address: record.address,
        locality: record.locality,
        zipcode: record.zipcode,
        county: record.county,
        phone: record.phone,
        email: record.email,
        url: record.url,
      };

      try {
        const result = await this.$axios.post(
          "/api/templates/download",
          {
            template: "cancel-producer",
            record: cessation,
          },
          {
            progress: true,
          }
        );

        const file = result.data[0];

        const { stream, name } = file;

        const a = document.createElement("a");
        a.href = "data:application/pdf;base64," + escape(stream);
        a.download = name ? name : "document.pdf";
        a.click();
      } catch (e) {
        console.log("Error while downloading template");
      }
    },
  },

  // watch: {
  //   record: {
  //     deep: true,
  //     handler: function (newRecord) {
  //       this.loadDocuments(newRecord);
  //     },
  //   },
  // },
};
</script>