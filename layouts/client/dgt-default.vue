<template>
  <v-app dark>
    <!-- Navigation Tree-->
    <client-only>
      <AppNavTree :drawer.sync="drawer"></AppNavTree>
    </client-only>

    <!-- Application bar -->
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="unselectable">
        <router-link to="/" class="toolbar-title">{{title}}</router-link>
      </v-toolbar-title>
      <v-spacer />

      <!-- Avatar menu (login/logout/profile) -->
      <client-only>
        <LangSwitcher></LangSwitcher>
        <NotificationsMenu></NotificationsMenu>
        <AvatarMenu></AvatarMenu>
      </client-only>
    </v-app-bar>

    <!-- Main app container -->
    <v-main>
      <v-container fill-height class="content-main">
        <NavigationCrumbs style="position:absolute; top:0; height:60px"></NavigationCrumbs>
        <nuxt />

        <SystemMsgs></SystemMsgs>
      </v-container>
    </v-main>
    <!-- Footer -->
    <!-- <v-footer :fixed="fixed" app> -->
      <!-- <span>Normas e especificações técnicas de acordo com o Aviso n.º 11918/2019, publicado na 2ª serie do Diário da República, de 24 de julho</span> -->
    <!-- </v-footer> -->

    <!-- Critical alerts -->
    <CrashAlert></CrashAlert>
    <LoadingOverlay></LoadingOverlay>
    <DialogMsgs></DialogMsgs>
  </v-app>
</template>

<script>
import AvatarMenu from "~/components/buttons/AvatarMenu";
import LangSwitcher from "@/layouts/client/dgt/pdh/custom/LangSwitcher";
import AppNavTree from "~/components/trees/AppNavTree";
import NavigationCrumbs from "~/components/breadcrumbs/navigation.vue";
import CrashAlert from "@/components/alerts/crash.vue";
import LoadingOverlay from "@/components/modals/requestloading.vue";
import NotificationsMenu from "@/components/buttons/NotificationsMenu.vue";
import SystemMsgs from "@/components/alerts/system.vue";
import DialogMsgs from "@/components/alerts/dialog.vue";

export default {
  components: {
    AvatarMenu,
    LangSwitcher,
    AppNavTree,
    NavigationCrumbs,
    CrashAlert,
    LoadingOverlay,
    NotificationsMenu,
    SystemMsgs,
    DialogMsgs,
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
    };
  },

  created: function () {
    this.$store.commit("SET_LANG", "pt");
  },

  computed: {
    title() {
      return this.$store.getters["settings/getAppTitle"];
    },
  },
};
</script>

<style scoped>
.toolbar-title {
  outline-style: none;
  color: inherit;
  text-decoration: inherit;
}

.content-main {
  padding-top: 40px;
  max-width: 100% !important;
  /* background: #eee; */
}
</style>
<style>
.unselectable {
  user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
}

.v-card__title {
  word-break: normal !important;
}
</style>
