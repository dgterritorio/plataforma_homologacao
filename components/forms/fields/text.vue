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
    <v-col :sm="sm" :md="md" :lg="lg" style="padding: 0">
      <v-text-field
        ref="textfield"
        v-if="options.mask"
        class="no-margin-append-outer"
        v-mask="options.mask"
        :append-icon="icon"
        :suffix="options.suffix"
        :placeholder="options.hint"
        :readonly="options.readonly"
        :rules="setRules(options)"
        :type="type"
        v-model="value"
        dense
        outlined
        @click:append="onClickIcon"
      >
        <template v-if="options.allowCopy" v-slot:append-outer>
          <v-tooltip v-model="showTooltip" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                outlined
                small
                width="40"
                height="40"
                v-bind="attrs"
                v-on="on"
                @click="onCopy"
              >
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Copy to clipboard") }}</span>
          </v-tooltip>
        </template>
      </v-text-field>

      <!-- Field without mask -->
      <v-text-field
        ref="textfield"
        v-else
        class="no-margin-append-outer"
        :append-icon="icon"
        :placeholder="options.hint"
        :suffix="options.suffix"
        :readonly="options.readonly"
        :rules="setRules(options)"
        :type="type"
        v-model="value"
        dense
        outlined
        @click:append="onClickIcon"
      >
        <template v-if="options.allowCopy" v-slot:append-outer>
          <v-tooltip v-model="showTooltip" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                outlined
                small
                width="40"
                height="40"
                v-bind="attrs"
                v-on="on"
                @click="onCopy"
              >
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Copy to clipboard") }}</span>
          </v-tooltip>
        </template>
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

      value: null,

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
            case "number":
              valid = !(value == null);
              break;
            default:
              valid = !!value;
              break;
          }

          return valid || this.$t("Required field");
        },
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
        integer: (value) => {
          return /^[0-9]+$/.test(value) || this.$t("Invalid Integer Number");
        },
        integerORnull: (value) => {
          if (value === null || value === "") {
            return true;
          }

          return /^[0-9]+$/.test(value) || this.$t("Invalid Integer Number");
        },
        float: (value) => {
          return (
            /^[0-9]+(\.[0-9]+)?$/.test(value) || this.$t("Invalid Float Number")
          );
        },
        min6: (value) => {
          return (
            (value && value.length > 5) ||
            this.$t("Must contain at least 6 characters")
          );
        },
        percent: (value) => {
          return (
            (/^[0-9]+(\.[0-9]+)?$/.test(value) && value <= 1) ||
            this.$t("Invalid Percentage value")
          );
        },
        npercent: (value) => {
          return (
            (/^[-]*[0-9]+(\.[0-9]+)?$/.test(value) && Math.abs(value) <= 1) ||
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

              case "integerORnull":
                rules.push(this.rules.integerORnull);
                break;

              case "float":
                rules.push(this.rules.float);
                break;
              case "percent":
                rules.push(this.rules.percent);
                break;
              case "npercent":
                rules.push(this.rules.npercent);
                break;
              case "min6":
                rules.push(this.rules.min6);
                break;
              default:
                break;
            }
          }
        }, this);
      }

      return rules;
    },

    onCopy: function (idx) {
      const textToCopy = this.$refs.textfield.$el.querySelector("input");

      textToCopy.select();
      document.execCommand("copy");
    },

    onClickIcon: function () {
      this.showValue = !this.showValue;

      this.type = this.showValue ? "text" : "password";
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

    icon: function () {
      if (this.options.type === "password") {
        return this.showValue ? "mdi-eye" : "mdi-eye-off";
      }

      return null;
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
<style scoped>
.no-margin-append-outer >>> .v-input__append-outer {
  margin-top: 0 !important;
}
</style>