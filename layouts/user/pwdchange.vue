<template>
  <div class="row">
    <div class="mx-auto col-md-4 mt-5">
      <v-card-text>
        <v-form @submit="submitForm" v-model="valid">
          <v-text-field
            id="password"
            v-model="password"
            name="password"
            label="New Password"
            type="password"
            prepend-icon="mdi-lock"
            :rules="[rules.required]"
            v-on:focus="alert = false"
          />

          <v-text-field
            id="confirmpassword"
            v-model="confirmpassword"
            name="confirmpassword"
            label="Confirm Password"
            type="password"
            prepend-icon="mdi-lock"
            :rules="[rules.required]"
            v-on:focus="alert = false"
          />
          <v-card-actions>
            <v-btn width="100%" type="submit" variant="primary" :disabled="!valid">Save Password</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </div>

    <ModalAlert
      ref="dialog"
      :error.sync="error"
      :successMsg="$t('Password was changed successfully.')"
      :errorMsg.sync="errorMsg"
      :successRedirect="'/'"
    ></ModalAlert>
  </div>
</template>

<script>
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

import ModalAlert from "~/components/alerts/modal";

export default {
  name: "PwdChangePage",

  components: {
    ModalAlert,
  },

  props: ["token"],

  data() {
    return {
      password: null,
      confirmpassword: null,
      valid: false,
      dialog: false,
      errorMsg: "",
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

      const token = this.token;
      const dialog = this.$refs.dialog;

      // TODO: Validate token on enter view

      const pwd = this.password,
        pwd2 = this.confirmpassword;

      if (pwd !== pwd2) {
        this.errorMsg = this.$t("Passwords do not match");

        this.error = true;

        dialog.show();

        return;
      }

      try {
        const result = await this.$axios.post("/api/auth/pwdchange", {
          token: token,
          password: sha1(pwd).toString(),
        });

        this.error = !!result.error;
      } catch (e) {
        this.error = true;
      }

      if (this.error) {
        this.errorMsg = this.$t("Server side error");
      }

      dialog.show();
    },
  },
};
</script>

<style></style>
