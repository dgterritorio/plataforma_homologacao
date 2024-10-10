<template>
  <v-row>
    <div
      class="unselectable body-1 font-weight-medium ml-3"
      style="font-size: 1.1rem; margin-bottom: 0; line-height:36px"
    >
      {{options.text}}
      <Icons :options="options" :explain="explain" style="float:right;"></Icons>
    </div>
  </v-row>
</template>
<script>
import Icons from "@/components/forms/fields/icons.vue";
export default {
  components: {
    Icons,
  },

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
};
</script>