<template>
  <StageForm
    :title="$t('Management State Form')"
    :actions="actions"
    :record="record"
    :states="states"
    :description="description"
    @close="onClose"
    @submit="onSubmit"
  ></StageForm>
</template>
<script>
import StageForm from "@/layouts/client/dgt/pdh/homologation/stages/parts/stagetpl.vue";
import ReviewDocuments from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-documents-req.vue";
import UploadCartography from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-cartography-req.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
    UploadCartography,
  },

  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    states: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  data() {
    return {
      description:
        "<p>Após a avaliação da documentação submetida, foi aferido que o processo não se encontra bem instruido. </p><p> Deve seguir as instruções na secção de observações e re-submeter os documentos listados na tabela seguinte.</p>",

      actions: [],
    };
  },

  created: async function () {
    const id = this.record.id;
    const vectorial = this.record.vectorial;

    await this.checkInvalidDocuments(this.record);

    await this.checkInvalidCartography(this.record);
  },

  methods: {
    onClose: function () {
      this.$emit("close");
    },

    onSubmit: async function (code) {
      this.$emit("submit", code);
    },

    requestCartography: async function (record) {
      const requestId = record.id;
      const state = record.code;
      const vectorial = record.vectorial;

      try {
        const result = await this.$axios.post(
          "/api/homologation/cartography/get",
          {
            requestId: requestId,
            state: state,
            vectorial: vectorial,
          }
        );

        if (result.error) {
          throw error;
        }

        return result.data;
      } catch (e) {
        return null;
      }
    },

    requestDocuments: async function (record) {
      const requestId = record.id;

      try {
        const result = await this.$axios.post(
          "/api/homologation/document/getall",
          {
            requestId: requestId,
            filter: [
              {
                property: "invalid",
                operator: "eq",
                value: true,
              },
            ],
          }
        );

        if (result.error) {
          throw error;
        }

        return result.data;
      } catch (e) {
        return null;
      }
    },

    checkInvalidCartography: async function (record) {
      const data = await this.requestCartography(record);

      if (!data) {
        return;
      }

      const carto = data[0];

      const hasUploadFolder = !!carto.upload_link;

      if (hasUploadFolder && this.actions.length < 2) {
        this.actions.push({
          cmp: UploadCartography,
          title: this.$t("Upload Cartography"),
          description: "Description",
        });
      }
    },

    checkInvalidDocuments: async function (record) {
      const data = await this.requestDocuments(record);

      if (!data) {
        return;
      }

      if (data.length && this.actions.length < 1) {
        this.actions.push({
          cmp: ReviewDocuments,
          title: "Upload Documents",
          description: "Description",
          options: {
            allDocuments: false,
            onlyInvalid: true,
          },
        });
      }
    },
  },
};
</script>