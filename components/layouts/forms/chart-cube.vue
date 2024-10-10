<template>
  <v-dialog v-model="show" scrollable persistent max-width="700">
    <v-card>
      <v-card-title class="unselectable"
        >{{ $t("Chart Configuration") }} <v-spacer />
        <v-btn icon @click="onClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid" onSubmit="return false;">
          <v-row>
            <v-col cols="12" md="12" lg="12" class="mt-2">
              <h6>{{ $t("Chart") }}</h6>
              <v-divider class="my-0 py-0" />
            </v-col>

            <!-- Title field -->
            <v-col cols="12" md="12" lg="12">
              <v-text-field
                :label="$t('Title')"
                v-model="record.title"
                hide-details
                dense
                outlined
              ></v-text-field>
            </v-col>

            <!-- Chart type field -->
            <!-- { label: $t('Pie'), value: 'pie-chart' },
                  { label: $t('Scatter'), value: 'scatter-chart' }, -->

            <v-col cols="12" md="12" lg="6">
              <v-select
                :label="$t('Chart Type')"
                item-text="label"
                item-value="value"
                :items="[
                  { label: $t('Line'), value: 'line-chart' },
                  { label: $t('Column'), value: 'column-chart' },
                  { label: $t('Bar'), value: 'bar-chart' },
                  { label: $t('Area'), value: 'area-chart' },
                ]"
                dense
                outlined
                hide-details
                :menu-props="{
                  'offset-y': true,
                  bottom: true,
                }"
                v-model="record.type"
              />
            </v-col>

            <!-- Chart stacked field -->
            <v-col
              class="pt-0"
              cols="12"
              md="12"
              lg="6"
              v-if="record.type === 'column-chart'"
            >
              <v-switch
                :label="$t('Stacked')"
                hide-details
                v-model="record.stacked"
                dense
              ></v-switch>
            </v-col>

            <v-col cols="12" md="12" lg="12" class="mt-2">
              <h6>{{ $t("Data") }}</h6>
              <v-divider class="my-0 py-0" />
            </v-col>

            <!-- Domain field -->
            <v-col cols="12" md="12" lg="6">
              <v-select
                dense
                :label="$t('Domain')"
                itemText="title"
                itemValue="name"
                :items="domains"
                :rules="[validateEmpty]"
                outlined
                hide-details
                :menu-props="{
                  'offset-y': true,
                  bottom: true,
                }"
                v-model="record.domain"
                @change="onUpdateDomain"
              />
            </v-col>

            <!-- Measures field -->
            <v-col cols="12" md="12" lg="6">
              <v-select
                :label="$t('Measures')"
                itemText="shortTitle"
                itemValue="name"
                :items="comboboxes.measures"
                clearable
                multiple
                dense
                :rules="[validateEmpty]"
                outlined
                hide-details
                :menu-props="{
                  'offset-y': true,
                  bottom: true,
                }"
                v-model="record.measures"
              />
            </v-col>

            <!-- Dimensions field -->
            <v-col cols="12" md="12" lg="6">
              <v-select
                :label="$t('Categories')"
                itemText="shortTitle"
                itemValue="name"
                :items="comboboxes.dimensions"
                clearable
                multiple
                dense
                outlined
                hide-details
                :menu-props="{
                  'offset-y': true,
                  bottom: true,
                }"
                v-model="record.dimensions"
              />
            </v-col>

            <!-- Time dimensions field -->
            <v-col cols="12" md="12" lg="6">
              <v-select
                v-if="comboboxes.timeDimensions.length"
                :label="$t('Time Dimensions')"
                itemText="shortTitle"
                itemValue="name"
                :items="comboboxes.timeDimensions"
                :rules="[validateEmpty]"
                dense
                outlined
                hide-details
                :menu-props="{
                  'offset-y': true,
                  bottom: true,
                }"
                v-model="record.timeDimension"
              />
            </v-col>

            <!-- Granularity field -->
            <v-col v-if="!hide.granularity" cols="12" md="12" lg="6">
              <v-select
                v-if="comboboxes.timeDimensions.length"
                :label="$t('Granularity')"
                :items="comboboxes.granularities"
                itemText="title"
                itemValue="name"
                :rules="[validateEmpty]"
                dense
                outlined
                hide-details
                :menu-props="{
                  'offset-y': true,
                  bottom: true,
                }"
                v-model="record.granularity"
              />
            </v-col>

            <!-- Date range field -->
            <v-col v-if="!hide.timeInterval" cols="12" md="12" lg="6">
              <v-select
                v-if="comboboxes.timeDimensions.length"
                :label="$t('Date Range')"
                itemText="l"
                itemValue="v"
                :rules="[validateEmpty]"
                dense
                outlined
                hide-details
                :menu-props="{
                  'offset-y': true,
                  bottom: true,
                }"
                v-model="record.dateRange"
                :items="comboboxes.dateRange"
              />
            </v-col>

            <v-col
              v-if="templates.filters"
              cols="12"
              md="12"
              lg="12"
              class="mt-2"
            >
              <h6>{{ $t("Filters") }}</h6>
              <v-divider class="my-0 py-0" />
            </v-col>

            <!-- Custom filters -->
            <component
              v-if="templates.filters"
              ref="custom-filters"
              :is="templates.filters"
              :filters="filters"
              :availableOptions="comboboxes"
            />
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Form actions -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="onClose">{{ $t("Cancel") }}</v-btn>
        <v-btn :disabled="!valid" text color="primary" @click="onSave">{{
          $t("Save")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Search from "@/components/comboboxes/search.vue";

export default {
  components: {
    Search,
  },

  props: {
    templates: {
      type: Object,
      default: function () {
        return {};
      },
    },

    comboboxes: {
      type: Object,
      default: function () {
        return {};
      },
    },

    domains: {
      type: Array,
      default: function(){
        return [];
      }
    },

    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    filters: {
      type: Object,
      default: function () {
        return {};
      },
    },

    show: {
      type: Boolean,
      default: false,
    },

    hide: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },

  data() {
    return {
      show_: this.show,
      valid: false,
    };
  },

  model: {
    prop: "show_",
    event: "show",
  },

  methods: {
    validateEmpty: function (value) {
      let valid;

      switch (typeof value) {
        case "string":
          valid = value && value.length > 0;
          break;
        case "boolean":
          valid = value !== null && value !== undefined;
          break;
        case "object":
          if (Array.isArray(value)) {
            valid = value.length > 0;
          } else {
            valid = value !== null && value !== undefined;
          }
          break;
        case "number":
          valid = !isNaN(value);
          break;
        default:
          valid = false;
          break;
      }

      return valid;
    },

    onUpdateDomain: function (value) {
      this.$emit("updatedomain", value);
    },

    onClose: function () {
      // this.show_ = false;

      this.$emit("show", false);
    },

    onSave: function () {
      this.$emit("save", this.record);

      this.onClose();
    },
  },

  watch: {
    show: {
      handler: function (value) {
        this.show_ = value;
      },
    },
  },
};
</script>