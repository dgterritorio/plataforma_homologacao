<template>
  <v-row class="mx-4">
    <v-col sm="12" md="12" lg="12" style="padding:0" class="d-flex justify-start align-center">
      <Label :options="options"></Label>
    </v-col>
    <v-col sm="12" md="12" lg="12" style="padding:0">
      <div class="d-flex flex-column flex-grow-1">
        <Search
          :label="$t('Digite o nome do produtor e adicione à lista (mín. 4 caracteres)')"
          :emptyText="'Produtor não encontrado'"
          itemText="name"
          itemValue="id"
          store="OfficialProducers"
          storeRead="read"
          storeGetter="all"
          outlined
          dense
          hideDetails
          @updatevalue="onAdd"
        ></Search>
        <Table
          :height="200"
          hideFooter
          :headers="options.headers"
          :data="value"
          :style="hasError && showError ? 'border: 2px solid var(--v-error-base)' : ''"
          @remove="onRemove"
        ></Table>
        <v-sheet
          :value="hasError"
          class="v-messages error--text"
          style="padding: 0 12px"
          v-show="hasError && showError"
        >{{$t('Required field. Add at least two entities.')}}</v-sheet>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";
import Table from "@/components/tables/basic.vue";
import Search from "@/components/comboboxes/search.vue";

export default {
  components: {
    Label,
    Table,
    Search
  },
  props: {
    options: {
      type: Object,
      default: function() {
        return {};
      }
    },

    // TODO
    // mask: "### ### ###",

    model: null
  },

  data() {
    return {
      value: [],

      error: null,

      shouldValidate: true,
      hasError: false,
      showError: false
    };
  },

  inject: {
    form: { default: null }
  },

  created: function() {
    // Include this components as a field to be validated
    this.form && this.form.register(this);

    this.value = this.model;

    this.validate();

    this.showError = false;
  },

  beforeDestroy() {
    // Unregister this component for form validation

    this.form && this.form.unregister(this);
  },

  model: {
    prop: "model",
    event: "change"
  },

  methods: {
    // Form reset
    reset: function() {},

    // Form reset validation
    resetValidation: function() {},

    // Form validation
    validate: function(force, value) {
      const hasElements = this.value && this.value.length > 1;

      this.hasError = !hasElements;

      this.showError = true;

      return hasElements;// || this.$t('A consortium must be composed by at least two entities.');
    },

    onAdd: function(record) {
      if (!record) {
        return;
      }

      const idx = this.value.findIndex(function(row) {
        return row.id === record.id;
      });

      if (idx === -1) {
        this.value.push(record);

        if (this.hasError) this.validate();
      }
    },

    onRemove: function(selected) {
      const id = selected.id;

      const idx = this.value.findIndex(function(record) {
        return record.id === id;
      });

      this.value.splice(idx, 1);

      this.validate();
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