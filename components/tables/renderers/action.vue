<template>
  <button style="width: 100%" @click="$emit('click')">
    <v-icon
      v-if="renderer.hasOwnProperty('icon')"
      :color="renderer.color ? renderer.color : 'primary'"
    >
      {{ renderer.icon }}
    </v-icon>

    <span v-if="renderer.hasOwnProperty('text')">{{ renderer.text }}</span>
  </button>
</template>
<script>
export default {
  props: {
    renderer: {
      type: Object,
      default: function () {
        return {};
      },
    },

    row: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
};
</script>