<template>
  <v-row class="mx-4">
    <v-col
      sm="12"
      md="12"
      lg="12"
      style="padding: 0"
      class="d-flex justify-start align-center"
      v-if="!options.hideIcons"
    >
      <Label :options="options" :explain="explain"></Label>
    </v-col>
    <v-col :sm="sm" :md="md" :lg="lg" style="padding: 0">
      <!-- Field without mask -->
      <v-text-field
        ref="textfield"
        class="no-margin-append-outer"
        :placeholder="options.hint"
        :suffix="options.suffix"
        :readonly="options.readonly"
        :hide-details="!!options.hideDetails"
        :rules="setRules(options)"
        :type="type"
        v-model="value"
        dense
        outlined
      >
      </v-text-field>
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

    editable: {
      type: Boolean,
      default: true,
    },

    model: null,
  },

  data() {
    return {
      type: "text",

      // value: null,

      error: null,

      showTooltip: false,
      showValue: false,

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
        integer: (value) => {
          return /^[0-9]+$/.test(value) || this.$t("Invalid Integer Number");
        },
        float: (value) => {
          return (
            /^[0-9]+(\,[0-9]+)?$/.test(value) || this.$t("Invalid Float Number")
          );
        },
        percent: (value) => {
          return (
            (/^[0-9]+(\.[0-9]+)?$/.test(value) && value <= 1) ||
            this.$t("Invalid Percentage value")
          );
        },
      },
    };
  },

  created: function () {
    if (this.options.hasOwnProperty("type")) {
      this.type = this.options.type;
    }
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

      if (entry.hasOwnProperty("validation")) {
        const validation = entry.validation;

        validation.forEach(function (key) {
          if (typeof key === "function") {
            rules.push(key);
          } else {
            switch (key) {
              case "number":
              case "int":
              case "integer":
                rules.push(this.rules.integer);
                break;

              case "float":
                rules.push(this.rules.float);
                break;
              default:
                break;
            }
          }
        }, this);
      }

      return rules;
    },

    format: function (value, system, decimal) {
      if (isNaN(value)) {
        return value;
      }

      if (typeof value !== "number") {
        value = parseFloat(value);
      }

      const d = this.countDecimals(value);

      const locale = system
        ? value
            .toLocaleString(system, { minimumFractionDigits: d })
            .replace(/\s+/g, "")
        : value;

      return locale;
    },

    countDecimals: function (value) {
      const str = "" + value;

      const split = str.split(".");

      if (split.length === 2) {
        return split[1].length;
      } else {
        return 0;
      }
    },

    isZero: function (value) {
      const str = "" + value;

      if (this.isFloating(str)) {
        const split = str.replace(",", ".").split(".");

        return Number(split[0]) === Number(str);
      } else {
        return false;
      }
    },

    isFloating: function (value) {
      return /^[0-9]+([\.\,]{1}[0-9]+)?$/.test(value);
    },

    isEmpty: function (value) {
      return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.length) ||
        value === "-" ||
        !this.isFloating(value)
      );
    },
  },

  computed: {
    warningColor: function () {
      return this.error ? "red" : "warning";
    },

    lg: function () {
      return this.options.lg ? this.options.lg : 12;
    },

    md: function () {
      return this.options.md ? this.options.md : 12;
    },

    sm: function () {
      return this.options.sm ? this.options.sm : 12;
    },

    value: {
      get: function () {
        const options = this.options;

        const system = options.system;
        const decimal = options.decimal;

        if (this.isEmpty(this.model)) {
          return this.model;
        }

        if (this.isZero(this.model)) {
          return this.model;
        }

        return this.format(this.model, system, decimal);
      },
      set: function (value) {
        if (this.isEmpty(value)) {
          this.$emit("change", value);

          return "";
        }

        const { system } = this.options;

        let parsed = value;

        if (system) {
          parsed = parsed.replace(",", ".");
        }

        if (this.isZero(parsed)) {
          this.$emit("change", parsed);

          return parsed;
        }

        parsed = Number(parsed);

        this.$emit("change", parsed);

        return parsed;
      },
    },
  },
};
</script>
<style scoped>
.no-margin-append-outer >>> .v-input__append-outer {
  margin-top: 0 !important;
}
</style>