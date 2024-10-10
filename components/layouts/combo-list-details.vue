<template>
  <v-list-item v-bind="attrs">
    <v-list-item-icon v-if="multiple"
      ><v-icon>{{
        value === item[itemValue] ||
        (Array.isArray(value) && value.includes(item[itemValue]))
          ? "mdi-checkbox-marked"
          : "mdi-checkbox-blank-outline"
      }}</v-icon></v-list-item-icon
    >
    <v-list-item-content>
      <v-list-item-title
        v-text="item[itemText]"
        class="text-left"
      ></v-list-item-title>
      <v-list-item-subtitle v-if="itemDetails.length > 0" class="text-left">
        <span
          v-for="(pre, i) in itemDetails"
          :key="`${pre}-${item[itemValue]}`"
        >
          {{ `${item[pre]}` }}
          <span v-if="i !== itemDetails.length - 1"> | </span>
        </span>
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>
<script>
export default {
  name: "combo-item-details",

  props: {
    attrs: {
      type: Object,
      default: function () {
        return {};
      },
    },

    multiple: {
      type: Boolean,
      default: false,
    },

    value: null,

    item: {
      type: Object,
      default: function () {
        return {};
      },
    },

    itemText: {
      type: String,
      default: "text",
    },

    itemValue: {
      type: String,
      default: "value",
    },

    itemDetails: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
};
</script>
