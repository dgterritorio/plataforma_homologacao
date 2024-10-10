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
    <v-col sm="12" md="12" lg="12" style="padding: 0">
      <!-- Toolbar -->
      <v-toolbar color="grey lighten-4" dense flat>
        <!-- Edit/Preview -->
        <v-btn-toggle mandatory borderless color="primary accent-3">
          <v-btn small text @click="onEdit">
            {{ $t("Edit") }}
          </v-btn>

          <v-btn small text @click="onPreview">
            {{ $t("Preview") }}
          </v-btn>
        </v-btn-toggle>

        <v-spacer />

        <!-- Tools -->
        <div v-show="editing">
          <template v-for="(item, i) in buttons">
            <v-tooltip bottom :key="i">
              <template v-slot:activator="{ on }">
                <v-btn
                  small
                  icon
                  color="primary accent-3"
                  class="ml-2"
                  v-on="on"
                  @click="item.fn"
                >
                  <v-icon>{{ item.icon }}</v-icon></v-btn
                >
              </template>
              <span>{{ item.tooltip }}</span>
            </v-tooltip>
          </template>
        </div>
      </v-toolbar>
    </v-col>
    <v-col sm="12" md="12" lg="12" style="padding: 0">
      <v-textarea
        ref="textarea"
        v-show="editing"
        v-bind="options"
        :rules="setRules(options)"
        :height="height"
        v-model="value"
      ></v-textarea>

      <v-card
        ref="preview"
        outlined
        flat
        v-show="!editing"
        class="py-4 px-6 mb-6"
      >
        <div class="text-justify overide-vuetify" v-html="compiled"></div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import marked from "marked";
import Label from "@/components/forms/fields/label.vue";

export default {
  name: "Textareafield",

  components: {
    Label,
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

    model: null,
  },

  data() {
    return {
      value: null,

      error: null,

      editing: true,

      height: null,

      compiled: "",

      buttons: [
        {
          icon: "mdi-format-title",
          tooltip: this.$t("Title"),
          fn: this.formatTitle,
        },
        // {
        //   icon: "H2",
        //   tooltip: this.$t("Subtitle"),
        //   fn: null,
        // },
        {
          icon: "mdi-format-bold",
          tooltip: this.$t("Bold"),
          fn: this.formatBold,
        },
        {
          icon: "mdi-format-italic",
          tooltip: this.$t("Italic"),
          fn: this.formatItalic,
        },
        {
          icon: "mdi-format-quote-close",
          tooltip: this.$t("Blockquote"),
          fn: this.formatQuote,
        },

        {
          icon: "mdi-format-list-bulleted",
          tooltip: this.$t("Bullet list"),
          fn: this.formatBullet,
        },
      ],

      rules: {
        required: (value) => {
          const type = typeof value;

          let valid;

          switch (type) {
            case "string":
              valid = !!value;
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
    this.value = this.model;
  },

  model: {
    prop: "model",
    event: "change",
  },

  methods: {
    setRules: function (entry) {
      const rules = [];

      if (entry.required) {
        rules.push(this.rules.required);
      }

      if (entry.hasOwnProperty("validation")) {
        const validation = entry.validation;

        validation.forEach(function (rule) {
          if (typeof rule === "function") {
            rules.push(rule);
          }
        }, this);
      }

      return rules;
    },

    getSelection: function () {
      const textarea = this.$refs.textarea;
      const input = textarea.$refs.input;

      console.log(input);

      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;

      if (start === end) {
        return null;
      }

      return start !== end ? { start: start, end: end, text: text } : null;
    },

    formatTitle: function () {
      const selection = this.getSelection();

      if (!selection) {
        return;
      }

      const { text, start, end } = selection;

      const target = "## " + text.substring(start, end) + "\n";

      const inserted =
        text.substring(0, start) + target + text.substring(end, text.length);

      this.value = inserted;
    },

    formatBold: function () {
      const selection = this.getSelection();

      if (!selection) {
        return;
      }

      const { text, start, end } = selection;

      const target = "**" + text.substring(start, end) + "**";

      const inserted =
        text.substring(0, start) + target + text.substring(end, text.length);

      this.value = inserted;
    },

    formatItalic: function () {
      const selection = this.getSelection();

      if (!selection) {
        return;
      }

      const { text, start, end } = selection;

      const target = "_" + text.substring(start, end) + "_";

      const inserted =
        text.substring(0, start) + target + text.substring(end, text.length);

      this.value = inserted;
    },

    formatQuote: function () {
      const selection = this.getSelection();

      if (!selection) {
        return;
      }

      const { text, start, end } = selection;

      const target = "> " + text.substring(start, end);

      const inserted =
        text.substring(0, start) + target + text.substring(end, text.length);

      this.value = inserted;
    },

    formatBullet: function () {
      const selection = this.getSelection();

      if (!selection) {
        return;
      }

      const { text, start, end } = selection;

      const target = "* " + text.substring(start, end) + "\n";

      const inserted =
        text.substring(0, start) + target + text.substring(end, text.length);

      this.value = inserted;
    },

    onEdit: function () {
      this.editing = true;
    },

    onPreview: function () {
      this.compiled = marked(this.value || "");

      this.editing = false;
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
  },
};
</script>
<style scoped>
.overide-vuetify >>> p {
  margin: 0 !important;
}
</style>