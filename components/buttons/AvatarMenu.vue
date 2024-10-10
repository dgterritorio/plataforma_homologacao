<template>
  <v-menu offset-y auto slide-y-transition>
    <template v-slot:activator="{ on }">
      <v-btn
        data-v-step="app-user-menu"
        :text="text"
        depressed
        tile
        width="170"
        height="100%"
        color="primary"
        v-on="on"
        @click="onClickBtn"
      >
        <client-only>
          <v-avatar size="36px">
            <img alt="Avatar" v-if="user.avatar && user.avatar !== ''" :src="$p(user.avatar)" />
            <v-icon v-else left dark>mdi-account</v-icon>
          </v-avatar>

          <span v-if="user.loggedIn">{{user.name}}</span>
          <span v-else>{{$t('Sign In')}}</span>
        </client-only>
      </v-btn>
    </template>
    <v-list v-if="user.loggedIn">
      <v-list-item v-for="(item, index) in menu" :key="index">
        <v-list-item :to="item.to" router>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="$t(item.title)" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "AvatarMenu",

  props: {
    text: {
      type: Boolean,
      default: true
    }
  },

  methods: {
    onClickBtn: function() {
      if (!this.$auth.loggedIn) {
        this.$router.push("/user/login");
      }
    }
  },

  computed: {
    user() {
      let user;

      if (this.$auth.loggedIn) {
        const userInfo = this.$auth.user;

        user = {
          name: userInfo.name.split(" ")[0],
          avatar: userInfo.avatar,
          loggedIn: true
        };
      } else {
        user = {
          name: "Guest",
          icon: "mdi-user",
          loggedIn: false
        };
      }

      return user;
    },
    menu() {
      let menu = [];

      const loggedIn = this.$auth.loggedIn;

      if (loggedIn) {
        const routes = this.$store.getters["routes/tree"];

        const user_route = routes.find(function(el) {
          return el.route === "user";
        });

        menu = user_route
          ? user_route.children
              .filter(function(route) {
                return !route.hidden;
              })
              .map(function(route) {
                return {
                  icon: route.icon,
                  title: route.title,
                  to: "/" + route.fullroute
                };
              })
          : [];
      }

      return menu;
    }
  }
};
</script>

<style scoped>
</style>
