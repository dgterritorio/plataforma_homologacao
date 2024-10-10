<template>
  <v-tooltip bottom v-if="record.homologation_type !== 0 && showType">
    <template v-slot:activator="{ on }">
      <v-card
        :flat="flat"
        class="unselectable font-weight-bold px-4 py-3 homologation-symbol d-flex"
        height='100%'
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
            <div
              class="text-center text-h6 font-weight-bold"
              :style="'color:'+ 'var(--v-primary-base); width: 24px;'"
            >{{icon}}</div>
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
    // shorttext: function () {
    // return this.record.homologation_type ? "A" : "B";
    // },

    homologation_type: function () {
      return this.record.homologation_type;
    },

    text: function () {
      let type = this.homologation_type;

      let text;

      switch (type) {
        case 2:
          text = "Homologação Tipo A";
          break;
        case 3:
          text = "Homologação Tipo B";
          break;

        default:
          text = "Tipo de Homologação por Definir";
          break;
      }

      return text;
    },

    color: function () {
      return "primary";
    },

    icon: function () {
      const type = this.homologation_type;

      let icon;

      switch (type) {
        case 2:
          icon = "A";
          break;
        case 3:
          icon = "B";
          break;
        default:
          icon = "-";
          break;
      }

      return icon;
    },

    showType: function(){
      return this.record.show_type === true;
    }
  },
};
</script>
<style scoped>
/* .hoverable-symbol {
  position: absolute;
  top: 0;
  right: -0px;
  z-index: 1;

  width: 200px;
} */
</style>