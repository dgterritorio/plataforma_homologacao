<template>
  <v-row class="mx-4">
    <v-col
      sm="12"
      md="12"
      lg="12"
      style="padding: 0"
      class="d-flex justify-start align-center"
    >
      <Label :options="options" :explain="explain"></Label>
    </v-col>
    <v-col sm="12" md="12" lg="12" style="padding: 0">
      <v-select
        :placeholder="options.hint"
        :persistent-hint="options.persistHint"
        :rules="setRules(options)"
        :value="options.defaultValue"
        :multiple="!!options.multiple"
        :items="options.items"
        :itemText="options.itemText ? options.itemText : 'text'"
        :itemValue="options.itemValue ? options.itemValue : 'value'"
        :clearable="!!options.clearable"
        :return-object="!!options.returnObject"
        :readonly="!!options.readonly"
        :menu-props="{
          bottom: true,
          'offset-y': true,
          'content-class': 'white-combobox-bg'
        }"
        outlined
        dense
        v-model="value"
      ></v-select>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";

export default {
  components: {
    Label,
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

    model: null,
  },

  data() {
    return {
      value: null,

      error: null,

      rules: {
        required: (value) => {
          const type = typeof value;

          let valid;

          switch (type) {
            case "string":
              valid = !!value;
              break;
            case "boolean":
              valid = value !== undefined && value !== null;
              break;
            default:
              valid = !!value;
              break;
          }

          if (!valid) {
            return this.$t("Required field");
          }

          // Check if item is in array
          // Support for mutatable items arrays
          const items = this.options.items;
          const itemValue = this.options.itemValue
            ? this.options.itemValue
            : "value";
          const curr = this.options.returnObject
            ? value.map((r) => r[itemValue])
            : value;

          const idx = items.findIndex(function (row) {
            let rowValue = null;
            let found = false;

            if (typeof row === "object") {
              rowValue = row[itemValue];
            } else {
              rowValue = row;
            }

            if (typeof curr === "object") {
              found = curr.includes(rowValue);
            } else {
              found = curr === rowValue;
            }

            return found;
            // return typeof curr === "object"
            //   ? curr.includes(row[itemValue])
            //   : row === curr;
          });

          valid = idx !== -1;

          return valid || this.$t("Required field");
        },
      },
    };
  },

  created: function () {
    this.value = this.model;
  },

  model: {
    prop: "model",
    event: "change",
  },

  methods: {
    setRules: function (entry) {
      const rules = [];

      if (entry.required) {
        rules.push(this.rules.required);
      }

      return rules;
    },
  },

  computed: {
    warningColor: function () {
      return this.error ? "red" : "warning";
    },
  },

  watch: {
    value: {
      handler: function (value) {
        this.$emit("change", value);
      },
    },

    model: {
      deep: true,
      handler: function (value) {
        this.value = value;
      },
    },
  },
};
</script>