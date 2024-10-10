<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Review Documents')">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Deve analisar o(s) documento(s) e em caso de conformidade assinalar
            a checkbox da tabela seguinte.
          </div>

          <RemoteTable
            class="mt-6"
            :headers="columns"
            :data.sync="documents"
            :height="null"
            hideFooter
            @download="onDownload"
            @changeinvalid="onChangeInvalid"
          ></RemoteTable>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import RemoteTable from "@/components/tables/basic.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import DocumentsMixin from "@/layouts/client/dgt/pdh/mixins/documents.js";

export default {
  name: "DocumentReview",

  components: {
    RemoteTable,
    FormSection,
  },
  mixins: [ActionFormMixin, DocumentsMixin],

  data() {
    return {
      columns: [
        {
          text: this.$t("Document Designation"),
          value: "description",
          sortable: false,
          align: "left",
        },
        {
          text: this.$t("Mandatory"),
          value: "mandatory",
          sortable: false,
          renderer: {
            type: "simple",
            value: "mandatory",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
        },
        {
          text: this.$t("Upload Date"),
          value: "creation_date",
          sortable: false,
          renderer: {
            type: "simple",
            value: "creation_date",

            fn: function (value) {
              return value ? value.split("T")[0] : "";
            },
          },
        },
        {
          text: this.$t("File Version"),
          value: "version",
          sortable: false,
        },
        {
          text: this.$t("File Name"),
          value: "original_name",
          sortable: false,
        },
        {
          text: this.$t("Digitally Signed"),
          value: "signed",
          sortable: false,
          renderer: {
            type: "simple",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
          sortable: false,
        },
        {
          text: this.$t("Signatory"),
          value: "signer_name",
          sortable: false,
          hide: true,
          renderer: {
            type: "simple",
            value: "signer_name",
            fn: function (value) {
              return !value || value.length === 0 ? "Sem signatário" : value;
            },
          },
        },
        {
          text: this.$t("Download"),
          value: "download",
          sortable: false,
          renderer: {
            type: "action",
            event: "download",
            icon: "mdi-download",
            color: "primary",
          },
        },
        {
          text: this.$t("According"),
          value: "invalid",
          sortable: false,
          renderer: {
            type: "checkbox",
            negate: true,
            event: "changeinvalid",
          },
        },
      ],

      documents: [],
    };
  },

  created: async function () {
    const record = this.record;

    await this.loadDocuments(record);

    // const nValid = this.documents.reduce(function (count, doc) {
    //   return !doc.invalid ? count + 1 : count;
    // }, 0);

    // const forceInvalid = nValid === 0;

    this.validate(true);
  },

  methods: {
    validate: function (force) {
      this.$emit("validating", true);

      const valid = force ? false : true;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const nInvalid = this.documents.reduce(function (count, doc) {
        return doc.invalid ? count + 1 : count;
      }, 0);

      if (nInvalid === 0) {
        return {
          action: this.$t("Review documents"),
          conclusion: this.$t("Documents Accordingly"),
          number: this.documents.length,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Upload documents"),
          conclusion: this.$t("Some documents are not accordingly"),
          number: nInvalid,
          advance: false,
        };
      }
    },

    loadDocuments: async function (record) {
      const requestId = record.requestId;
      const state = record.code;

      let documents = [];

      // Request documents
      const result = await this.requestDocuments(record);

      if (!result) {
        return;
      }

      this.documents = result;

      this.$emit("updatevalid", true);
    },

    onChangeInvalid: async function (item) {
      try {
        const result = await this.$axios.post(
          "/api/homologation/document/setinvalid",
          {
            documentId: item.id,
            invalid: item.invalid,
          }
        );

        if (result.error) {
          throw result.error;
        }
      } catch (e) {
        console.log("Error downloading pdf: ");
      }
    },
  },

  watch: {
    record: {
      deep: true,
      handler: function (newRecord) {
        this.loadDocuments(newRecord);
      },
    },
  },
};
</script>