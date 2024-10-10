<template>
  <v-row class="mx-4 mb-4">
    <v-col
      v-if="options.hasOwnProperty('text')"
      sm="12"
      md="12"
      lg="12"
      style="padding: 0"
      class="d-flex justify-start align-center"
    >
      <Label :options="options" :explain="explain"></Label>
    </v-col>
    <v-col :sm="sm" :md="md" :lg="lg" style="padding: 0">
      <div class="body-1 ml-6 unselectable">
        <slot name="prefix"></slot>
        <!-- Field without mask -->
        <span>{{ renderedValue }}</span>
        <slot name="suffix"></slot>
      </div>
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
      value: null,

      error: null,

      showTooltip: false,

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

      if (entry.hasOwnProperty("validation")) {
        const validation = entry.validation;

        validation.forEach(function (key) {
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
        }, this);
      }

      return rules;
    },

    onCopy: function (idx) {
      const textToCopy = this.$refs.textfield.$el.querySelector("input");

      textToCopy.select();
      document.execCommand("copy");
    },

    toLocale: function (value, system = "en-EN") {
      let parsed;

      try {
        parsed = value.toLocaleString(system).replace(/\s+/g, ".");
      } catch (e) {
        parsed = value;
      }

      return parsed;
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

    renderedValue: function () {
      const options = this.options;

      const renderer = options.renderer;

      const value = this.value;

      if (!renderer) {
        return value;
      }

      const type = renderer.type;

      let rendered = null;

      switch (type) {
        case "locale":
          const { system } = renderer;

          rendered = this.toLocale(value, system);
          break;
        case "function":
          const { fn } = renderer;

          rendered = fn(value);
          break;
        default:
          rendered = "";
          break;
      }

      return rendered;
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