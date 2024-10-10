<template>
  <v-btn
    v-if="isLoggedIn && hasAccess"
    text
    tile
    color="primary"
    height="100%"
    @click="onClick"
  >
    <v-icon>mdi-bell-outline</v-icon>
  </v-btn>
</template>

<script>
export default {
  methods: {
    onClick: async function () {
      this.$router.push("/user/notifications");
    },
  },

  computed: {
    isLoggedIn: function () {
      return this.$auth.loggedIn;
    },

    hasAccess: function () {
      const isLoggedIn = this.$auth.loggedIn;

      if (isLoggedIn) {
        const routes = this.$store.getters["routes/paths"];

        const foundRoute = routes.find(function (path) {
          return path === "/user/notifications";
        });

        if (foundRoute) {
          return true;
        }
      }

      return false;
    },
  },
};
</script>
