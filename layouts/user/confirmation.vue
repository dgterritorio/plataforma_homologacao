<template>
  <ModalAlert
    ref="dialog"
    :error.sync="error"
    :successMsg="$t('Your user account was successfully confirmed!')"
    :errorMsg="$t('Invalid token')"
    :redirect="'/'"
  ></ModalAlert>
</template>

<script>
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

import ModalAlert from "~/components/alerts/modal";

export default {
  name: "Confirmation",

  components: {
    ModalAlert
  },

  props: [
    "token"
  ],

  data() {
    return {
      error: false
    };
  },
  methods: {
    async confirmUser() {
      const token = this.token;

      try {
        const result = await this.$axios.post("/api/auth/confirmation", {
          token: token
        });

        // const data = result.data;

        this.error = !!result.error;

      } catch (e) {

        this.error = true;
      }

      this.$refs.dialog.show();
    }
  },

  mounted() {
    this.confirmUser();
  }
};
</script>

<style></style>
