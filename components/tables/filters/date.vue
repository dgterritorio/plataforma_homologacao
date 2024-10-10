<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="290px"
  >
    <template v-slot:activator="{ on, attrs }">
      <div class="d-flex justify-center align-center">
        <v-select
          :label="$t('operator')"
          style="width:80px"
          :flat="flat"
          :outlined="outlined"
          :solo="solo"
          :dense="dense"
          hide-details
          :items="operators"
          v-model="selectedOperator"
          @input="onInputOperator"
        ></v-select>

        <v-text-field
          v-model="modelValue"
          :label="$t('Filter by') + ' ' + label"
          readonly
          :flat="flat"
          :outlined="outlined"
          :solo="solo"
          :dense="dense"
          :clearable="clearable"
          hide-details
          v-bind="attrs"
          v-on="on"
          @input="onInput"
        ></v-text-field>
      </div>
    </template>
    <v-date-picker v-model="modelValue" @input="onInput"></v-date-picker>
  </v-menu>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
      default: null
    },

    payload: {
      type: Object,
      default: function() {
        return null;
      }
    },

    // Turns on/off clearable widget
    clearable: {
      type: Boolean,
      default: false
    },

    // Styling flat
    flat: {
      type: Boolean,
      default: false
    },

    // Styling outlined
    outlined: {
      type: Boolean,
      default: false
    },

    // Styling solo
    solo: {
      type: Boolean,
      default: false
    },

    // Styling dense
    dense: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      menu: false,

      operators: [
        {
          text: "=",
          value: "eq"
        },
        {
          text: ">",
          value: "gt"
        },
        {
          text: ">=",
          value: "gteq"
        },
        {
          text: "<",
          value: "lt"
        }
      ],

      selectedOperator: "eq",
      modelValue: null
    };
  },

  model: {
    prop: "payload",
    event: "input"
  },

  methods: {
    onInput: function(value) {
      this.menu = false;

      this.$emit("input", {
        operator: this.selectedOperator,
        value: value,
        type: "date"
      });
    },

    onInputOperator: function(operator) {
      const value = this.modelValue;

      this.$emit("input", {
        operator: operator,
        value: value,
        type: "date"
      });
    }
  },

  watch: {
    value: {
      handler: function(payload) {
        const value = payload.value;

        this.modelValue = value;
      }
    }
  }
};
</script>