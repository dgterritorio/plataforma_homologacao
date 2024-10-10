<template>
  <!-- <v-hover v-slot:default="{ hover }" open-delay="200"> -->
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-card
        :color="color"
        class="unselectable font-weight-bold px-4 py-3 homologation-symbol d-flex"
        height="100%"
        v-on="on"
      >
        <v-row style="margin:0" align="center" justify="center">
          <!-- Icon -->

          <!-- <v-col offset="2" sm="10" md="10" lg="10" style="padding:0" v-if="expanded">
            <div class="ma-1 body-1 text-center">{{'Estado da Tramitação'}}</div>
          </v-col>-->

          <v-col
            :sm="expanded ? 1 : 12"
            :md="expanded ? 1 : 12"
            :lg="expanded ? 1 : 12"
            style="padding:0"
          >
            <v-icon medium>{{icon}}</v-icon>
          </v-col>

          <!-- Divider -->
          <v-col sm="1" md="1" lg="1" style="padding:0" v-if="expanded">
            <v-divider vertical style="height:30px; margin-bottom: 0; margin-top: 0" class="mx-3"></v-divider>
          </v-col>

          <!-- Text -->
          <v-col sm="10" md="10" lg="10" style="padding:0" v-if="expanded">
            <div class="ma-1 body-1 font-weight-bold text-center">{{text}}</div>
          </v-col>
        </v-row>
      </v-card>
    </template>

    <span>{{'Estado da Tramitação'}}</span>
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
      default: true,
    },

    store: {
      type: String,
      default: "HomologationStateTypes",
    },

    state: {
      type: Number,
      default: -1,
    },

    size: {
      type: Number,
      default: null,
    },
  },

  computed: {
    text: function () {
      const state = this.state;

      const info = this.stateInfo.find(function (s) {
        return s.code === state;
      });

      if (info) {
        return info.description;
      } else {
        return null;
      }
    },

    color: function () {
      const state = this.state;

      const info = this.stateInfo.find(function (s) {
        return s.code === state;
      });

      if (info) {
        return info.color;
      } else {
        return null;
      }
    },
    icon: function () {
      return "mdi-map-search";
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