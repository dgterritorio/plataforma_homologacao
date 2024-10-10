<template>
  <v-row align="center" justify="center">
    <v-col sm="4" md="4" lg="4">
      <v-card-text>
        <v-form @submit="submitForm" v-model="valid">
          <v-text-field
            id="name"
            v-model="user.name"
            name="name"
            label="Name"
            type="name"
            prepend-icon="mdi-tag-text"
            :rules="[rules.required]"
            validate-on-blur
            v-on:focus="alert = false"
          />

          <v-text-field
            id="email"
            v-model="user.email"
            name="email"
            label="Email"
            type="email"
            prepend-icon="mdi-email"
            placeholder="Enter email"
            :rules="[rules.required, rules.email]"
            validate-on-blur
            v-on:focus="alert = false"
          />

          <v-text-field
            id="password"
            v-model="user.password"
            name="password"
            label="Password"
            type="password"
            prepend-icon="mdi-lock"
            :rules="[rules.required]"
            v-on:focus="alert = false"
          />

          <v-card-actions>
            <v-btn width="100%" type="submit" variant="primary" :disabled="!valid">{{$t('Sign Up')}}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-col>

    <ModalAlert
      ref="dialog"
      :error.sync="error"
      :successMsg="$t('Your user account was successfully created. Check your email to validate the email address.')"
      :errorMsg="$t('The email') + user.email + ' ' +$t('is already in use') + '!' "
      :successRedirect="'/user/login'"
    ></ModalAlert>
  </v-row>
</template>

<script>
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

import ModalAlert from "~/components/alerts/modal";

export default {
  name: "RegisterPage",

  components: {
    ModalAlert
  },

  data() {
    return {
      user: {
        name: "",
        email: "",
        password: ""
      },
      error: false,
      valid: false,
      alert: false,
      rules: {
        required: value => !!value || "Required.",
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        }
      }
    };
  },
  methods: {
    async submitForm(evt) {
      evt.preventDefault();

      const user = this.user;
      const dialog = this.$refs.dialog;

      const formData = {
        name: user.name,
        email: user.email,
        password: sha1(user.password).toString()
      };

      try {
        const result = await this.$axios.post("/api/auth/register", {
          user: formData
        });

        const data = result.data;

        this.error = !!data.error;
      } catch (e) {
        // console.log("ERROR: ", e);
        this.error = true;
      }

      dialog.show();
    }
  }
};
</script>

<style></style>
