<template>
  <v-card :flat="flat">
    <v-toolbar flat color="grey lighten-4" v-if="title">
      <v-toolbar-title>
        <v-card-title class="unselectable">{{$t(title)}}</v-card-title>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Tempalted Tools -->
      <slot name="tools"></slot>
    </v-toolbar>

    <v-card-text>
      <!-- Templated Body -->
      <slot name="body"></slot>
    </v-card-text>

    <v-card-actions>
      <!-- Templated Body -->
      <slot name="footer"></slot>
    </v-card-actions>
  </v-card>
</template>
<script>

export default {
  props: {
    title: {
      type: String,
      default: null
    },
    flat: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  }
};
</script>