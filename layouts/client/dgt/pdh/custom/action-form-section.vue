<template>
  <v-card :flat="flat" style="border-radius: 8px;">
    <!-- <v-toolbar flat color="grey lighten-4" v-if="title">
      <v-toolbar-title>
        <v-card-title class="unselectable">{{$t(title)}}</v-card-title>
      </v-toolbar-title>
    </v-toolbar> -->
    <v-card-title class="unselectable mx-4" :style="flat ? 'padding-bottom: 6px' : ''">{{title}}</v-card-title>

    <v-divider :class="flat ? 'mx-8' : ''" style="margin: 0; padding: 0"></v-divider>

    <div :class="'mx-9' + (!flat ? ' py-3' : '')">
      <slot name="body"></slot>
    </div>
  </v-card>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },

    flat: {
      type: Boolean,
      default: true,
    },
  },
};
</script>