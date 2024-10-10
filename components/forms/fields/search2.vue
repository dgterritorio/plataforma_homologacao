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
    <v-col sm="12" md="12" lg="12" style="padding: 0 0 24px 0">
      <Search
        ref="searchfield"
        outlined
        dense
        hideDetails
        clearable
        v-bind="fieldOptions"
        :value="value"
        @updatevalue="onSelect"
      ></Search>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";
import Search from "@/components/comboboxes/search-v2.vue";

export default {
  components: {
    Label,
    Search,
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

    onSelect: function (value) {
      if (this.options.asArray) {
        this.value.splice(0, this.value.length);

        if (value) {
          this.value.push(value);
        }
      } else {
        this.value = value;
      }
    },
  },

  computed: {
    warningColor: function () {
      return this.error ? "red" : "warning";
    },

    fieldOptions: function () {
      const required = this.options.required;
      const cssclass = this.options.class;
      const rules = this.setRules(this.options);

      const options = {
        ...this.options,
        allowEmpty: !required,
        class: cssclass ? cssclass : "",
        rules: rules,
      };

      delete options.value;

      return options;
    },
  },

  watch: {
    value: {
      handler: function (value) {
        this.$emit("change", this.value);
      },
    },

    model: {
      handler: function (value) {
        console.log("CHANGE MODEL", value)
        this.value = value;
      },
    },
  },
};
</script>