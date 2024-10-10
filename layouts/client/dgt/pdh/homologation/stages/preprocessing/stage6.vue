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
import Payment from "@/layouts/client/dgt/pdh/homologation/stages/parts/emit-payment-eval.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    Payment,
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
        "<p>Após aceitação do valor da taxa, o avaliador deve solicitar ao serviço competente da DGT a emissão da fatura e enviá-la ao requerente.</p>",

      actions: [
        {
          cmp: Payment,
          title: this.$t("Emit Payment"),
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