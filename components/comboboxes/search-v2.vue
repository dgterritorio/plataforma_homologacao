<template>
  <div>
    <VExCombobox
      ref="combobox"
      :label="label"
      deletable-chips
      :placeholder="placeholder"
      :noDataText="NO_DATA_TEXT"
      :hint="hintMessage"
      :error-messages="errorMessage"
      :loading="isLoading"
      :hideNoData="false"
      :menu-props="{ value: showMenu }"
      :hide-selected="false"
      return-object
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
      :append-icon="''"
      :chips="chip"
      :open-on-clear="false"
      :cache-items="false"
      :rules="rules"
      v-model="modelValue"
      @click:clear="clear"
      @blur.self="onBlur"
      @focus="onFocus"
      @change="onChange"
      @keydown.enter.prevent="onEnter"
    >
      <template v-slot:selection="{ item, index }">
        <v-chip
          :tabindex="-1"
          label
          :style="`width: 100%; max-width: ${maxChipWidth}px`"
          class="pr-0"
          v-if="index < 3"
          :class="[index === 0 ? 'mt-2 mb-1' : 'my-1', 'custom-v-chip']"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div
                v-bind="attrs"
                v-on="on"
                style="overflow: hidden; text-overflow: ellipsis"
              >
                {{ item[itemText] }}
              </div>
            </template>
            <span>{{ item[itemText] }} </span>
          </v-tooltip>

          <v-spacer></v-spacer>

          <v-btn v-if="multiple" icon plain @click="onRemoveItem(item)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-chip>

        <div
          style="width: 100%; text-align: center"
          :class="['my-1']"
          v-if="index === 3"
        >
          (+ {{ modelValue.length - 3 }}
          {{ modelValue.length - 3 !== 1 ? $t("items") : $t("item") }})
        </div>
      </template>

      <template v-if="itemTemplate" v-slot:item="data">
        <!-- HTML that describe how select should render items when the select is open -->
        <component :is="itemTemplate" :item="data.item"></component>
      </template>

      <template v-if="prependItemTemplate" v-slot:prepend-item>
        <!-- HTML that describe how select should render items when the select is open -->
        <component
          ref="prepend"
          :is="prependItemTemplate"
          :items="items"
          :value="modelValue"
          :loading="isLoading"
          @update:value="
            modelValue = $event;
            onChange($event);
          "
          @blur="onBlur"
        ></component>
      </template>
    </VExCombobox>
  </div>
</template>

<script>
import VExCombobox from "./vex-combobox";

