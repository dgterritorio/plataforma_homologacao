<template>
  <div class="row">
    <div class="mx-auto col-md-4 mt-5">
      <v-card-text>
        <v-form @submit="submitForm" v-model="valid">
          <v-text-field
            id="email"
            v-model="email"
            name="email"
            :label="$t('Recovery Email')"
            type="email"
            prepend-icon="mdi-account"
            :placeholder="$t('Enter email')"
            :rules="[rules.required, rules.email]"
            validate-on-blur
            v-on:focus="alert = false"
          />

          <v-card-actions>
            <v-btn
              width="100%"
              type="submit"
              variant="primary"
              :disabled="!valid"
              >{{ $t("Recover Login") }}</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card-text>
    </div>

    <ModalAlert
      ref="dialog"
      :error.sync="error"
      :successMsg="successMsg"
      :errorMsg="$t('Server error')"
      :redirect="'/user/login'"
    ></ModalAlert>
  </div>
</template>

<script>
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

import ModalAlert from "~/components/alerts/modal";

export default {
  name: "PwdResetPage",

  components: {
    ModalAlert,
  },

  data() {
    return {
      email: "",
      valid: false,
      error: false,
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
      },
    };
  },
  methods: {
    async submitForm(evt) {
      evt.preventDefault();

      const email = this.email;
      const dialog = this.$refs.dialog;

      try {
        const result = await this.$axios.post("/api/auth/pwdreset", {
          email: email,
        });

        this.error = !!result.error;
      } catch (e) {
        // console.log("ERROR: ", e);
        this.error = true;
      }

      dialog.show();
    },
  },

  computed: {
    successMsg: function () {
      return (
        this.$t("A reset password link was sent to the inserted email") + '. ' +
        this.$t(
          "You should receive it within the next minutes"
        ) +
        "."
      );
    },
  },
};
</script>

<style></style>
