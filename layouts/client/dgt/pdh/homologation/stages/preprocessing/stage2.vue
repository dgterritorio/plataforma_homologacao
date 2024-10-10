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
import ReviewMetacontrol from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-homologation-metacontrol.vue";
import ReviewProtocol from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-homologation-protocol.vue";
import ReviewWorkArea from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-work-area-eval.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
    ReviewCartography,
    ReviewConditions,
    ReviewHomologationType,
    ReviewMetacontrol,
    ReviewProtocol
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
        "<p>Após a submissão da cartografia a homologar, o avaliador deve aferir se estão reunidos todos os requisitos e se " +
        "o processo se encontra corretamente instruído. </p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Review Documents"),
          options: {
            allDocuments: true,
          },
        },
        {
          cmp: ReviewCartography,
          title: this.$t("Review Cartography"),
        },
        {
          cmp: ReviewWorkArea,
          title: this.$t("Review Work Area"),
          options: {
            record: this.record
          }
        },
        {
          cmp: ReviewHomologationType,
          title: this.$t("Set Homologation Type"),
        },
        {
          cmp: ReviewConditions,
          title: this.$t("Set Homologation Tax Value"),
          ignoreValidity: true,
        },
        {
          cmp: ReviewMetacontrol,
          title: this.$t("Set Metacontrol"),
        },
        {
          cmp: ReviewProtocol,
          title: this.$t("Set Protocol"),
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