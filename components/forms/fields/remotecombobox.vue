<template>
  <v-row class="mx-4">
    <v-col sm="12" md="12" lg="12" style="padding:0" class="d-flex justify-start align-center">
      <Label :options="options" :explain="explain"></Label>
    </v-col>
    <v-col :sm="sm" :md="md" :lg="lg" style="padding:0">
      <Combobox
        :placeholder="options.hint"
        :persistent-hint="options.persistHint"
        :rules="options"
        :value="options.defaultValue"
        :store="options.store"
        :storeGetter="options.storeGetter"
        :itemText="options.itemText ? options.itemText : 'text'"
        :itemValue="options.itemValue ? options.itemValue : 'value'"
        :clearable="!!options.clearable"
        :readonly="options.readonly"
        :values="options.items"
        outlined
        dense
        v-model="value"
      ></Combobox>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";
import Combobox from "@/components/comboboxes/basic.vue";

export default {
  components: {
    Label,
    Combobox,
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
      default: null
    },

    model: null,
  },

  data() {
    return {
      value: null,

      error: null,
    };
  },

  created: function () {
    this.value = this.model;

    if (!this.options.hasOwnProperty("items")) {
      this.options.items = [];
    }
  },

  computed: {
    lg: function () {
      return this.options.lg ? this.options.lg : 12;
    },

    md: function () {
      return this.options.md ? this.options.md : 12;
    },

    sm: function () {
      return this.options.sm ? this.options.sm : 12;
    },
  },

  model: {
    prop: "model",
    event: "change",
  },

  watch: {
    value: {
      handler: function (value) {
        this.$emit("change", value);
      },
    },

    model: {
      handler: function (value) {
        this.value = value;
      },
    },
  },
};
</script>