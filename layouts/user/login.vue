<template>
  <div>
    <div class="d-flex w-100" style="height: 97vh; justify-content: center; align-items: center;">
      <div class="logotype" :style="`background: url(${$p('/imgs/client-header')});`" />
      <div class="background" :style="`background: url(${$p('/imgs/client-background')});`" />
    </div>
    <client-only>
      <v-navigation-drawer
        v-if="!$auth.user"
        right
        fixed
        app
        permanent
        :mini-variant="!drawerOpen"
        :mini-variant-width="miniSize"
        :width="openSize"
        class="login-drawer"
      >
        <v-list-item>
          <v-list-item-content align="center" justify="center">
            <v-row align="center" justify="center" style="height: 100%">
              <v-col v-if="drawerOpen" sm="12" md="12" lg="12" align-self="center">
                <v-card-title class="login-title">
                  Login
                </v-card-title>
                <v-card-text>
                  <v-form @submit="submitForm" v-model="valid">
                    <v-text-field
                      id="email"
                      v-model="email"
                      name="email"
                      :label="useLDAP ? $t('Username') : $t('Email')"
                      :type="useLDAP ? '' : 'email'"
                      prepend-icon="mdi-account"
                      :placeholder="useLDAP ? $t('Enter username') : $t('Enter email')"
                      :rules="useLDAP ? [rules.required] : [rules.required, rules.email]"
                      validate-on-blur
                      v-on:focus="alert = false"
                    />

                    <v-text-field
                      id="password"
                      v-model="password"
                      name="password"
                      :label="$t('Password')"
                      type="password"
                      prepend-icon="mdi-lock"
                      :rules="[rules.required]"
                      v-on:focus="alert = false"
                    />

                    <v-checkbox v-model="rememberme" :label="$t('Remember me')" />

                    <v-checkbox
                      v-if="hasLDAP"
                      class="ma-0 pa-0"
                      v-model="useLDAP"
                      :label="$t('LDAP')"
                    />

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

                    <v-alert
                      :value="alert"
                      color="pink"
                      dark
                      border="top"
                      icon="mdi-alert-outline"
                      transition="scale-transition"
                      >Incorrect username or password!</v-alert
                    >
                  </v-form>
                </v-card-text>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-navigation-drawer>
    </client-only>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  // middleware: "router",

  data() {
    return {
      drawerOpen: true,
      miniSize: 50,
      openSize: 300,

      valid: false,
      alert: false,
      email: "",
      password: "",
      rememberme: false,
      useLDAP: true,
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
      },
    };
  },

  computed: {
    hasLDAP: function () {
      return this.$store.getters["settings/getUseLDAP"];
    },
  },

  methods: {
    async submitForm(evt) {
      evt.preventDefault();

      const social = this.useLDAP && this.hasLDAP;
      const credentials = {
        email: this.email,
        password: this.password,
        remember: this.rememberme,
        social: social ? "ldap" : null,
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

<style scoped>
.logotype {
  display: block;
  position: absolute;
  width: 500px;
  height: 10vw;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  top: 20px;
  left: 20px;
}
.background {
  display: block;
  max-width: 500px;
  max-height: 500px;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position-y: center !important;
  margin: auto;
  height: 100%;
  width: 100%;
}
.login-drawer {
  box-shadow: 0 6px 11px -5px #00000011,5px 5px 25px 5px rgba(0,0,0,.1);
}
.login-drawer::v-deep .v-navigation-drawer__content{
  display: flex !important;
}
.login-title {
  color: var(--v-primary-base) !important;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 400;
  font-family: 'Poppins,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,Helvetica,Arial,sans-serif';
}
</style>
