<template>
  <v-row class="ml-4 my-3" align="start">
    <v-col
      :sm="10"
      :md="10"
      :lg="10"
      class="d-flex unselectable"
      style="padding: 0; margin-bottom: 0; padding-bottom: 0"
    >
      <div class="subtitle-1 font-weight-medium text--secondary">
        {{ options.prefix }}
      </div>
      <v-text-field
        v-if="!options.hideValue"
        class="mx-2 centered-input dense-input surrounded-text"
        :label="$t(options.text)"
        :hint="options.hint"
        :persistent-hint="options.persistHint"
        :rules="setRules(options)"
        hide-details
        v-model="value"
        dense
        outlined
        style="max-width: 60px; height: 20px"
      ></v-text-field>
      <div class="subtitle-1 font-weight-medium text--secondary">
        {{ options.suffix }}
      </div>
    </v-col>

    <v-col
      :sm="2"
      :md="2"
      :lg="2"
      style="padding: 0; justify-content: end !important"
    >
      <Icons :options="options" :explain="explain" class="mx-3"></Icons>
    </v-col>
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

    model: null,
  },

  data() {
    return {
      // value: null,

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

          return !!value || this.$t("Required field");
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
            /^[0-9]+([\.\,]{1}[0-9]+)?$/.test(value) ||
            this.$t("Invalid Float Number")
          );
        },
      },
    };
  },

  created: function () {
    // this.value = this.model;
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
              case "email":
                rules.push(this.rules.email);
                break;
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

    value: {
      get: function () {
        const options = this.options;

        const { system, decimal, isNumber } = this.options;

        if (isNumber) {
          if (this.isEmpty(this.model)) {
            return this.model;
          }

          if (this.isZero(this.model)) {
            return this.model;
          }

          return this.format(this.model, system, decimal);
        } else {
          return this.model;
        }
      },

      set: function (value) {
        const { system, decimal, isNumber } = this.options;

        let parsed;

        if (isNumber) {
          if (this.isEmpty(value)) {
            this.$emit("change", value);

            return "";
          }

          const { system } = this.options;

          parsed = value;

          if (system) {
            parsed = parsed.replace(",", ".");
          }

          if (this.isZero(parsed)) {
            this.$emit("change", parsed);

            return parsed;
          }

          parsed = Number(parsed);
        } else {
          parsed = value;
        }

        this.$emit("change", parsed);

        return parsed;
      },
    },
  },

  // watch: {
  //   value: {
  //     handler: function (value) {
  //       this.$emit("change", value);
  //     },
  //   },

  //   model: {
  //     handler: function (value) {
  //       this.value = value;
  //     },
  //   },
  // },
};
</script>
<style scoped>
.centered-input >>> input {
  text-align: center;
}

.dense-input >>> .v-input__slot {
  top: -5px;
}
</style>