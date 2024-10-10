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
import ReviewCartgography from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-cartography-eval.vue";
import PriorAnalysis from "@/layouts/client/dgt/pdh/homologation/stages/parts/internal-prior-analysis.vue";

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
        "<p>Após a confirmação do pagamento da taxa de homologação, o avaliador deve prosseguir para a análise prévia do requerimento." +
        " Nesta análise, deve aferir se a documentação e a cartografia submetida até ao momento se encontram conforme.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Review Documents"),
          options: {
            allDocuments: true,
          },
        },
        {
          cmp: ReviewCartgography,
          title: this.$t("Review Cartography"),
        },
        {
          cmp: PriorAnalysis,
          title: this.$t("Set Homologation Regime"),
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