<template>
  <client-only>
    <v-dialog v-model="dialog" persistent max-width="350">
      <v-card>
        <v-card-title class="headline unselectable d-flex mb-2">
          <v-icon class="mr-2" :color="payload.color">{{
            payload.icon
          }}</v-icon>
          {{ payload.title }}
        </v-card-title>

        <v-card-text class="body-1 unselectable pb-2 justify-text">
          <div v-html="payload.text"></div>
        </v-card-text>

        <v-card-actions>
          <v-btn v-if="payload.cancelText" color="gray" text @click="onCancel">
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            {{ payload.cancelText }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="onClick">
            <!-- <v-icon class="mx-2">mdi-refresh</v-icon> -->
            {{ payload.okText }}
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
      // title: this.$t("Internal Server Error"),
      // msg: this.$t(
      //   "An internal error has occurred in the server. To avoid the risk of inconsistent data, we advise refreshing the page or pressing the refresh button."
      // ),
      dialog: false,
    };
  },
  methods: {
    onCancel: function () {
      this.$store.commit("REMOVE_DIALOGMSG", {});
    },

    onClick: function () {
      const hasUrl = this.payload.hasOwnProperty("url");
      const hasOkFn = this.payload.hasOwnProperty("okFn");

      if (hasOkFn) {
        const fn = this.payload.okFn;
        const params = this.payload.okParams ? this.payload.okParams : {};

        fn(params);
      }

      if (hasUrl) {
        this.$router.push(this.payload.url);
      } else {
        this.dialog = false;
      }

      this.$store.commit("REMOVE_DIALOGMSG", {});
    },
  },

  computed: {
    payload: function () {
      return this.$store.getters["dialogMsg"];
    },
  },

  watch: {
    payload: function (payload) {
      this.dialog = payload.hasOwnProperty("text");
    },
  },
};
</script>
<style scoped>
.justify-text {
  text-align: justify;
  text-justify: inter-word;
}
</style>