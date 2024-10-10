<template>
  <v-combobox
    :label="label"
    :placeholder="placeholder"
    :noDataText="NO_DATA_TEXT"
    :hint="hintMessage"
    :error-messages="errorMessage"
    :loading="isLoading"
    :hideNoData="false"
    :menu-props="{ value: showMenu }"
    :hide-selected="false"
    return-object
    :flat="flat"
    :outlined="outlined"
    :solo="solo"
    :dense="dense"
    :readonly="readonly"
    :multiple="multiple"
    :clearable="clearable"
    :hide-details="hideDetails"
    :disabled="disabled"
    :items="items"
    :item-text="itemText"
    :search-input.sync="search"
    :chips="chip"
    :rules="setRules(required)"
    v-model="modelValue"
    @blur="onBlur"
    @focus="onFocus"
    @click:clear="onClear"
    @change="onChange"
  >
    <template v-if="itemTemplate" v-slot:item="data">
      <!-- HTML that describe how select should render items when the select is open -->
      <component :is="itemTemplate" :item="data.item"></component>
    </template>
  </v-combobox>
</template>
<script>
export default {
  props: {
    // Field label
    label: {
      type: String,
      default: null,
    },

    // Field placeholder
    placeholder: {
      type: String,
      default: null,
    },

    // Store id
    store: {
      type: String,
      default: null,
    },

    // Delay in millisecond until query is executed
    delay: {
      type: Number,
      default: 400,
    },

    // Minimum characters for the query to execute
    lowerLimit: {
      type: Number,
      default: 4,
    },

    // Reactive property with the selected value. Can also set the default value
    value: null,

    readonly: {
      type: Boolean,
      default: false,
    },

    // Auto load will automatically handle the query
    autoLoad: {
      type: Boolean,
      default: true,
    },

    // Store getter property. Defaults to 'records'
    storeGetter: {
      type: String,
      default: "records",
    },

    // Store read data method
    storeRead: {
      type: String,
      default: "read",
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

    // Filters to be used when using the manual query mode (prototype)
    itemFilters: {
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

    // Allow multiple selection of items
    multiple: {
      type: Boolean,
      default: false,
    },

    allowEmpty: {
      type: Boolean,
      default: false,
    },

    clearOnBlur: {
      type: Boolean,
      default: true,
    },

    emptyText: {
      type: String,
      default: null,
    },

    returnObject: {
      type: Boolean,
      default: true,
    },

    clearOnChange: {
      type: Boolean,
      default: false,
    },

    forceSelection: {
      type: Boolean,
      default: true,
    },

    hideDetails: {
      type: Boolean,
      default: false,
    },

    chip: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    itemTemplate: {
      type: Object,
      default: function () {
        return null;
      },
    },

    required: {
      type: Boolean,
      default: false,
    },
  },

  model: {
    prop: "value",
    event: "updatevalue",
  },

  data() {
    return {
      isOrm: false,
      ormNamespace: null,
      ormModel: null,

      modelValue: this.value,

      search: null,
      selected: false,

      isLoading: false,
      errorMessage: null,
      hintMessage: null,
      showMenu: false,
      valid: false,

      NO_DATA_TEXT: this.emptyText
        ? this.emptyText
        : this.$t("No data available"),
      NO_SELECTION_TEXT: this.$t("No selection detected"),
      SERVER_ERROR_TEXT: this.$t("Error loading data"),

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
            case "object":
              if (Array.isArray(value)) {
                valid = !!value.length;
              } else {
                valid = !!value;
              }
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
      try {
        const store = this.store;

        if (!store) return [];

        const isOrm = this.isOrm;

        const getter = isOrm ? "entities/" + store : store;

        const items = this.$store.getters[getter + "/" + this.storeGetter];

        // Support for vuex-orm
        return typeof items === "function" ? items() : items;
      } catch (e) {
        this.errorMessage = this.SERVER_ERROR;

        return [];
      }
    },
  },

  methods: {
    setRules: function (required) {
      const rules = [];

      if (required) {
        rules.push(this.fieldRules.required);
      }

      return rules;
    },

    defaultLoad: async function (value) {
      try {
        const store = this.store;

        // If there is no store, return
        if (!store) {
          return;
        }
        // If the store is loading, return
        if (this.isLoading) {
          return;
        }

        this.isLoading = true;

        const property = this.itemText;

        if (this.isOrm) {
          this.ormModel.deleteAll();

          await this.ormModel.api().read({
            filters: [
              {
                property: property,
                operator: "like",
                value: value,
              },
            ],
          });
        } else {
          await this.$store.dispatch(store + "/" + this.storeRead, {
            filter: [
              {
                property: property,
                operator: "like",
                value: value,
              },
            ],
          });
        }

        this.isLoading = false;

        this.showMenu = true;
      } catch (e) {
        this.errorMessage = this.$t("Error loading results");
      }
    },

    clear: function () {
      if (this.multiple) {
        this.modelValue = [];
      } else {
        this.modelValue = null;
      }

      this.$emit("updatevalue", this.modelValue);
    },

    loadData: async function (filters) {
      try {
        const store = this.store;

        // If there is no store, return
        if (!store) {
          return;
        }
        // If the store is loading, return
        if (this.isLoading) {
          return;
        }

        this.isLoading = true;

        if (this.isOrm) {
          await this.ormModel.api().read(params);
        } else {
          await this.$store.dispatch(this.store + "/" + this.storeRead, params);
        }

        this.isLoading = false;

        this.showMenu = true;
      } catch (e) {
        this.errorMessage = this.$t("Error loading results");
      }
    },

    onInput: function (value) {
      const self = this;

      this.selected = false;

      this.errorMessage = null;

      if (!this.autoLoad) {
        return;
      }

      // If the input value is empty or is lower than a limit
      if (!value || value.length === 0 || value.length < this.lowerLimit) {
        return;
      }

      // If the modelValue === the input text, means we selected a row.
      // If returnObject = true we test for the itemText property
      if (this.modelValue && this.modelValue[this.itemText] === value) {
        this.selected = true;

        this.showMenu = this.multiple;

        return;
      }

      // Clear the previous timer
      if (this.timer) {
        clearTimeout(this.timer);
      }

      // Set the timer to wait the delay before query
      this.timer = setTimeout(function () {
        // Emit event for the searched value
        self.$emit("input", value);

        // Query the store api with the searched value
        self.defaultLoad(value);
      }, this.delay);
    },

    onBlur: function () {
      const isSelected =
        !this.forceSelection || (this.forceSelection && this.selected);
      // If no record is selected, show error
      if (!isSelected && !this.allowEmpty) {
        this.errorMessage = this.NO_SELECTION_TEXT;

        this.search = null;
      } else if ((this.allowEmpty && this.clearOnBlur) || this.multiple) {
        // && !this.selected) {
        // this.modelValue = null;
        this.search = null;
      }

      // Set valid = selected
      this.valid = isSelected;
      // Hide dropdown menu
      this.showMenu = false;
    },

    onFocus: function () {
      this.errorMessage = null;
      // If we have cached items, show them on focus
      if (
        (this.selected && this.items.length > 1) ||
        (!this.selected && this.items.length)
      ) {
        this.showMenu = true;
      }
    },

    onClear: function () {
      // On clear, hide dropdown menu
      this.showMenu = false;
    },

    onChange: function (value) {
      if (!value) {
        this.$emit("updatevalue", null);

        this.selected = false;

        return;
      }

      const record = this.returnObject ? value : value[this.itemValue];

      this.selected = true;

      this.showMenu = this.multiple;

      // Update the v-model with the selected record
      this.$emit("updatevalue", record);
    },
  },

  watch: {
    search: {
      handler: function (value) {
        this.onInput(value);
      },
    },

    // selected: {
    //   handler: function(value) {
    //     console.log("[Select] ", value);

    //     if (!value) {
    //       return;
    //     }

    //     console.log("[Select] Emitting value");

    //     const selected = this.returnObject
    //       ? this.modelValue
    //       : this.modelValue[this.itemValue];

    //     let record;

    //     // If the record is clearable on change, we test if there is any selection
    //     if (this.clearOnChange) {
    //       record = value ? selected : null;
    //     } else {
    //       record = selected;
    //     }

    //     // Update the v-model with the selected record
    //     this.$emit("updatevalue", record);
    //   }
    // }
  },
};
</script>