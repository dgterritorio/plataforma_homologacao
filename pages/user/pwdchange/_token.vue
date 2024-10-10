<template>
  <UserPwdChange :token.sync="token"></UserPwdChange>
</template>

<script>
import UserPwdChange from "~/layouts/user/pwdchange.vue";

export default {
  components: { UserPwdChange },
  data() {
    return {
      token: this.$route.params.token
    };
  }
};
</script>