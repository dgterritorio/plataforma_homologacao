<template>
  <v-select
    ref="select"
    class="black-combobox-text"
    :color="color"
    :label="label"
    :no-data-text="noDataText"
    :flat="flat"
    :outlined="outlined"
    :solo="solo"
    :dense="dense"
    :readonly="readonly"
    :multiple="multiple"
    :clearable="clearable"
    :rules="setRules(rules)"
    :item-text="itemText"
    :item-value="itemValue"
    :items="items"
    :menu-props="{
      bottom: true,
      'offset-y': true,
      'content-class': 'white-combobox-bg',
    }"
    :hide-details="hideDetails"
    v-model="modelValue"
    @input="onInput"
  >
    <template v-if="listCmp" v-slot:item="{ item, on, attrs }">
      <component
        :is="listCmp"
        :item="item"
        :on="on"
        :attrs="attrs"
        :multiple="multiple"
        :value="value"
        :itemText="itemText"
        :itemValue="itemValue"
        :itemDetails="itemDetails"
      >
      </component>
    </template>
  </v-select>
</template>
<script>
export default {
  props: {
    // Field label
    label: {
      type: String,
      default: null,
    },

    // Store id
    store: {
      type: String,
      default: null,
    },

    // Reactive property with the selected value. Can also set the default value
    value: null,

    readonly: {
      type: Boolean,
      default: false,
    },

    // Store getter property. Defaults to 'records'
    storeGetter: {
      type: String,
      default: "records",
    },

    // Data property to display in the combobox
    itemText: {
      type: String,
      default: "text",
    },

    // Data property to return when selecting items
    itemValue: {
      type: String,
      default: "value",
    },

    itemDetails: {
      type: Array,
      default: function () {
        return [];
      },
    },

    // Items in a {text: '', value: ''} style
    values: {
      type: Array,
      default: function () {
        return [];
      },
    },

    // Hide detail messages
    hideDetails: {
      type: Boolean,
      default: false,
    },

    // Rules to be applied to the field (i.e: required)
    rules: {
      type: Object,
      default: function () {
        return {};
      },
    },

    // Turns on/off clearable widget
    clearable: {
      type: Boolean,
      default: false,
    },

    // Styling flat
    flat: {
      type: Boolean,
      default: false,
    },

    // Styling outlined
    outlined: {
      type: Boolean,
      default: false,
    },

    // Styling solo
    solo: {
      type: Boolean,
      default: false,
    },

    // Styling dense
    dense: {
      type: Boolean,
      default: false,
    },

    // TODO: Allow this for comboboxes. Bug with redering in production
    // Allow user input new items not listed
    // allowInput: {
    //   type: Boolean,
    //   default: false
    // },

    // Allow multiple selection of items
    multiple: {
      type: Boolean,
      default: false,
    },

    emptyText: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: "",
    },

    listCmp: null,
  },

  model: {
    prop: "value",
    event: "input",
  },

  data() {
    return {
      isOrm: false,
      ormNamespace: null,
      ormModel: null,

      //   cmp: this.allowInput ? VCombobox : VSelect,
      modelValue: this.value,

      noDataText: this.emptyText
        ? this.emptyText
        : this.$t("No data available"),

      inputRules: [],

      fieldRules: {
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

        consistency: (value) => {
          const items = this.items;
          const itemValue = this.itemValue;

          const idx = items.findIndex(function (item) {
            return item[itemValue] === value;
          });

          return idx !== -1 || this.$t("Required field");
        },
      },
    };
  },

  created: function () {
    // Get the vuex-orm database
    const database = this.$store.$db();

    // Check if store is vuex-orm
    const modelsList = database.models();

    this.isOrm = modelsList.hasOwnProperty(this.store);

    if (this.isOrm) {
      // and set the database namespace and model
      this.ormNamespace = database.namespace;
      this.ormModel = database.model(this.store);
    }
  },

  computed: {
    items: function () {
      let items = [];

      try {
        const store = this.store;

        if (!store) return this.values;

        const isOrm = this.isOrm;

        const getter = isOrm ? "entities/" + store : store;

        const items = this.$store.getters[getter + "/" + this.storeGetter];

        const values = typeof items === "function" ? items() : items;

        const itemText = this.itemText;

        if (values) {
          values.forEach(function (val) {
            val[itemText] = this.$t(val[itemText]);
          }, this);
        }

        // Support for vuex-orm
        return values;
      } catch (e) {
        console.log("[Err] Error loading combobox");
        return [];
      }

      return items;
    },
  },

  methods: {
    setRules: function (entry) {
      const rules = [];

      if (!entry.allowEmpty) {
        rules.push(this.fieldRules.consistency);
      }

      if (entry.required) {
        rules.push(this.fieldRules.required);
      }

      return rules;
    },

    onInput: function (value) {
      this.$emit("input", value);
    },
  },

  watch: {
    value: function (newValue) {
      // On value change outside this component
      this.modelValue = newValue;
    },
    items: function (values) {
      const select = this.$refs.select;

      if (select) {
        select.validate();
      }
    },
  },
};
</script>
<style>
.black-combobox-text >>> .v-select__selection--disabled {
  color: black !important;
}

.white-combobox-bg {
  background: white;
}
</style>
