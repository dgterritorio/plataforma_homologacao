<template>
  <div class="d-flex justify-start align-center mt-2">
    <v-tooltip
      bottom
      v-if="options.required"
      content-class="explain-tooltip font-weight-medium elevation-6"
    >
      <template v-slot:activator="{ on, attrs }">
        <!-- <v-btn icon :color="warningColor" v-bind="attrs" v-on="on"> -->
        <v-icon class="ml-2" :color="warningColor" v-bind="attrs" v-on="on">{{
          "mdi-alert-box"
        }}</v-icon>
        <!-- </v-btn> -->
      </template>
      <v-container>{{ $t("This field is mandatory") }}</v-container>
    </v-tooltip>

    <v-tooltip
      ref="tooltip"
      bottom
      v-if="explain"
      max-width="500"
      content-class="explain-tooltip font-weight-medium elevation-6"
      close-delay="150"
    >
      <template v-slot:activator="{ on, attrs }">
        <!-- <v-btn icon :color="infoColor" v-bind="attrs" v-on="on"> -->
        <v-icon class="ml-2" :color="infoColor" v-bind="attrs" v-on="on">{{
          "mdi-help-box"
        }}</v-icon>
        <!-- </v-btn> -->
      </template>
      <v-container
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        v-html="explain"
        style="text-align: justify; text-justify: inter-word"
      >
      </v-container>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
      default: function () {
        return {};
      },
    },

    explain: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      infoColor: "primary lighten-1",
      warningColor: "warning lighten-1",
    };
  },
  methods: {
    onMouseEnter: function () {
      this.$refs.tooltip.runDelay("open");
    },

    onMouseLeave: function () {
      this.$refs.tooltip.runDelay("close");
    },
  },
};
</script>
<style scoped>
.explain-tooltip {
  background: white;
  color: black;
  border: 1px solid var(--v-primary-base);
  pointer-events: all !important;
}
</style>