<template>
  <!-- <v-hover v-slot:default="{ hover }" open-delay="200"> -->
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-card
        :flat="flat"
        class="unselectable font-weight-bold px-4 py-3 homologation-symbol d-flex"
        height="100%"
        v-on="on"
      >
        <v-row style="margin:0" align="center" justify="center">
          <!-- Icon -->
          <v-col
            :sm="expanded ? 1 : 12"
            :md="expanded ? 1 : 12"
            :lg="expanded ? 1 : 12"
            style="padding:0"
          >
            <v-icon medium :color="color">{{icon}}</v-icon>
          </v-col>

          <!-- Divider -->
          <v-col sm="1" md="1" lg="1" style="padding:0" v-if="expanded">
            <v-divider vertical style="height:30px; margin-bottom: 0; margin-top: 0" class="mx-3"></v-divider>
          </v-col>

          <!-- Text -->
          <v-col sm="10" md="10" lg="10" style="padding:0" v-if="expanded">
            <div class="ma-1 body-1 text-center">{{text}}</div>
          </v-col>
        </v-row>
      </v-card>
    </template>

    <span>{{text}}</span>
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
  },

  data() {
    return {
      expand: false,
    };
  },

  computed: {
    shorttext: function () {
      const isExceptional = this.record.exceptional_regime;

      return isExceptional ? "E" : "N";
    },

    text: function () {
      const isExceptional = this.record.exceptional_regime;

      return isExceptional ? "Regime Excepcional" : "Regime Normal";
    },

    color: function () {
      const isExceptional = this.record.exceptional_regime;

      return isExceptional ? "red" : "primary";
    },
    icon: function () {
      const isExceptional = this.record.exceptional_regime;

      return isExceptional ? "mdi-alert-outline" : "mdi-alert-circle-outline";
    },
  },
};
</script>
<style scoped>
/* .homologation-symbol {
    min-height: 50px;
    min-width: 50px;

    max-width: 80px;
  } */
</style>