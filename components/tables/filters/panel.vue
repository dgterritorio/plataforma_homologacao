<template>
  <v-card max-height="80vh">
    <v-card-title>
      {{ $t("Table Filters") }}
      <v-spacer> </v-spacer>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            icon
            :color="showHidden ? 'primary' : ''"
            @click="showHidden = !showHidden"
          >
            <v-icon>mdi-filter-off-outline</v-icon></v-btn
          >
        </template>

        {{ $t("Show non-filterable columns") }}
      </v-tooltip>

      <v-btn icon @click="onClose"> <v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>

    <v-card-text>
      <template v-for="(header, i) in headers">
        <div class="my-4" :key="'filter-' + i" v-if="!header.hide">
          <template v-if="header.filterable">
            <span class="subtitle-2 unselectable">{{ header.text }} </span>

            <Combobox
              v-if="header.filterable.type === 'combobox'"
              :label="$t('Filter by') + ' ' + header.text.toLowerCase()"
              :store="header.filterable.store"
              :storeGetter="header.filterable.storeRead"
              :itemText="header.filterable.itemText"
              :itemValue="header.filterable.itemValue"
              :itemDetails="header.filterable.itemDetails"
              :listCmp="header.filterable.listCmp"
              :values="header.filterable.values"
              :multiple="!!header.filterable.multiple"
              hideDetails
              :rules="{ allowEmpty: true }"
              clearable
              outlined
              dense
              v-model="values[header.filterable.itemKey ? header.filterable.itemKey : header.value]"
              @input="dirty = true"
            ></Combobox>

            <Date
              v-else-if="header.filterable.type === 'date'"
              :label="header.text.toLowerCase()"
              outlined
              dense
              clearable
              v-model="values[header.filterable.itemKey ? header.filterable.itemKey : header.value]"
              @input="dirty = true"
            ></Date>

            <v-text-field
              v-else
              :label="$t('Filter by') + ' ' + header.text.toLowerCase()"
              v-model="values[header.filterable.itemKey ? header.filterable.itemKey : header.value]"
              clearable
              outlined
              dense
              hide-details
              @input="dirty = true"
            ></v-text-field>
          </template>

          <template
            v-else-if="
              showHidden &&
              (!header.hasOwnProperty('renderer') ||
                (header.hasOwnProperty('renderer') &&
                  header.renderer.type !== 'action'))
            "
          >
            <span class="subtitle-2 unselectable">{{ header.text }} </span>

            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn disabled block outlined>
                  <v-icon v-on="on">mdi-filter-off</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("No filter available") }}</span>
            </v-tooltip>
          </template>
        </div>
      </template>
    </v-card-text>

    <v-card-actions>
      <v-btn text color="" @click="onClose">{{ $t("Cancel") }}</v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="dirty === false"
        @click="onFilter"
        >{{ $t("Confirm") }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import Combobox from "@/components/comboboxes/basic.vue";
import Date from "@/components/tables/filters/date.vue";

export default {
  components: {
    Combobox,
    Date,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },

    headers: {
      type: Array,
      default: function () {
        return [];
      },
    },

    delay: {
      type: Number,
      default: 400,
    },
  },

  data() {
    return {
      dirty: false,
      show_: this.show,
      showHidden: false,
      timeout: null,
      list: {},
      values: {},
      filters: [],
      operators: {},
    };
  },

  model: {
    prop: "show",
    event: "show",
  },

  created: function () {
    // TODO: Remove this in a later patch.
    // This cycle is executed twice since we also execute it in the vue template
    this.headers.forEach(function (header) {
      if (
        header.hasOwnProperty("filterable") &&
        header.filterable.hasOwnProperty("operator")
      ) {
        const operator = header.filterable.operator;

        this.operators[header.value] = operator;
      }
    }, this);
  },

  methods: {
    clear: function () {
      this.onClearFilters();
    },

    onClearField: function () {
      // this.onSearch();
    },

    onClearFilters: function () {
      const values = this.values;

      const keys = Object.keys(values);

      for (let key of keys) {
        values[key] = null;
      }

      this.filters = [];

      this.$emit("filter", this.filters);
    },

    onFilter: function () {
      if (this.dirty) {
        const filters = [];

        const values = this.values;

        const keys = Object.keys(values);

        for (let k of keys) {
          const payload = values[k];

          const property = k;

          let value = null,
            operator = null,
            type = null;

          if (payload === null) {
            continue;
          }

          if(Array.isArray(payload)){
            value = payload;
            operator = 'in';
            type = null;
          } else if (typeof payload === "object") {
            value = payload.value;
            operator = payload.operator;
            type = payload.type;
          } else if (this.operators.hasOwnProperty(k)) {
            value = payload;
            operator = this.operators[k];
          } else {
            value = payload;
            operator = "like";
          }

          if (value !== null && value !== undefined && value !== "") {
            const filter = {
              property: property,
              value: value,
              operator: operator,
            };

            if (type) {
              filter["type"] = type;
            }

            filters.push(filter);
          }
        }

        this.filters = filters;

        this.$emit("filter", filters);
      }

      this.onClose();
    },

    onClose: function () {
      this.dirty = false;

      this.$emit("close");
    },
  },
};
</script>
<style scoped>
.no-filter-text {
  border-radius: 4px;
  flex: 0 0 auto;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.26) !important;
  opacity: 0.6;
  letter-spacing: 0.0892857143em;
  justify-content: center;
  outline: 0;
  position: relative;
  text-decoration: none;
  text-indent: 0.0892857143em;
  text-transform: uppercase;
  transition-duration: 0.28s;
  transition-property: box-shadow, transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
}
</style>