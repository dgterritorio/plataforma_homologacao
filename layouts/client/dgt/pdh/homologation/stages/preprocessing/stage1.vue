<template>
  <StageForm
    :title="$t('Management State Form')"
    :actions="actions"
    :record="record"
    :states="states"
    :description="description"
    @close="onClose"
    @submit="onSubmit"
  >
  </StageForm>
</template>
<script>
import StageForm from "@/layouts/client/dgt/pdh/homologation/stages/parts/stagetpl.vue";
import ReviewDocuments from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-documents-req.vue";
import UploadCartography from "@/layouts/client/dgt/pdh/homologation/stages/parts/review-cartography-req.vue";

export default {
  name: "StageTemplate",

  components: {
    StageForm,
    ReviewDocuments,
    UploadCartography
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
        "<p>Para iniciar o processo de homologação da sua cartografia, deve submeter o produto a homologar em conjunto com a restante documentação " +
        "associada.<p>",
        // "<p> Na tabela abaixo existem um conjunto de tarefas a cumprir nesta fase do requerimento. Terá de completar todas as tarefas " +
        // " de modo a poder submeter o formulário.<p>",

      actions: [
        {
          cmp: ReviewDocuments,
          title: this.$t("Upload Documents"),
          description: "Description"
        },
        {
          cmp: UploadCartography,
          title: this.$t("Upload Cartography"),
          description: "Description"
        }
      ]
    };
  },

  methods: {
    onClose: function() {
      this.$emit("close");
    },

    onSubmit: async function(code) {
      this.$emit('submit', code);
    }
  }
};
</script>