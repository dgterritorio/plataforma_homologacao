<template>
  <div style="height: 100%">
    <v-card class="unselectable dashboard-title" style="height: 100%">
      <v-card-title>
        {{ options.title }}

        <v-spacer></v-spacer>

        <v-menu
          v-if="showEdit && !editing"
          transition="slide-y-transition"
          bottom
          left
          offset-y
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>{{ "mdi-cog" }}</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="onEditGrid()">
              <v-list-item-title
                ><v-icon left>mdi-table-edit</v-icon
                >{{ $t("Edit grid") }}</v-list-item-title
              >
            </v-list-item>
            <v-list-item @click="onEdit()">
              <v-list-item-title
                ><v-icon left>mdi-square-edit-outline</v-icon
                >{{ $t("Edit component") }}</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>
    </v-card>

    <v-dialog v-model="form.show" scrollable persistent max-width="400">
      <v-card height="100%">
        <v-card-title class="unselectable"
          >{{ $t("Text Box Configuration") }} <v-spacer />
          <v-btn icon @click="onCancel">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="form.valid" onSubmit="return false;">
            <v-row>
              <v-col cols="12" md="12" lg="12">
                <v-text-field
                  :label="$t('Title')"
                  hide-details
                  dense
                  outlined
                  v-model="form.record.title"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="onCancel">{{ $t("Cancel") }}</v-btn>
          <v-btn :disabled="!form.valid" text color="primary" @click="onSave">{{
            $t("Save")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "dashboard.section-title",

  components: {},

  props: {
    options: {
      type: Object,
      default: function () {
        return {
          title: "Novo Título",
        };
      },
    },

    showEdit: {
      type: Boolean,
      default: true,
    },

    editing: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      form: {
        record: {
          title: null,
        },

        show: false,
        valid: false,
      },
    };
  },

  methods: {
    onEditGrid: function () {
      this.$emit("editgrid", true);
    },

    onEdit: function () {
      this.form.record.title = this.options.title;

      this.form.show = true;
    },

    onSave: function () {
      this.form.show = false;

      this.options.title = this.form.record.title;

      this.$emit("save", this.options);
    },

    onCancel: function () {
      this.form.show = false;
    },
  },
};
</script>
<style scoped>
.dashboard-title >>> .v-card__title {
  height: 100%;
  padding: 0 18px !important;
}
</style>
