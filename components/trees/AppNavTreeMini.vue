<template>
  <v-navigation-drawer
    v-model="state"
    permanent
    expand-on-hover
    :mini-variant="miniVariant"
    clipped
    fixed
    app
    dark
    class="no-navigation-boder"
    @input="onStateChange($event)"
  >
    <v-list class="py-0" dense>
      <template v-for="(entry, i) in navtree.filter((c) => !c.hidden)">
        <v-list-item
          v-if="!entry.children.length || !entry.children.reduce(testHidden, 0)"
          :key="i"
          :data-v-step="`app-nav-${i}`"
          :to="entry.fullroute"
          router
          exact
          class="py-2"
        >
          <v-list-item-icon>
            <v-icon>{{ entry.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="$t(entry.title)" />
          </v-list-item-content>
        </v-list-item>

        <v-list-group
          v-else
          :key="i"
          :data-v-step="`app-nav-${i}`"
          :prepend-icon="entry.icon"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-title v-text="$t(entry.title)" />
          </template>

          <v-list-item
            v-for="subentry in entry.children.filter((c) => !c.hidden)"
            :to="'/' + subentry.fullroute"
            :key="subentry.title"
          >
            <!-- <v-list-item-title v-text="subentry.title" /> -->
            <v-list-item-icon>
              <v-icon>{{ subentry.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title v-text="$t(subentry.title)" />
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "AppNavTree",

  props: ["drawer"],

  data() {
    return {
      clipped: false,
      miniVariant: false,
      state: false,
    };
  },

  mounted() {
    this.state = this.drawer;
  },

  methods: {
    onStateChange(state) {
      this.$emit("update:drawer", state);
    },

    testHidden: function (acc, val) {
      return val.hidden ? acc : acc + 1;
    },
  },

  computed: {
    navtree() {
      const tree = this.$store.getters["routes/tree"];

      return tree;
    },
  },

  watch: {
    drawer: {
      handler() {
        this.state = this.drawer;
      },
    },
  },
};
</script>

<style scoped>
.no-navigation-boder >>> .v-navigation-drawer__border {
  display: none;
}
</style>
