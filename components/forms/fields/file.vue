<template>
  <v-row class="mx-4">
    <v-col sm="12" md="12" lg="12" style="padding:0" class="d-flex justify-start align-center">
      <Label :options="options" :explain="explain"></Label>
    </v-col>
    <v-col sm="12" md="12" lg="12" style="padding:0">
      <v-file-input
        :label="$t(options.hint)"
        :counter="options.counter"
        :accept="options.accept"
        :placeholder="options.hint"
        :persistent-hint="options.persistHint"
        :rules="setRules(options)"
        outlined
        dense
        v-model="value"
      ></v-file-input>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";

export default {
  components: {
    Label
  },
  props: {
    options: {
      type: Object,
      default: function() {
        return {};
      }
    },

     explain: {
      type: String,
      default: null
    },

    model: null
  },

  data() {
    return {
      value: null,

      error: null,

      rules: {
        required: value => {
          return !!value || this.$t("Required field");
        }
      }
    };
  },

  created: function() {
    this.value = this.model;
  },

  model: {
    prop: "model",
    event: "change"
  },

  methods: {
    setRules: function(entry) {
      const rules = [];

      if (entry.required) {
        rules.push(this.rules.required);
      }

      return rules;
    },
  },

  computed: {
    warningColor: function() {
      return this.error ? "red" : "warning";
    }
  },

  watch: {
    value: {
      handler: function(value) {
        this.$emit("change", value);
      }
    }
  }
};
</script>