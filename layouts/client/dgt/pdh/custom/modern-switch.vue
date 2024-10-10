<template>
  <v-row class="mx-1 my-3">
    <v-col v-if="config.inapplicable" :sm="sm" :md="md" :lg="lg">
      <v-btn
        :color="value === config.inapplicable.value ? config.inapplicable.color || 'grey':''"
        :text="value !== config.inapplicable.value"
        outlined
        block
        @click="onChange(config.inapplicable.value)"
      >
        <v-icon v-if="config.inapplicable.icon">{{config.inapplicable.icon}}</v-icon>
        {{config.inapplicable.label}}
      </v-btn>
    </v-col>
    <v-col :sm="sm" :md="md" :lg="lg">
      <v-btn
        :color="value === config.invalid.value ? config.invalid.color || 'red':''"
        :text="value !== config.invalid.value"
        outlined
        block
        @click="onChange(config.invalid.value)"
      >
        <v-icon v-if="config.invalid.icon">{{config.invalid.icon}}</v-icon>
        {{config.invalid.label}}
      </v-btn>
    </v-col>
    <v-col :sm="sm" :md="md" :lg="lg">
      <v-btn
        :color="value === config.valid.value ? config.valid.color || 'primary':''"
        :text="value !== config.valid.value"
        outlined
        block
        @click="onChange(config.valid.value)"
      >
        <v-icon v-if="config.valid.icon">{{config.valid.icon}}</v-icon>
        {{config.valid.label}}
      </v-btn>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: {
    model: null,

    config: {
      type: Object,
      default: function () {
        return {
          valid: {},
          invalid: {},
        };
      },
    },
  },
  data() {
    return {
      value: null,
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
    onChange: function (value) {
      if (this.value !== value) {
        this.value = value;

        this.$emit("change", value);
      }
    },
  },

  computed: {
    lg: function () {
      return this.config.inapplicable ? 4 : 6;
    },
    md: function () {
      return this.config.inapplicable ? 4 : 6;
    },
    sm: function () {
      return this.config.inapplicable ? 4 : 6;
    },
  },

  watch: {
    model: {
      handler: function (value) {
        this.value = value;
      },
    },
  },
};
</script>