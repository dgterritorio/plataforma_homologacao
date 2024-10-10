<template>
  <v-overlay :absolute="false" :value="enable" :z-index="300" :opacity="opacity" :dark="dark">
    <v-card min-width="300px" height="150" class="loading-card">
      <v-row>
        <v-col>
          <div class="progress-text unselectable">{{msg}}</div>

          <div class="circles-to-rhombuses-spinner" style="margin:auto">
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-overlay>
</template>

<script>
export default {
  name: "modalLoading",

  props: {
    // (string) - Msg to show
    msg: {
      type: String,
      default: function() {
        return this.$t("Please wait");
      }
    },

    opacity: {
      type: Number,
      default: 0.46
    },

    dark: {
      type: Boolean,
      default: true
    },

    show: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      num: 0,
      enable: false
    };
  },

  methods: {
    start: function() {
      this.enable = true;

      this.num = 0;
    },

    finish: function() {
      this.enable = false;
    },

    setMsg: function(msg) {
      this.msg = msg;
    },

    increate: function(n) {
      this.num = n;
    },

    onLoading: function(value) {
      if (value) {
        this.start();
      } else {
        this.finish();
      }
    }
  },

  watch: {
    show: {
      handler: function(value) {
        if (value) {
          this.start();
        } else {
          this.finish();
        }
      }
    }
  }
};
</script>

<style scoped>
.progress-text {
  margin: 15px;
  font-size: 1.5em;
  color: var(--v-primary-base);
  font-weight: 500;
  text-align: center;
}

.circles-to-rhombuses-spinner,
.circles-to-rhombuses-spinner * {
  box-sizing: border-box;
  margin: auto;
}

.circles-to-rhombuses-spinner {
  height: 15px;
  width: calc((25px + 25px * 1.125) * 3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.circles-to-rhombuses-spinner .circle {
  height: 25px;
  width: 25px;
  margin-left: calc(15px * 1.125);
  transform: rotate(45deg);
  border-radius: 10%;
  border: 3px solid var(--v-primary-base);
  overflow: hidden;
  background: transparent;

  animation: circles-to-rhombuses-animation 1200ms linear infinite;
}

.circles-to-rhombuses-spinner .circle:nth-child(1) {
  animation-delay: calc(150ms * 1);
  margin-left: 0;
}

.circles-to-rhombuses-spinner .circle:nth-child(2) {
  animation-delay: calc(150ms * 2);
}

.circles-to-rhombuses-spinner .circle:nth-child(3) {
  animation-delay: calc(150ms * 3);
}

@keyframes circles-to-rhombuses-animation {
  0% {
    border-radius: 10%;
  }

  17.5% {
    border-radius: 10%;
  }

  50% {
    border-radius: 100%;
  }

  93.5% {
    border-radius: 10%;
  }

  100% {
    border-radius: 10%;
  }
}

@keyframes circles-to-rhombuses-background-animation {
  50% {
    opacity: 0.4;
  }
}
</style>
