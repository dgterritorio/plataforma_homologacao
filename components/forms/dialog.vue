<template>
  <v-dialog
    scrollable
    :max-width="width"
    v-model="show"
    @click:outside="onClose"
    @keydown.escape="onKeyEscape"
    @keydown.enter="onKeyEnter"
  >
    <v-card>
      <v-card-title class="unselectable">
        {{ headerPrefix }} {{ title }}
        <v-spacer></v-spacer>

        <v-btn icon @click="onClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-0">
        <BasicForm
          ref="form"
          :record="record"
          :model="fields"
          v-model="valid"
        ></BasicForm>
      </v-card-text>

      <v-card-actions>
        <v-btn color="" text @click="onCancel">Cancel</v-btn>
        <v-spacer></v-spacer>

        <v-btn
          :disabled="!valid"
          :color="`${submitColor}`"
          text
          @click="onSubmit"
          >{{ submitText }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import BasicForm from "@/components/forms/basic.vue";

export default {
  props: {
    fields: {
      type: Array,
      default: function () {
        return [];
      },
    },

    title: {
      type: String,
      default: "",
    },

    show: {
      type: Boolean,
      default: false,
    },

    width: {
      default: 500,
    },
  },

  components: {
    BasicForm,
  },

  model: {
    prop: "show_",
    event: "show",
  },

  data() {
    return {
      valid: false,
      operation: 0, // 0 - create, 1 - editing, 2 - deleting
      deleting: false,
      show_: this.show,
      record: {},
    };
  },

  computed: {
    headerPrefix: function () {
      let text = "";

      switch (this.operation) {
        case 0:
          text = this.$t("Create");
          break;
        case 1:
          text = this.$t("Edit");
          break;
        case 2:
          text = this.$t("Delete");
          break;
        default:
          break;
      }

      return text;
    },

    submitText: function () {
      return this.operation === 2 ? this.$t("Delete") : this.$t("Submit");
    },

    submitColor: function () {
      return this.operation === 2 ? "red darken-1" : "primary";
    },
  },

  methods: {
    create: function (record) {
      this.clear();

      this.record = record;

      this.operation = 0;

      this.$emit("show", true);
    },

    edit: function (record) {
      this.clear();

      this.record = record;

      this.operation = 1;

      this.$emit("show", true);
    },

    remove: function (record) {
      this.clear();

      this.record = record;

      this.operation = 2;

      this.$emit("show", true);
    },

    clear: function () {
      if (this.$refs.form) {
        this.$refs.form.clean();
      }
    },

    close: function () {
      this.onClose();
    },

    getRecord: function () {
      return this.record;
    },

    onSubmit: function () {
      const form = this.$refs.form;

      const record = form.getRecord();
      const dirty = form.getDirty();
      const operation = this.operation;

      let event = "";
      let payload = {
        record: record,
        dirty: dirty,
      };

      switch (operation) {
        case 0:
          event = "create";
          payload.editing = false;
          break;
        case 1:
          event = "edit";
          payload.editing = true;
          break;
        case 2:
          event = "delete";
          break;
        default:
          break;
      }

      this.$emit(event, payload);
    },

    onKeyEscape: function (event) {
      this.onClose();
    },

    onKeyEnter: function (event) {
      if (this.valid) {
        this.onSubmit();
      }
    },

    onClose: function (e) {
      this.$emit("show", false);
    },

    onCancel: function () {
      this.$emit("show", false);
    },
  },
};
</script>