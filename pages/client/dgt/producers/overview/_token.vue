<template>
  <ProducerInfo :token="token"></ProducerInfo>
</template>

<script>
import ProducerInfo from "~/layouts/client/dgt/pdh/producers/overview/producer.vue";

export default {
  components: { ProducerInfo },
  data() {
    return {
      token: this.$route.params.token
    };
  }
};
</script>
