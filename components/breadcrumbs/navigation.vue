<template>
  <v-breadcrumbs large v-if="show" :items="items">
    <template v-slot:item="{ item }">
      <!-- @click="goTo(item.href)" -->
      <!-- router exact :to="item.href" -->
      <v-breadcrumbs-item class="unselectable">
        <template v-if="item.text">{{ $t(item.text) }}</template>

        <template v-else>
          <v-icon class="x-medium-icon">{{item.icon}}</v-icon>
        </template>
      </v-breadcrumbs-item>
    </template>

    <template v-slot:divider>
      <v-icon>mdi-chevron-right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      navigation: "",
      items: [],
    };
  },

  created: function () {
    const route = this.$router.currentRoute;

    const path = route.path;

    this.parseRoute(path);
  },

  methods: {
    parseRoute: function (route) {
      if (route === "/") {
        this.show = false;

        return;
      } else {
        this.show = true;
      }

      const splittedPath = route.split("/");

      const crumbs = [];

      let idx = 0;

      if (splittedPath.length) {
        crumbs.push({
          icon: "mdi-home",
          href: "/",
        });
      }

      let build = "";
      let currRoute = this.navtree;
      let wasParameterized = false;

      if (splittedPath.length > 1) {
        for (let i = 1; i < splittedPath.length; i++) {
          const route = splittedPath[i];
          let name = route;

          const routeObj = this.findRouteEntry(route, currRoute);

          build += "/" + route;

          if (routeObj) {
            name = routeObj.title;

            currRoute = routeObj.children;
          } else {
            // Retirar continue para suportar rotas parameterizadas
            continue;
          }

          if (wasParameterized) {
            const entry = crumbs[crumbs.length - 1];

            entry.text += " " + name;
            entry.href += "/" + route;

            wasParameterized = false;
          } else {
            crumbs.push({
              text: name,
              href: build,
            });
          }

          if (routeObj) {
            wasParameterized = routeObj.parameterized;
          }
        }
      }

      this.items = crumbs;
    },

    findRouteEntry: function (name, routes) {
      if (!routes || !Array.isArray(routes)) {
        return null;
      }

      const route = routes.find(function (leaf) {
        return leaf.route === name;
      });

      return route;
    },
  },

  computed: {
    navtree() {
      const tree = this.$store.getters["routes/tree"];

      return tree ? tree : [];
    },
  },

  watch: {
    $route(to, from) {
      const route = to.fullPath;

      this.parseRoute(route);
    },
  },
};
</script>
<style>
.x-medium-icon {
  font-size: 24px !important;
}
</style>