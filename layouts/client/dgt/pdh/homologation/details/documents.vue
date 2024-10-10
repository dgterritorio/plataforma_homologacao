<template>
  <!-- :title="$t('Tramitation Documents')" -->
  <SimpleDetails :title="$t('Tramitation Documents')">
    <template v-slot:body>
      <LocalTable
        class="ma-6"
        :headers="columns"
        :data.sync="record.documents"
        hideFooter
        :height="null"
        @download="onDownload"
      ></LocalTable>
    </template>
  </SimpleDetails>
</template>
<script>
import LocalTable from "@/components/tables/basic.vue";
import SimpleCard from "@/components/cards/simplecard.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  components: {
    LocalTable,
    SimpleCard,
    SimpleDetails,
  },

  props: {
    record: {
      type: Object,
      handler: function () {
        return {};
      },
    },
  },

  data() {
    return {
      columns: [
        {
          text: this.$t("Document Designation"),
          value: "description",
          align: "left",
          sortable: false,
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
            value: "signed",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
        },
        {
          text: this.$t("Signatory"),
          value: "signer_name",
          hide: true,
          sortable: false,
          renderer: {
            type: "simple",
            value: "signer_name",
            fn: function (value) {
              return value ? value : "Sem signatário";
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
          },
        },
      ],
    };
  },

  methods: {
    onDownload: async function (item) {
      try {
        const requestId = this.record.request.id;

        const result = await this.$axios.post(
          "/api/homologation/document/download",
          {
            documentId: item.id,
            requestId: requestId,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const data = result.data;
        const file = data[0];

        const name = file.name;
        const stream = file.stream;
        const mime = file.mime;

        const a = document.createElement("a");
        a.href = "data:" + mime + ";base64," + escape(stream);
        a.download = name ? name : "document.pdf";
        a.click();
      } catch (e) {
        console.log("Error downloading pdf: ");
      }
    },
  },
};
</script>