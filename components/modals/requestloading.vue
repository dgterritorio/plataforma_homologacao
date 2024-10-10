<template>
  <LoadingOverlay :msg="msg" :show="isLoading"></LoadingOverlay>
</template>
<script>
import LoadingOverlay from "@/components/modals/loading.vue";

export default {
  components: {
    LoadingOverlay
  },

  data(){
      return {
          msg: this.$t('Processing Request')
      }
  },
  computed: {
    isLoading: function() {
      return this.$store.getters["loading"];
    }
  }
};
</script>