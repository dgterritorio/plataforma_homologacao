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
      <v-textarea
        :label="$t(options.hint)"
        :hint="options.hint"
        :rules="setRules(options)"
        :counter="options.limit"
        :outlined="!options.outlined"
        :height="options.height ? options.height : '100%'"
        v-model="value"
      ></v-textarea>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";

export default {
  name: "Textareafield",

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

          return valid || this.$t("Required field");
        },
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
        integer: (value) => {
          return /^[0-9]+$/.test(value) || this.$t("Invalid Integer Number");
        },
        float: (value) => {
          return (
            /^[0-9]+(\.[0-9]+)?$/.test(value) || this.$t("Invalid Float Number")
          );
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

      if (entry.type === "email") {
        rules.push(this.rules.email);
      }

      if (entry.valueType === "integer") {
        rules.push(this.rules.integer);
      } else if (entry.valueType === "float") {
        rules.push(this.rules.float);
      }

      if (entry.hasOwnProperty("validation")) {
        const validation = entry.validation;

        validation.forEach(function (rule) {
          if (typeof rule === "function") {
            rules.push(rule);
          }
        }, this);
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
      handler: function (value) {
        this.value = value;
      },
    },
  },
};
</script>