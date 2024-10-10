<template>
  <client-only>
    <v-row class="system-msg-wrapper shrinked-row">
      <v-col sm="12" md="12" lg="12">
        <SystemMsg :payload="m" v-for="(m, i) in messages" :key="'message-' + i"></SystemMsg>
      </v-col>
    </v-row>
  </client-only>
</template>

<script>
import SystemMsg from "@/components/alerts/msg.vue";

export default {
  components: {
    SystemMsg,
  },
  data() {
    return {
      alert: false,
      text: "lispsurma mrajrn ianrjai naijnr ijan ijaniri jn",
      timer: null,
      uuid: 0,
      //   messages: [],
      timers: {},
      limit: 3,
      timeout: 5000,
    };
  },

  computed: {
    messages: function () {
      return this.$store.getters["systemMsgs"];
    },
  },
};
</script>
<style scoped>
.system-msg-wrapper {
  position: fixed;
  bottom: 30px;
  z-index: 500;
  right: 30px;

  pointer-events: none;
}

.system-msg {
  pointer-events: all;
}
</style>