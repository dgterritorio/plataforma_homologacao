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
        "<p>Após a validação do documento comprovativo do pagamento da taxa de homologação, foi aferido que este documento encontra-se inválido.</p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t('Invoice Payment Proof'),
          options: {
            onlyInvalid: true
          }
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