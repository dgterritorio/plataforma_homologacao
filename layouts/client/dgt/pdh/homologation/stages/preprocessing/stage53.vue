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
import ReviewWorkArea from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-work-area-eval.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
    ReviewWorkArea,
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
        "<p>Após a correção da cartografia, o avaliador deve validar o termo de responsabilidade e os dados da cartografia submetida.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Review Documents"),
          options: { onlyLast: true },
        },
        {
          cmp: ReviewCartgography,
          title: this.$t("Review Cartography"),
        },
        {
          cmp: ReviewWorkArea,
          title: this.$t("Review Work Area"),
          options: {
            record: this.record,
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