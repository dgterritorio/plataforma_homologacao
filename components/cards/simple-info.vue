<template>
  <v-card>
    <v-card-text class="d-flex justify-space-between py-1 px-6 unselectable">
      <v-icon large :color="iconColor">{{ icon }}</v-icon>

      <v-card-title>{{value}} {{title}}</v-card-title>
    </v-card-text>

    <v-card-text class="body-2 font-weight-medium px-6 unselectable">{{subtitle}}</v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "OngoingCard",

  props: {
    icon: {
      type: String,
      default: null
    },

    iconColor: {
        type: String,
        default: null
    },

    title: {
      type: String,
      default: null
    },

    subtitle: {
      type: String,
      default: null
    },

    value: null
  }
};
</script>