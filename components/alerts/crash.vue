<template>
  <client-only>
    <v-dialog v-model="dialog" persistent max-width="350">
      <v-card>
        <v-card-title class="headline unselectable d-flex">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          {{title}}
        </v-card-title>

        <v-card-text class="body-1 unselectable justify-text">{{ msg }}</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn block outlined @click="onClick">
            <v-icon class="mx-2">mdi-refresh</v-icon>
            {{ $t('Refresh Page') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </client-only>
</template>
<script>
export default {
  data() {
    return {
      title: this.$t("Internal Server Error"),

      msg: this.$t(
        "An internal error has occurred in the server. To avoid the risk of inconsistent data, we advise refreshing the page or pressing the refresh button."
      )
    };
  },
  methods: {
    onClick: function() {
      // Reload page
      window.location.reload(true);
    }
  },

  computed: {
    dialog: function() {
      return false;//this.$store.getters["crashed"];
    },

    error: function() {
      return this.$store.getters["crasherror"];
    }
  }
};
</script>
<style scoped>
.justify-text {
  text-align: justify;
  text-justify: inter-word;
}
</style>