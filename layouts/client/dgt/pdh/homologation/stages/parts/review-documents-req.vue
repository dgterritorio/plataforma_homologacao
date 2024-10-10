<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Missing Documents')">
        <template v-slot:body>
          <div class="mt-6 mx-6 body-1 text-justify unselectable">
            Nesta tarefa deve submeter todos os documentos obrigatórios e
            essenciais para a tramitação da homologação da cartografia em
            questão. Certifique-se que a lista seguinte não contém nenhum
            documento marcado como obrigatório.
          </div>

          <RemoteTable
            class="my-10 mx-4"
            :headers="columnsMissing"
            :data.sync="documentsMissing"
            :height="null"
            hideFooter
            @upload="onUpload"
          ></RemoteTable>
        </template>
      </FormSection>

      <FormSection :title="$t('Submitted Documents')">
        <template v-slot:body>
          <div class="mt-6 mx-6 body-1 text-justify unselectable">
            Na lista seguinte encontram-se todos os documentos submetidos até ao
            momento. Caso verifique que a submissão do documento se encontra
            incorreta, deve voltar a submeter através do botão "Modificar"
          </div>

          <RemoteTable
            class="my-10 mx-4"
            :headers="columns"
            :data.sync="documents"
            :height="null"
            hideFooter
            @modify="onModify"
          ></RemoteTable>

          <input
            type="file"
            accept=".pdf"
            ref="file"
            style="display: none"
            v-on:change="uploadDocument()"
          />
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
      columnsMissing: [
        {
          text: this.$t("Document Designation"),
          value: "name",
          sortable: false,
          align: "left",
        },
        {
          text: this.$t("File Type"),
          value: "mime_type",
          sortable: false,
          renderer: {
            type: "simple",
            value: "mime_type",
            fn: function (val) {
              return val ? val.split("/")[1] : "";
            },
          },
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
          text: this.$t("Upload"),
          value: "upload",
          renderer: {
            type: "action",
            event: "upload",
            icon: "mdi-upload",
            color: "primary",
          },
        },
      ],

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
          text: this.$t("Modify"),
          value: "upload",
          renderer: {
            type: "action",
            event: "modify",
            icon: "mdi-upload",
            color: "primary",
          },
        },
      ],

      documentsMissing: [],
      documents: [],
    };
  },

  created: function () {
    const record = this.record;

    this.$on("upload", this.onFinishUpload);

    this.loadDocuments(record);
  },

  methods: {
    getReport: function () {
      const valid = this.valid;

      if (valid) {
        return {
          action: this.$t("Upload documents"),
          conclusion: this.$t("Uploaded documents"),
          number: this.documents.length,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Upload documents"),
          conclusion: this.$t("Some documents are missing"),
          number: this.documentsMissing.length,
          advance: false,
        };
      }
    },

    validate: function () {
      this.$emit("validating", true);

      const documents = this.documentsMissing;

      if (documents && !documents.length) {
        this.$emit("updatevalid", true);

        this.$emit("validating", false);

        return;
      }

      let valid = true;

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        if (doc.mandatory) {
          valid = false;

          break;
        }
      }

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    loadDocuments: async function (record) {
      const requestId = record.id;
      const state = record.code;

      let documents = [];

      // Request documents
      const submitted = await this.requestDocuments(record);

      // Request missing
      const missing = await this.requestMissingDocuments(record);

      if (!submitted || !missing) {
        console.log("> Error: fetching documetns");
        return;
      }

      this.documentsMissing = this.correctMissing(submitted, missing);
      this.documents = submitted;

      this.validate();
    },

    correctMissing: function (documents, missing) {
      if (!missing.length || !documents.length) {
        return missing;
      }

      let newMissing = [];

      for (let i = 0; i < missing.length; i++) {
        const m = missing[i];

        const type = m.type;

        const found = documents.findIndex((d) => d.type === type);

        if (found === -1) {
          newMissing.push(m);
        }
      }

      return newMissing;
    },

    addDocument: function (oldDoc, newDoc) {
      if (!oldDoc.version) {
        for (let i = 0; i < this.documentsMissing.length; i++) {
          const missing = this.documentsMissing[i];

          if (missing.type === oldDoc.type) {
            this.documentsMissing.splice(i, 1);

            break;
          }
        }

        this.documents.push(newDoc);
      } else {
        for (let i = 0; i < this.documents.length; i++) {
          const missing = this.documents[i];

          if (missing.type === oldDoc.type) {
            this.documents[i].version = newDoc.version;
            this.documents[i].original_name = newDoc.original_name;
            this.documents[i].signed = newDoc.signed;

            break;
          }
        }
      }

      this.validate();
    },

    onFinishUpload: function (payload) {
      const oldDoc = payload.old;
      const newDoc = payload.new;

      this.addDocument(oldDoc, newDoc);
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