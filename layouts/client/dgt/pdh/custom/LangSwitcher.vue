<template>
  <v-menu :offset-y="true">
    <template v-slot:activator="{ on }">
      <v-btn text depressed tile color="primary" height="100%" dark v-on="on">
        <img :src="$p(`/flags_iso/24/${$i18n.locale}.png`)" alt="flag " />
        <span>{{ $i18n.locale.toUpperCase() }}</span>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="(locale, index) in locales" :key="index" @click="onSwitchLang(locale)">
        <img :src="$p(`/flags_iso/24/${locale}.png`)" alt="flag " />
        <v-list-item-title>{{ locale.toUpperCase() }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "LangSwitcher",

  data(){
    return {
      locales: ['pt']
    }
  },

  methods: {
    onSwitchLang: async function(lang) {
      // let res = await this.$axios.post("/api/auth/locale", {
      //   lang: lang
      // });

      // if (res) {
      //   this.$i18n.locale = lang;
      // }
    }
  }
};
</script>
