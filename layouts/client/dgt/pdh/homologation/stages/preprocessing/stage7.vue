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
import ReviewDocuments from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-documents-req.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments
  },

  props: {
    record: {
      type: Object,
      default: function() {
        return {};
      }
    },

    states: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },

  data() {
    return {
      description:
        "<p>Após a emissão da fatura referente à taxa de homologação, o requerente deve proceder ao pagamento e submeter um documento comprovativo em como o valor foi liquidado.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t('Invoice Payment Proof')
        }
      ]
    };
  },

  methods: {
    onClose: function() {
      this.$emit("close");
    },

    onSubmit: async function(code) {
      this.$emit("submit", code);
    }
  }
};
</script>