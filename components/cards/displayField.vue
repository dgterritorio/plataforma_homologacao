<template>
  <v-row align="stretch" justify="center">
    <v-col
      :sm="6"
      :md="6"
      :lg="6"
      style="padding-top:0;padding-bottom:0; margin: 5px 0"
      align-self="center"
    >
      <div class="subtitle-1 text-justify-right" style="text-align: end">{{label ? $t(label) + ':' : ''}}</div>
    </v-col>
    <v-col
      :sm="6"
      :md="6"
      :lg="6"
      style="padding-top:0;padding-bottom:0; margin: 5px 0"
      align-self="center"
    >
      <div class="subtitle-1 font-weight-bold">{{value}}</div>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
      default: ""
    },
    value: {
      default: null
    }
  }
};
</script>