export default {
  components: {
    VExCombobox,
  },

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

    storeFilters: {
      type: Array,
      default: function () {
        return [];
      },
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

    // Template to render the list of items
    itemTemplate: {
      type: Object,
      default: null,
    },

    prependItemTemplate: {
      type: Object,
      default: null,
    },

    // Filters to be used when using the manual query mode (prototype)
    itemFilters: {
      type: Array,
      default: function () {
        return [];
      },
    },

    // Field validation rules
    rules: {
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

    maxChipWidth: {
      type: String,
      default: "150",
    },
  },

  model: {
    prop: "value",
    event: "updatevalue",
  },

  data() {
    return {
      ormNamespace: null,
      ormModel: null,

      modelValue: this.value,

      search: null,

      isFocused: false,
      isLoading: false,
      errorMessage: null,
      hintMessage: null,
      showMenu: false,

      NO_DATA_TEXT: this.emptyText
        ? this.emptyText
        : this.$t("No data available"),
      NO_SELECTION_TEXT: this.$t("No selection detected"),
      SERVER_ERROR_TEXT: this.$t("Error loading data"),
    };
  },

  created: function () {
    // Get the vuex-orm database
    const database = this.$store.$db();

    // Check if store is vuex-orm
    const modelsList = database.models();

    if (modelsList.hasOwnProperty(this.store)) {
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

        const items = this.ormModel.all();

        // Support for vuex-orm
        return items;
      } catch (e) {
        this.errorMessage = this.SERVER_ERROR;

        return [];
      }
    },
  },

  methods: {
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

        // Concat default filters with the query word
        let filters;
        if (value) {
          filters = this.storeFilters.concat({
            property: property,
            operator: "like",
            value: value,
          });
        }

        await this.ormModel.api().read({
          filters: value ? filters : this.storeFilters,
        });

        this.isLoading = false;

        this.showMenu = this.isFocused;
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

      this.onBlur();
    },

    checkClickInside: function (target, relatedTarget) {
      try {
        if (!relatedTarget) {
          return false;
        }

        const parent = relatedTarget.parentElement;

        if (!parent) {
          return false;
        }

        const targetIdStr = target.getAttribute("id");
        const parentIdStr = parent.getAttribute("id");

        const targetIdParts = targetIdStr.split("-");
        const parentIdParts = parentIdStr.split("-");

        const targetId = targetIdParts[targetIdParts.length - 1];
        const parentId = parentIdParts[parentIdParts.length - 1];

        return (
          targetId === parentId &&
          targetIdStr === `input-${targetId}` &&
          parentIdStr === `list-${parentId}`
        );
      } catch (e) {
        return false;
      }
    },

    onEnter: function () {
      this.search = null;
    },

    onInput: function (value, delay = null) {
      const self = this;

      this.errorMessage = null;

      if (!this.autoLoad || value === null) {
        return;
      }

      // Close menu on type
      this.showMenu = !!value && this.multiple;

      // If the input value is empty or is lower than a limit
      if (
        this.lowerLimit !== 0 &&
        (!value || value.length === 0 || value.length < this.lowerLimit)
      ) {
        return;
      }

      // Clear the previous timer
      if (this.timer) {
        clearTimeout(this.timer);
      }

      if (delay === null) {
        delay = this.delay;
      }

      // Set the timer to wait the delay before query
      this.timer = setTimeout(function () {
        // Emit event for the searched value
        self.$emit("input", value);

        // Query the store api with the searched value
        self.defaultLoad(value);
      }, delay);
    },

    onBlur: function (event) {
      // Defer blur if we click inside
      this.search = null;

      if (
        !!this.prependItemTemplate &&
        event &&
        this.checkClickInside(event.target, event.relatedTarget)
      ) {
        return false;
      }

      // Hide dropdown menu
      this.showMenu = false;

      this.isFocused = false;

      // Force blurring
      this.$nextTick(function () {
        if (this.$refs.combobox) {
          this.$refs.combobox.blur();
        }
      });
    },

    onFocus: function () {
      this.errorMessage = null;

      // Hide dropdown menu
      this.showMenu = false;

      this.isFocused = true;

      if (this.lowerLimit === 0) {
        this.onInput('', 0);
      }
    },

    onChange: function (value) {
      if (!value) {
        this.$emit("updatevalue", null);

        return;
      }

      let record = null;

      if (this.returnObject) {
        record = value;
      } else {
        record = value[this.itemValue];
      }

      this.showMenu = this.multiple;

      // Update the v-model with the selected record
      this.$emit("updatevalue", record);
    },

    onRemoveItem: function (item) {
      if (this.multiple) {
        const idx = this.modelValue.findIndex((r) => r === item);

        if (idx > -1) {
          this.modelValue.splice(idx, 1);

          this.$emit("updatevalue", this.modelValue);
        }
      } else {
        this.modelValue = null;

        this.$emit("updatevalue", this.modelValue);
      }
    },
  },

  watch: {
    isFocused: {
      handler: function (value) {
        // If blur
        if (!value) {
          // we clear the timer
          if (this.timer) {
            clearTimeout(this.timer);
          }
        }
      },
    },

    search: {
      handler: function (value) {
        this.onInput(value);
      },
    },

    value: {
      handler: function (value) {
        this.modelValue = value;
      },
    },
  },
};
</script>
<style scoped>
.custom-v-chip >>> .v-chip__content {
  width: 100%;
}
</style>