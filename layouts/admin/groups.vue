<template>
  <client-only>
    <v-row class="fill-height" align="start" justify="center">
      <v-dialog v-model="dialog" max-width="350">
        <v-card>
          <v-card-title>{{formTitle}}</v-card-title>

          <v-card-text>
            <BasicForm ref="form" :record="record" :model="formFields" v-model="valid"></BasicForm>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="cancelForm">Cancel</v-btn>

            <v-btn :disabled="valid" color="green darken-1" text @click="submitForm">Submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-col :sm="12" :md="12" :lg="12">
        <BasicTable
          :headers="tableColumns"
          height="70vh"
          :store="'webapp.groups'"
          :title="$t('Grupos')"
          :remoteFilters="filters"
          :sortBy="'id'"
          :sortDesc="true"
          @group-edit="onEdit"
          @group-delete="onDelete"
        >
          <template v-slot:actions>
            <v-btn color="primary" text @click="onAdd">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </BasicTable>
      </v-col>
    </v-row>
  </client-only>
</template>


<script>
import BasicTable from "@/components/tables/basic.vue";

import BasicForm from "@/components/forms/basic.vue";
import Textfield from "@/components/forms/fields/text.vue";
import Switchfield from "@/components/forms/fields/switch.vue";

const columns = [
  {
    text: "id",
    value: "id",
    width: 60,
    filterable: {
      operator: "eq",
    },
  },
  {
    text: "Nome",
    value: "name",
    filterable: {
      type: "string",
    },
    renderer: {
      type:'simple',
      fn: function(val){
        return val;
      }
    }
  },
  {
    text: "Data de Criação",
    value: "creation_date",
    renderer: {
      type: "simple",
      value: "creation_date_s",
    },
    filterable: {
      type: "date",
      property: "creation_date",
      operator: "eq",
    },
  },
  {
    text: "Data de Modificação",
    value: "mod_date",
    renderer: {
      type: "simple",
      value: "mod_date_s",
    },
    filterable: {
      type: "date",
      property: "mod_date",
      operator: "eq",
    },
  },
  {
    text: "Omissão",
    value: "omission",
    width: 100,
    renderer: {
      type: "simple",
      value: "omission",
      fn: function (value) {
        return value ? "Sim" : "Não";
      },
    },
  },
  {
    text: "Editar",
    value: "edit",
    renderer: {
      type: "action",
      event: "group-edit",
      icon: "mdi-pencil",
    },
    width: 80,
  },
  {
    text: "Eliminar",
    value: "delete",
    renderer: {
      type: "action",
      event: "group-delete",
      icon: "mdi-delete",
    },
    width: 80,
  },
];

const fFields = [
  {
    cmp: Textfield,
    text: "Name",
    value: "name",
    required: true,
  },
  {
    cmp: Switchfield,
    text: "Omission",
    value: "omission",
    required: true,
  },
];

export default {
  name: "admin-groups",

  components: {
    BasicTable,
    BasicForm,
  },

  data() {
    return {
      store: null,
      dialog: false,
      valid: true,
      formTitle: "Create Group",
      formUpdate: false,

      record: {},

      filters: [],

      tableColumns: columns,
      formFields: fFields,
    };
  },

  created: async function () {
    this.store = this.$store.$db().model("webapp.groups");

    if (process.client) {
      const id = this.$auth.user.id;
    }
  },

  methods: {
    onAdd: async function (event) {
      this.formTitle = "Create Group";
      this.formUpdate = false;
      this.record = { name: "", omission: false };

      this.dialog = true;
    },
    onEdit: async function (model) {
      this.formTitle = "Edit Group";
      this.formUpdate = true;
      this.record = model;

      this.dialog = true;
    },
    onDelete: async function (model) {
      // this.store.api().delete(model);
      model.$delete();
    },
    cancelForm: function (event) {
      this.$refs.form.reset();
      this.dialog = false;
    },
    submitForm: function (event) {
      if (this.formUpdate) {
        //TODO: get only dirties
        let data = this.$refs.form.getRecord();
        data["mod_date"] = new Date().toISOString();

        // this.store.update(this.record);
        data.$save();
      } else {
        this.store.insert({ data: [this.record] });
      }

      this.dialog = false;
    },
  },
};
</script>
