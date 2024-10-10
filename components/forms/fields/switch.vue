<template>
  <v-row class="mx-4">
    <v-col sm="12" md="12" lg="12" style="padding: 0">
      <Label :options="options" :explain="explain"></Label>
    </v-col>
    <v-col sm="12" md="12" lg="12" style="padding: 0" align-self="start">
      <v-switch
        :label="$t(options.text)"
        :hint="options.hint"
        :persistent-hint="options.persistHint"
        :hide-details="options.hideDetails"
        :rules="setRules(options)"
        :value="options.defaultValue"
        :true-value="options.values ? options.values[0] : true"
        :false-value="options.values ? options.values[1] : false"
        style="padding: 0; margin: 0"
        class="mb-4 mt-2"
        v-model="value"
      ></v-switch>
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
          return (
            (value !== undefined && value !== null) || this.$t("Required field")
          );
        },
      },
    };
  },

  created: function () {
    // if (this.options.type === "switch") console.log(this.options);
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

        for (let i = 0; i < validation.length; i++) {
          const rule = validation[i];

          if (typeof rule === "function") {
            rules.push(rule);
          }
        }
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
        // Avoid ciclic updates when the models changes
        if (value !== this.model) {
          this.$emit("change", value);

          if (this.options.forceFormValidation) {
            this.$emit("revalidate");
          }
        }
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