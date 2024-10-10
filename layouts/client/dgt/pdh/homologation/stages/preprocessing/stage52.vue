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

import Consistency from "@/layouts/client/dgt/pdh/homologation/stages/parts/internal-consistency-analysis.vue";

import Evaluation from "@/layouts/client/dgt/pdh/homologation/stages/parts/internal-evaluation.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,

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

  created: function () {
    const record = this.record;
    const vectorial = record.vectorial ? "V" : "I";
    const type = record.homologation_type === 2 ? "A" : "B";
    const exceptional = record.exceptional_regime ? "E" : "N";
    const specification = record.data_specification;

    const key = vectorial + type + exceptional;

    let actions = [];

    switch (key) {
      // Vectorial A Normal
      case "VAN":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Positional Accuracy"),
            options: {
              evaluationId: 2,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Completude"),
            options: {
              evaluationId: 3,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Thematic Accuracy"),
            options: {
              evaluationId: 4,
            },
          },
        ];
        break;

      // Vectorial B Normal
      case "VBN":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Summary Completude"),
            options: {
              evaluationId: 5,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geographic Positioning Control"),
            options: {
              evaluationId: 10,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Positional Accuracy"),
            options: {
              evaluationId: 11,
            },
          },
        ];

        break;

      // Vectorial A Exceptional
      case "VAE":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Geographic Positioning Control"),
            options: {
              evaluationId: 6,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Summary Completude"),
            options: {
              evaluationId: 5,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Thematic Accuracy"),
            options: {
              evaluationId: 4,
            },
          },
        ];
        break;

      // Vectorial B Exceptional
      case "VBE":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Summary Completude"),
            options: {
              evaluationId: 5,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geographic Positioning Control"),
            options: {
              evaluationId: 10,
            },
          },
          // {
          //   cmp: Evaluation,
          //   title: this.$t("Geographic Positioning Control"),
          //   options: {
          //     evaluationId: 12,
          //   },
          // },
        ];

        // if (specification === 1) {
        //   actions.push();
        // } else if (specification === 2) {
        //   actions.push();
        // }

        break;

      // ------------------------

      // Image A Normal
      case "IAN":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Positional Accuracy"),
            options: {
              evaluationId: 2,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Image Completude"),
            options: {
              evaluationId: 8,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geometric Consistency"),
            options: {
              evaluationId: 7,
            },
          },
        ];
        break;

      // Image B Normal
      case "IBN":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Image Completude"),
            options: {
              evaluationId: 8,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geometric Consistency"),
            options: {
              evaluationId: 7,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geographic Positioning Control"),
            options: {
              evaluationId: 10,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Positional Accuracy"),
            options: {
              evaluationId: 11,
            },
          },
        ];

        // if (specification === 1) {
        //   actions.push();
        // } else if (specification === 2) {
        //   actions.push();
        // }

        break;

      // Image A Exceptional
      case "IAE":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Geographic Positioning Control"),
            options: {
              evaluationId: 6,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Image Completude"),
            options: {
              evaluationId: 8,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geometric Consistency"),
            options: {
              evaluationId: 7,
            },
          },
        ];
        break;

      // Image B Exceptional
      case "IBE":
        actions = [
          {
            cmp: Evaluation,
            title: this.$t("Image Completude"),
            options: {
              evaluationId: 8,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geometric Consistency"),
            options: {
              evaluationId: 7,
            },
          },
          {
            cmp: Evaluation,
            title: this.$t("Geographic Positioning Control"),
            options: {
              evaluationId: 10,
            },
          },
          // {
          //   cmp: Evaluation,
          //   title: this.$t("Geographic Positioning Control"),
          //   options: {
          //     evaluationId: 12,
          //   },
          // }
        ];

        // if (specification === 1) {
        //   actions.push();
        // } else if (specification === 2) {
        //   actions.push();
        // }

        break;
    }

    actions.unshift({
      cmp: Consistency,
      title: this.$t("Consistency Analysis"),
      options: {
        evaluationId: 1,
      },
    });

    this.actions = actions;
  },

  data() {
    return {
      description:
        "<p>Após a análise prévia do processo, foi aferido que a tramitação pode prosseguir para a fase de homologação da cartografia.</p>" +
        "<p>Esta fase divide-se em:" +
        '<ul class="custom-ul"><li>análise da consistência da cartografia (processo automático onde o avaliador deve apenas validar o resultado);</li><li>relatórios de avaliação da cartografia;</li></ul>' +
        "</p>",

      actions: [],
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