<template>
  <FormSection :flat="flat" :title="title" class="mx-4">
    <template v-slot:body>
      <!-- <DisplayField v-for="(field, i) in fields" :key="i" :label="field.label" :value="record[field.value]"></DisplayField> -->
      <slot name="body">
        <v-row v-if="fields.length" style="margin:0;">
          <v-col :sm="12" :md="12" :lg="12" style="padding: 0;">
            <DisplayField
              v-for="(field, i) in fields"
              :key="i"
              :options="{text:field.label, align: 'center'}"
              :model="field.hasOwnProperty('value') ? record[field.value] : field.default"
            ></DisplayField>
          </v-col>
        </v-row>
      </slot>
    </template>
  </FormSection>
</template>
<script>
// import DisplayField from "@/components/cards/displayField.vue";
import DisplayField from "@/components/forms/fields/display.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

export default {
  components: {
    DisplayField,
    FormSection,
  },
  props: {
    title: {
      type: String,
      default: "",
    },

    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    fields: {
      type: Array,
      default: function () {
        return [];
      },
    },

    flat: {
      type: Boolean,
      default: false,
    },
  },
};
</script>