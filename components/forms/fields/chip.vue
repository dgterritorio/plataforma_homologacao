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
      <v-combobox
        ref="field"
        :label="options.label ? options.label : ''"
        :multiple="multiple"
        hide-selected
        :placeholder="options.hint"
        :persistent-hint="options.persistHint"
        :rules="setRules(options)"
        outlined
        dense
        :return-object="!!options.returnObject"
        v-model="value"
        append-icon
        chips
        deletable-chips
        :items="items"
        :item-text="options.itemText"
        :item-value="options.itemValue"
        :search-input.sync="search"
        :loading="isLoading"
        no-filter
        hide-no-data
        @change="onChange"
        @blur.prevent="onBlur"
        @keydown.enter.prevent="onEnter"
        @keyup.tab.prevent="onTabpress"
        @keydown.tab.prevent="onTabdown"
      >
        <!-- <template v-slot:selection="{ item }">
          <v-chip class="font-weight-medium" color="gray">{{
            options.returnObject ? item[itemValue] : item
          }}</v-chip>
        </template> -->
      </v-combobox>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";
import Combobox from "@/components/comboboxes/search.vue";

export default {
  components: {
    Label,
    Combobox,
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
      store: null,
      storeGetter: null,

      itemText: "text",
      itemValue: "value",

      search: null,
      value: null,
      pressedTab: false,

      error: null,

      showTooltip: false,
      showValue: false,

      timer: null,
      delay: 400,
      lowerLimit: 4,
      isLoading: false,

      rules: {
        required: (value) => {
          const type = typeof value;

          let valid;

          if (!value) {
            return this.$t("Required field");
          }

          if (type === "object") {
            return value.length > 0 || this.$t("Required field");
          } else {
            return !!value || this.$t("Required field");
          }
        },
      },
    };
  },

  created: function () {
    // Initialization
    this.value = this.model;
    this.store = this.options.store;
    this.storeGetter = this.options.storeGetter;
    this.itemText = this.options.itemText ? this.options.itemText : "text";
    this.itemValue = this.options.itemValue ? this.options.itemValue : "value";

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

  model: {
    prop: "model",
    event: "change",
  },

  computed: {
    items: function () {
      try {
        const store = this.store;

        if (!store) return [];

        if (!this.search || this.search.length < this.lowerLimit) return [];

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

    lg: function () {
      return this.options.lg ? this.options.lg : 12;
    },

    md: function () {
      return this.options.md ? this.options.md : 12;
    },

    sm: function () {
      return this.options.sm ? this.options.sm : 12;
    },

    multiple: function () {
      return this.options.hasOwnProperty("multiple")
        ? this.options.multiple
        : true;
    },
  },

  methods: {
    setRules: function (entry) {
      const rules = [];

      if (entry.required) {
        rules.push(this.rules.required);
      }

      const validation = entry.validation;

      if (validation) {
        for (let i = 0; i < validation.length; i++) {
          const rule = validation[i];

          if (typeof rule === 'function') {
            rules.push(rule);
          }
        }
      }

      return rules;
    },

    // updateTags() {
    //   this.$nextTick(() => {
    //     if (this.select) {
    //       this.select.push(...this.search.split(","));
    //       this.$nextTick(() => {
    //         this.search = "";
    //       });
    //     }
    //   });
    // },

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
      } catch (e) {
        // this.errorMessage = this.$t("Error loading results");
      }
    },

    onInput: function (value) {
      const self = this;

      // If the input value is empty or is lower than a limit
      if (!value || value.length === 0 || value.length < this.lowerLimit) {
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

    onTabpress: function (e) {
      const value = this.value;

      if (!value || !this.multiple) {
        return;
      }

      // Prevent adding items on tab press
      const len = value.length;

      if (len > 0) {
        value.splice(len - 1, 1);
      }

      this.search = null;
    },

    onTabdown: function (e) {
      if (!this.multiple) {
        this.pressedTab = true;
      }
    },

    onEnter: function () {
      this.search = null;
    },

    onBlur: function () {
      if (this.pressedTab && !this.multiple) {
        // Prevent adding items that are not present in the array
        // This will also remove valid items!!
        this.$refs.field.deleteCurrentItem();

        this.pressedTab = false;
      }

      this.search = null;
    },

    onChange: function () {
      this.search = null;
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

    search: {
      handler: function (value) {
        this.onInput(value);
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