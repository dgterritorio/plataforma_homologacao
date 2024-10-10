<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-row :class="'mx-4' + (userClass ? ' ' + userClass : '')">
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
            readonly
            :label="$t(options.text)"
            :placeholder="options.hint"
            :rules="setRules(options)"
            dense
            outlined
            v-model="value"
            v-on="on"
          ></v-text-field>
        </v-col>
      </v-row>
    </template>
    <v-date-picker
      :max="options.max ? options.max : null"
      :min="options.min ? options.min : null"
      v-model="value"
      @input="menu = false"
    ></v-date-picker>
  </v-menu>
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

    userClass: {
      type: String,
      default: null,
    },

    model: null,
  },

  data() {
    return {
      value: null,

      menu: false,

      error: null,

      rules: {
        required: (value) => {
          return !!value || this.$t("Required field");
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
          if (typeof key === "function") {
            rules.push(key);
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

  watch: {
    value: {
      handler: function (value) {
        this.$emit("change", value);
      },
    },
    model: {
      handler: function (value) {
        if (value !== this.value) {
          this.value = value;
        }
      },
    },
  },
};
</script>