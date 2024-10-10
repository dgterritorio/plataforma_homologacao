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
import ReviewDocuments from "@/layouts/client/dgt/pdh/producers/stages/parts/review-documents-eval.vue";

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
  },

  data() {
    return {
      description:
        "<p>Após a submissão da documentação referente ao registo da mera comunicação prévia, o avaliador deve aferir se estão reunidos todos os requisitos para tornar este registo oficial.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Review Documents"),
          options: {
            allDocuments: true,
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