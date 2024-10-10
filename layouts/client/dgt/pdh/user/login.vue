<template>
  <v-row align="center" justify="center">
    <v-col sm="6" md="6" lg="6">
      <img alt :src="$p('/imgs/dgt-logo.png')" class="mb-12" />
    </v-col>

    <v-col sm="4" md="4" lg="4" align-self="center">
      <v-card-text>
        <!-- <v-card-title class="text-h4">{{'Plataforma de Homologação'}}</v-card-title>
        <v-card-subtitle class="text--secondary text-h6">{{'Direção Geral de Território'}}</v-card-subtitle>-->

        <v-form @submit="submitForm" v-model="valid">
          <v-text-field
            id="email"
            v-model="email"
            name="email"
            :label="$t('Email')"
            type="email"
            dense
            outlined
            :rules="[rules.required, rules.email]"
            validate-on-blur
            v-on:focus="alert = false"
          />

          <v-text-field
            id="password"
            v-model="password"
            name="password"
            :label="$t('Password')"
            type="password"
            dense
            outlined
            :rules="[rules.required]"
            v-on:focus="alert = false"
          />

          <v-checkbox v-model="rememberme" :label="$t('Remember me')" />

          <router-link to="/user/pwdreset" class="unselectable">{{
            $t("Forgot password?")
          }}</router-link>

          <v-card-actions>
            <v-layout row wrap align-center>
              <v-flex>
                <v-btn
                  width="100%"
                  type="submit"
                  variant="primary"
                  :disabled="!valid"
                  >{{ $t("Login") }}</v-btn
                >
                <v-divider></v-divider>
                <v-btn width="100%" variant="primary" :to="'/user/register'">{{
                  $t("Register")
                }}</v-btn>
              </v-flex>
            </v-layout>
          </v-card-actions>

          <!-- <v-alert
            :value="alert"
            color="pink"
            dark
            border="top"
            icon="mdi-alert-outline"
            transition="scale-transition"
          >Incorrect username or password!</v-alert>-->
        </v-form>
      </v-card-text>
    </v-col>
  </v-row>
</template>

<script>
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

export default {
  name: "LoginPage",
  // middleware: "router",

  data() {
    return {
      valid: false,
      alert: false,
      email: "",
      password: "",
      rememberme: false,
      rules: {
        required: (value) => !!value || this.$t("Required."),
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || this.$t("Invalid e-mail.");
        },
      },
    };
  },
  methods: {
    async submitForm(evt) {
      evt.preventDefault();
      const credentials = {
        email: this.email,
        password: sha1(this.password).toString(),
        passwordold: md5(this.password).toString(),
        remember: this.rememberme,
      };
      try {
        await this.$auth.loginWith("local", {
          data: credentials,
        });

        const userid = this.$auth.user.id;
        const usergroup = this.$auth.user.group_id;

        // Request new navigation tree
        await this.$store.dispatch("routes/updateUserId", {
          userid: userid,
        });

        const query = this.$router.currentRoute.query;

        if (query && query.redirect) {
          this.$router.push(query.redirect);
        } else {
          this.$router.push("/");
        }

        this.$root.$emit("auth-update", {
          userid: userid,
          usergroup: usergroup,
        });
        // this.$router.push("/");
      } catch (e) {
        this.alert = true;
        // this.$router.push("/login");
      }
    },
  },
};
</script>

<style></style>
