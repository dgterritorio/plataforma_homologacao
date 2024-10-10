<template>
  <!-- <v-container class="d-flex justify-center elevation-1" style="padding:0;"> -->
    <v-card dense :height="size -50" :width="size" :color="color">
      <v-card-title v-if="showTitle" class="unselectable">{{ showTitle ? $t(title) : '' }}</v-card-title>

      <!-- <v-card :color="color" style="height: 75%;"> -->
        <v-card-text style="height: 100%;" class="d-flex justify-center align-center">
          <!-- <v-row align="center" class="headline text-center font-weight-black">
          <v-col class="unselectable" style="padding-top:40px;">-->
          <div class="unselectable headline text-center font-weight-black">{{$t(description)}}</div>
          <!-- </v-col>
          </v-row>-->
        </v-card-text>
      <!-- </v-card> -->
    </v-card>
  <!-- </v-container> -->
</template>


<script>
export default {
  name: "StateInfo",

  props: {
    store: {
      type: String,
      default: "HomologationStateTypes",
    },

    state: {
      type: Number,
      default: -1,
    },

    title: {
      type: String,
      default: "State",
    },

    size: {
      type: Number,
      default: 250,
    },

    showTitle: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      description: null,

      color: null,
    };
  },

  created: async function () {
    this.setInfo(this.state);
  },

  computed: {
    stateInfo: function () {
      const store = this.$store.$db().model(this.store);

      return store.all();
    },
  },

  methods: {
    setInfo: function (state) {
      const info = this.stateInfo.find(function (s) {
        return s.code === state;
      });

      if (info) {
        this.color = info.color;
        this.description = info.description;
      } else {
        this.color = null;
        this.description = null;
      }
    },
  },

  watch: {
    state: {
      handler: function (newVal, oldVal) {
        this.setInfo(newVal);
      },
    },
  },
};
</script>