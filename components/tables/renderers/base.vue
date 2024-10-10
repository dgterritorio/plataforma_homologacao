<template>
  <div
    class="d-flex justify-center align-center"
    style="height:100%"
  >
    <SimpleRenderer v-if="renderer.type === 'simple'" :renderer="renderer" :item="item"></SimpleRenderer>

    <ChipRenderer v-else-if="renderer.type === 'chip'" :renderer="renderer" :item="item"></ChipRenderer>

    <v-icon
      small
      class="mr-2"
      v-else-if="renderer.type === 'action'"
      @click="$emit('action', {event: renderer.event, item: item})"
    >
    {{renderer.icon}}</v-icon>
  </div>
</template>

<script>
import SimpleRenderer from "~/components/tables/renderers/simple.vue";
import ChipRenderer from "~/components/tables/renderers/chip.vue";

export default {
  components: {
    SimpleRenderer,
    ChipRenderer
  },
  props: {
    renderer: {
      type: Object,
      default: function() {
        return {};
      }
    },

    item: {
      type: Object,
      default: function() {
        return {};
      }
    }
  }
};
</script>