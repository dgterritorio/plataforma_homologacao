<template>
  <StageForm
    :title="$t('Formulário de Gestão do Estado do Registo')"
    :actions="actions"
    :record="record"
    :states="states"
    :description="description"
    @close="onClose"
    @submit="onSubmit"
  ></StageForm>
</template>
<script>
import StageForm from "@/layouts/client/dgt/pdh/producers/stages/parts/stagetpl.vue";
import DownloadForm from "@/layouts/client/dgt/pdh/producers/stages/parts/download-form-req.vue";
import ReviewDocuments from "@/layouts/client/dgt/pdh/producers/stages/parts/review-documents-req.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
    DownloadForm
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
        "<p>Após a análise do documento submetido para a cessação de atividade, foi aferido que este documento não se encontra devidamente preenchido.</p>" +
        "<p> Deve ler cuidadosamente a seção de observações e voltar a submeter o formulário de cessação de atividade.</p>",

      actions: [
        {
          cmp: DownloadForm,
          title: this.$t("Download Activity Cessation Form"),
          options: {
            baseUrl: "/api/producer/",
          },
        },
        {
          cmp: ReviewDocuments,
          title: this.$t("Submit Activity Cessation Form"),
          options: {
            onlyInvalid: true,
            baseUrl: "/api/producer/",
          },
        },
      ],
    };
  },

  methods: {
    onClose: function () {
      this.$emit("close");
    },

    onSubmit: async function (code) {
      this.$emit("submit", code);
    },
  },
};
</script>