<template>
  <EmailConfirmation :token="token"></EmailConfirmation>
</template>

<script>
import EmailConfirmation from "~/layouts/user/confirmation.vue";

export default {
  components: { EmailConfirmation },
  data() {
    return {
      token: this.$route.params.token
    };
  }
};
</script>
