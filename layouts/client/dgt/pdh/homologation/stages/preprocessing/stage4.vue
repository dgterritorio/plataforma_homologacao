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
import ReviewDocuments from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-documents-eval.vue";
import ReviewCartography from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-cartography-eval.vue";
import ReviewConditions from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-conditions-eval.vue";
import ReviewHomologationType from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-homologation-type-eval.vue";
import ReviewWorkArea from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-work-area-eval.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
    ReviewCartography,
    ReviewConditions,
    ReviewHomologationType,
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
        "<p>Após a submissão da cartografia a homologar, o avaliador deve aferir se estão reunidos todos os requisitos e se o processo se encontra corretamente instruído. </p> <p> Na secção seguinte encontra-se a lista de documentos submetidos pelo requerente, onde poderá selecionar documentação incorreta. No caso de documentos selecionados, o processo será marcado como 'Incompleto' e devolvido ao requerente.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Review Documents"),
          options: {
            allDocuments: true
          }
        },
        {
          cmp: ReviewCartography,
          title: this.$t("Review Cartography"),
        },
        {
          cmp: ReviewHomologationType,
          title: this.$t("Set Homologation Type"),
        },
        {
          cmp: ReviewConditions,
          title: this.$t("Set Conditions"),
          ignoreValidity: true
        },
        {
          cmp: ReviewWorkArea,
          title: this.$t("Work Area"),
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