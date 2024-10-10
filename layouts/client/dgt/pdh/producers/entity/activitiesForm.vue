<template>
  <v-row class="mx-4">
    <!-- <v-col sm="12" md="12" lg="12" style="padding:0" class="d-flex justify-start align-center">
      <Label :options="options"></Label>
    </v-col>-->
    <v-col sm="12" md="12" lg="12" style="padding:0">
      <div class="d-flex flex-column flex-grow-1">
        <Table
          :height="400"
          hideFooter
          :headers="headers"
          :data="value"
          :style="hasError ? 'border: 2px solid var(--v-error-base)' : ''"
          @check="validate"
        ></Table>
        <v-sheet
          :value="hasError"
          class="v-messages error--text"
          style="padding: 0 12px"
          v-show="hasError"
        >{{$t('Required field. Select at least one activity.')}}</v-sheet>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import Label from "@/components/forms/fields/label.vue";
import Table from "@/components/tables/basic.vue";
import Textfield from "@/components/forms/fields/text.vue";

export default {
  components: {
    Label,
    Table,
    Textfield,
  },
  props: {
    options: {
      type: Object,
      default: function () {
        return {};
      },
    },

    model: null,
  },

  data() {
    return {
      headers: [
        // {
        //   text: "#",
        //   value: "order",
        //   width: 60,
        // },
        {
          text: "Nome da Actividade",
          value: "name",
          align: "left",
        },
        {
          text: "Activo",
          value: "active",
          renderer: {
            type: "checkbox",
            event: "check",
          },
        },
      ],
      value: [],

      equipment: null,

      error: null,

      shouldValidate: true,
      hasError: false,
    };
  },

  inject: {
    form: { default: null },
  },

  created: function () {
    // Include this components as a field to be validated
    this.form && this.form.register(this);

    this.value = this.model;
  },

  beforeDestroy() {
    // Unregister this component for form validation

    this.form && this.form.unregister(this);
  },

  model: {
    prop: "model",
    event: "change",
  },

  methods: {
    // Form reset
    reset: function () {},

    // Form reset validation
    resetValidation: function () {},

    // Form validation
    validate: function (force, value) {
      let valid = this.value && this.value.length > 1;

      if (valid) {
        const count = this.value.reduce(function (acc, val, idx) {
          const active = !!val.active;

          if (active) {
            acc++;
          }

          return acc;
        }, 0);

        if (count === 0) {
          valid = false;
        }
      }

      this.hasError = !valid;

      return (
        valid ||
        this.$t(
          "A consortium must be composed by at least two entities."
        )
      );
    },
  },

  watch: {
    value: {
      handler: function (value) {
        this.$emit("change", value);
      },
    },
  },
};
</script>
