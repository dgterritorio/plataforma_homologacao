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
      <Search
        ref="searchfield"
        :label="options.label"
        :emptyText="options.noDataText"
        :itemText="options.itemText"
        :itemValue="options.itemValue"
        :store="options.store"
        :storeRead="options.storeRead"
        :storeGetter="options.storeGetter"
        :returnObject="options.returnObject"
        :placeholder="options.placeholder"
        :allowEmpty="!options.required"
        :clearOnBlur="!options.keepOnBlur"
        :class="options.class ? options.class : ''"
        :required="options.required"
        outlined
        dense
        hideDetails
        clearable
        @updatevalue="onSelect"
      ></Search>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";
import Search from "@/components/comboboxes/search.vue";

export default {
  components: {
    Label,
    Search,
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

      return rules;
    },

    onSelect: function (value) {
      if (this.options.asArray) {
        this.value.splice(0, this.value.length);

        if (value) {
          this.value.push(value);
        }
      } else {
        this.value = value;
      }
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
        this.$emit("change", this.value);
      },
    },

    model: {
      deep: true,
      handler: function (value) {
        // TODO: Deprecate this component
        // This patch fixes field cleanup only when returnObject = true and both value && this.value are arrays
        // or when returnObject = false
        if (
          !this.returnObject &&
          Array.isArray(value) &&
          Array.isArray(this.value)
        ) {
          // If the value was cleared we need to sync it with the child combobox
          if (value.length !== this.value.length && value.length === 0) {
            this.$refs.searchfield.clear();
          }
        } else if (!this.returnObject) {
          // If the value was cleared we need to sync it with the child combobox
          if (value !== this.value) {
            this.$refs.searchfield.clear();
          }
        }
      },
    },
  },
};
</script>