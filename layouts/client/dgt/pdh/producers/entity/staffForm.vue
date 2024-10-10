<template>
  <v-row class="mx-4">
    <v-col sm="12" md="12" lg="12" style="padding:0" class="d-flex justify-start align-center">
      <Label :options="options"></Label>
    </v-col>
    <v-col sm="12" md="12" lg="12" style="padding:0">
      <div class="d-flex flex-column flex-grow-1">
        <div class="d-flex">
          <Textfield
            style="margin: 0 !important"
            :options="{hint:$t('Nome Técnico'), dense: true}"
            v-model="tech_name"
          ></Textfield>

          <Textfield
            :options="{hint:$t('Habilitações Académicas'), dense: true}"
            v-model="tech_skills"
          ></Textfield>

          <v-btn outlined color="primary" style="margin-top: 10px" @click="onAdd">
            <v-icon left>{{'mdi-plus'}}</v-icon>
            {{$t('Add Member')}}
          </v-btn>
        </div>

        <Table
          :height="200"
          hideFooter
          :headers="headers"
          :data="value"
          :style="hasError ? 'border: 2px solid var(--v-error-base)' : ''"
          @remove="onRemove"
        ></Table>
        <v-sheet
          :value="hasError"
          class="v-messages error--text"
          style="padding: 0 12px"
          v-show="hasError"
        >{{$t('Required field. Add at least one equipment.')}}</v-sheet>
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
        {
          text: "#",
          value: "order",
          width: 60,
        },
        {
          text: "Nome",
          value: "name",
        },
        {
          text: "H. Académicas",
          value: "skills",
        },
        {
          text: "Remover",
          value: "remove",
          renderer: {
            type: "action",
            event: "remove",
            icon: "mdi-close",
          },
        },
      ],
      value: [],

      tech_name: "",
      tech_skills: "",

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
      const hasElements = this.value && this.value.length > 0;

      this.hasError = false;//!hasElements;

      return true;
      // (
      //   hasElements ||
      //   this.$t(
      //     "A consortium must be composed by at least two entities."
      //   )
      // );
    },

    onAdd: function () {
      const name = this.tech_name;
      const skills = this.tech_skills;

      if (!name || !skills) {
        return;
      }

      if (!name.length || !skills.length) {
        return;
      }

      const idx = this.value.findIndex(function (row) {
        return row.name === name;
      });

      if (idx === -1) {
        const len = this.value.length;

        this.value.push({ order: len + 1, name: name, skills: skills, type: 1 });

        this.tech_name = null;
        this.tech_skills = null;

        if (this.hasError) this.validate();
      }
    },

    onRemove: function (selected) {
      const name = selected.name;

      const idx = this.value.findIndex(function (record) {
        return record.name === name;
      });

      this.value.splice(idx, 1);

      this.validate();
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
