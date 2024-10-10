<template>
  <!-- <v-hover v-slot:default="{ hover }" open-delay="200"> -->
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-card
        :flat="flat"
        class="unselectable font-weight-bold px-4 pb-3 homologation-symbol"
        v-on="on"
      >
        <v-row style="margin: 0" align="center" justify="center">
          <v-col
            offset="2"
            sm="10"
            md="10"
            lg="10"
            style="padding: 0"
            v-if="!isPreTramitation"
          >
            <div class="text-center body-1">
              {{ "Prazo da Tramitação" + (isSuspended ? " (Suspenso)" : "") }}
            </div>
          </v-col>

          <!-- Icon -->
          <v-col
            :sm="expanded ? 1 : 12"
            :md="expanded ? 1 : 12"
            :lg="expanded ? 1 : 12"
            style="padding: 0"
          >
            <v-icon medium :color="color">{{ icon }}</v-icon>
          </v-col>

          <!-- Divider -->
          <v-col sm="1" md="1" lg="1" style="padding: 0" v-if="expanded">
            <v-divider
              vertical
              style="height: 30px; margin-bottom: 0; margin-top: 0"
              class="mx-3"
            ></v-divider>
          </v-col>

          <!-- Text -->
          <v-col
            sm="10"
            md="10"
            lg="10"
            style="padding: 0"
            v-if="!isPreTramitation"
          >
            <v-progress-linear
              dense
              readonly
              :color="color"
              v-model="progress"
              height="25"
              class="ma-1 body-1 homologation-symbol-progress font-weight-bold body-1"
              :value="value"
            >
              <template v-slot="{ value }">
                <div>{{ Math.ceil(value) + "%" }}</div>
              </template>
            </v-progress-linear>
          </v-col>

          <v-col
            sm="10"
            md="10"
            lg="10"
            style="padding: 0"
            v-if="isPreTramitation"
          >
            <div class="ma-1 body-1 text-center">{{ "Pré-Tramitação" }}</div>
          </v-col>
        </v-row>
      </v-card>
    </template>

    <span>{{ "Prazo para cumprir a homologação da cartografia" }}</span>
  </v-tooltip>
  <!-- </v-hover> -->
</template>

<script>
export default {
  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },

    store: {
      type: String,
      default: "HomologationStateTypes",
    },
  },

  computed: {
    color: function () {
      return this.progress <= 100 ? "primary" : "red"; //this.record.vectorial ? "red" : "primary";
    },

    icon: function () {
      return "mdi-map-clock";
    },

    isPreTramitation: function () {
      const state = this.record.code;

      return state < 50;
    },

    isSuspended: function () {
      return this.record.code === 305;
    },

    value: function () {
      const state = this.record.code;

      const info = this.stateInfo.find(function (s) {
        return s.code === state;
      });

      if (!info) {
        return null;
      }

      return this.record.absolute_processing_time;
    },

    deadline: function () {
      return 90;
    },

    progress: function () {
      if (this.value !== null && this.deadline !== null) {
        return (100 * this.value) / this.deadline;
      } else {
        return 0;
      }
    },

    stateInfo: function () {
      const store = this.$store.$db().model(this.store);

      return store.all();
    },
  },
};
</script>
<style>
.homologation-symbol {
  border-radius: 10px;
}
</style>