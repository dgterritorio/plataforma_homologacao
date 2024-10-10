<template>
  <StageForm
    :title="$t('Formulário de Gestão do Estado do Registo')"
    :actions="actions"
    :record="record"
    :auth="auth"
    :states="states"
    :description="description"
    @close="onClose"
    @submit="onSubmit"
  ></StageForm>
</template>
<script>
import StageForm from "@/layouts/client/dgt/pdh/producers/stages/parts/stagetpl.vue";
import ReviewDocuments from "@/layouts/client/dgt/pdh/producers/stages/parts/review-documents-req.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
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

    auth: {
      type: Object,
      default: function(){
        return {
          email: null,
          password: null
        }
      }
    }
  },

  data() {
    return {
      description:
        "<p>Após a análise da documentação submetida para o registo da mera comunicação prévia, foi detetado a falta de documentos essenciais para tornar o registo oficial.</p>" +
        "<p> Deve ler cuidadosamente a seção de observações e submeter todos os documentos em falta.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Upload Documents"),
          description: "Description",
          options: {
            allDocuments: false,
            onlyInvalid: true,
            baseUrl: '/api/producer/'
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