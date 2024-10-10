<template>
  <v-alert
    class="system-msg"
    elevation="5"
    v-model="alert"
    :color="payload.color"
    dark
    :icon="payload.icon"
    transition="scale-transition"
    dismissible
    @dismiss="onDismiss"
  >{{payload.text}}</v-alert>
</template>

<script>
export default {
  props: {
    payload: {},
  },

  data() {
    return {
      alert: false,
      timer: null,
      bluffTimer: null,
    };
  },

  created: function () {
    const me = this;

    const alert = !this.payload.shown;

    if (alert) {
      this.bluffTimer = setTimeout(function () {
        me.alert = alert;
      }, 200);

      this.timer = setTimeout(function () {
        me.alert = false;

        me.$store.commit("MARK_DIALOG_READ", me.payload);
      }, 5200);
    }
  },

  beforeDestroy: function () {
    if (this.bluffTimer) {
      clearTimeout(this.bluffTimer);
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }
  },

  methods: {
    onDismiss: function () {
      if (this.bluffTimer) {
        clearTimeout(this.bluffTimer);
      }

      if (this.timer) {
        clearTimeout(this.timer);
      }
    },
  },

  watch: {
    payload: function (newPayload) {
      const me = this;

      this.alert = true && !newPayload.shown;

      this.timer = setTimeout(function () {
        me.alert = false;

        me.$store.commit("MARK_DIALOG_READ", newPayload);
      }, 5000);
    },
  },
};
</script>