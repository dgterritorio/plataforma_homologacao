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

import Consistency from "@/layouts/client/dgt/pdh/homologation/stages/parts/internal-consistency-review.vue";

import Evaluation from "@/layouts/client/dgt/pdh/homologation/stages/parts/internal-evaluation.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
    UploadCartography,

    Consistency,
    Evaluation,
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
        "<p>Após verificação da cartografia foram detetadas inconformidades nos dados submetidos.</p>" +
        "<p>Deve ler cuidadosamente a seção de observações da homologação e completar dados em falta na tabela de tarefas.</p>" +
        "<p>Consulte o Histórico do requerimento para obter o resultado do procedimento aplicado à cartografia.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Upload Documents"),
        },
      ],
    };
  },

  created: async function () {
    const record = this.record;

    await this.checkInvalidCartography(record);
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

    checkInvalidCartography: async function (record) {
      const data = await this.requestCartography(record);

      if (!data) {
        return;
      }

      const carto = data[0];

      const hasUploadFolder = !!carto.upload_link;

      if (hasUploadFolder && this.actions.length < 2) {
        this.actions.unshift({
          cmp: UploadCartography,
          title: this.$t("Upload Cartography"),
          description: "Description",
        });

        // this.actions.unshift({
        //   cmp: Consistency,
        //   title: this.$t("Consistency Analysis"),
        //   options: {
        //     evaluationId: 1,
        //   },
        // });
      }
    },
  },
};
</script>