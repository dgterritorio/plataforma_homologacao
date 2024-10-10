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
import ReviewConditions from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-conditions-req.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewConditions,
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
        "<p>Após a avaliação da documentação submetida, foi aferido que o processo se encontra bem instruido. </p><p> Em breve será enviado um email com a taxa a ser paga para o inicio da homologação da cartografia.</p>",

      actions: [
        {
          cmp: ReviewConditions,
          title: this.$t("Review Conditons"),
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