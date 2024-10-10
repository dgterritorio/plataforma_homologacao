<template>
  <v-dialog v-model="dialog" max-width="290">
    <v-card>
      <v-card-title class="headline">{{title}}</v-card-title>

      <v-card-text>{{msg}}</v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn v-if="!persist" color="green darken-1" text @click="onDialogClose">{{$t("Close")}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ModalAlert",

  props: [
    "errorMsg",
    "successMsg",
    "successRedirect",
    "errorRedirect",
    "redirect",
    "persist",
    "error"
  ],

  data() {
    return {
      dialog: false,
      msg: "",
      title: ""
    };
  },

  created: function() {
    if (this.error) {
      this.msg = this.errorMsg;
      this.title = this.$t("Error");
    } else {
      this.msg = this.successMsg;
      this.title = this.$t("Success");
    }
  },

  methods: {
    show: function() {
      this.dialog = true;
    },
    hide: function() {
      this.dialog = false;
    },
    onDialogClose: function() {
      this.hide();

      if (this.redirect) {
        this.$router.push(this.redirect);
      } else if (this.successRedirect && !this.error) {
        this.$router.push(this.successRedirect);
      } else if (this.errorRedirect && this.error) {
        this.$router.push(this.errorRedirect);
      }
    }
  },

  watch: {
    error: {
      handler: function(val) {
        if (val) {
          this.msg = this.errorMsg;
          this.title = this.$t("Error");
        } else {
          this.msg = this.successMsg;
          this.title = this.$t("Success");
        }
      }
    }
  }
};
</script>