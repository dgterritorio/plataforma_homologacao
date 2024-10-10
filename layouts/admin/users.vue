<template>
  <client-only>
    <v-row class="fill-height" align="start" justify="center">
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-card-title>{{ formTitle }}</v-card-title>

          <v-card-text>
            <BasicForm
              ref="usersform"
              :record="record"
              :model="formFields"
              v-model="valid"
            ></BasicForm>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="cancelForm"
              >Cancel</v-btn
            >

            <v-btn
              :disabled="!valid"
              color="green darken-1"
              text
              @click="submitForm"
              >Submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="sessionsDialog" max-width="1375">
        <v-card>
          <v-card-title>
            {{ `${$t("Sessions for user")}: ${selectedUserName}` }}
            <v-spacer></v-spacer>
            <v-btn icon @click="sessionsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <BasicTable
            :headers="sessionsTableColumns"
            :store="'webapp.sessions'"
            :defaultFilters="sessionsFilters"
            :defaultSortBy="'last_activity'"
            :defaultSortOrder="false"
            @session-end="onSessionEnd"
          />
        </v-card>
      </v-dialog>

      <v-col :sm="12" :md="12" :lg="12">
        <BasicTable
          :headers="tableColumns"
          height="70vh"
          :store="'webapp.users'"
          :title="$t('Utilizadores')"
          :remoteFilters="filters"
          :sortBy="'id'"
          :sortDesc="true"
          @user-edit="onEdit"
          @user-sessions="onInspectUserSessions"
          @user-delete="onBeforeDelete"
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
import sha1 from "crypto-js/sha1";

import BasicTable from "@/components/tables/basic.vue";
import BasicForm from "@/components/forms/basic.vue";
import Textfield from "@/components/forms/fields/text.vue";
import RemoteSelectfield from "@/components/forms/fields/remotecombobox.vue";
import Switchfield from "@/components/forms/fields/switch.vue";

const columns = [
  {
    text: "ID",
    value: "id",
    width: 65,
    divider: true,
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
  },
  {
    text: "Grupo",
    value: "group_id",
    renderer: {
      type: "chip",
      store: "entities/webapp.groups",
      text: "name",
      value: "id",
      storeRead: "all",
    },
  },
  {
    text: "Email",
    value: "email",
    filterable: {
      type: "string",
    },
  },
  {
    text: "Empresa",
    value: "empresas",
    filterable: {
      type: "string",
    },
    sortable: false,
    hide: true
  },
  {
    text: "Confirmado",
    value: "confirmed",
    width: 115,
    renderer: {
      type: "simple",
      value: "confirmed",
      fn: function (value) {
        return value ? "Sim" : "Não";
      },
    },
  },
  {
    text: "Ativo",
    value: "active",
    width: 85,
    renderer: {
      type: "simple",
      value: "active",
      fn: function (value) {
        return value ? "Sim" : "Não";
      },
    },
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
    text: "Sessões",
    value: "sessions",
    renderer: {
      type: "action",
      event: "user-sessions",
      icon: "mdi-text-search",
    },
    width: 85,
  },
  {
    text: "Editar",
    value: "edit",
    renderer: {
      type: "action",
      event: "user-edit",
      icon: "mdi-pencil",
    },
    width: 85,
  },
  {
    text: "Desativar",
    value: "delete",
    renderer: {
      type: "action",
      event: "user-delete",
      icon: "mdi-delete",
    },
    width: 85,
  },
];

const sessionsTableColumns = [
  {
    text: "ID Utilizador",
    value: "user_id",
    width: 65,
  },
  {
    text: "Última Atividade",
    value: "last_activity",
  },
  {
    text: "Data de Login",
    value: "login",
  },
  {
    text: "Data de Logout",
    value: "logout",
  },
  {
    text: "Ativo",
    value: "ativo",
    renderer: {
      type: "simple",
      value: "ativo",
      fn: function (val) {
        return val ? "Sim" : "Não";
      },
    },
  },
  {
    text: "Browser",
    value: "browser",
  },
  {
    text: "Nome",
    value: "host_name",
  },
  {
    text: "IP",
    value: "ip",
  },
  {
    text: "Terminar Sessão",
    value: "terminate",
    renderer: {
      type: "action",
      event: "session-end",
      icon: "mdi-close-box-outline",
      disabler: function (item) {
        return !item.ativo;
      },
    },
    width: 85,
  },
];

export default {
  name: "admin-users",

  components: {
    BasicTable,
    BasicForm,
    RemoteSelectfield,
  },

  data() {
    return {
      store: null,
      dialog: false,
      sessionsDialog: false,

      filters: [],
      sessionsFilters: [],
      tableColumns: columns,
      sessionsTableColumns: sessionsTableColumns,

      selectedUserName: "",

      record: {},

      valid: true,
      formTitle: "Create User",
      formUpdate: false,
      formFields: [
        {
          cmp: Textfield,
          text: this.$t("Name"),
          value: "name",
          required: true,
        },
        {
          cmp: Textfield,
          text: this.$t("Email"),
          value: "email",
          validation: ["email"],
          required: true,
        },
        {
          cmp: RemoteSelectfield,
          text: this.$t("User Group"),
          value: "group_id",
          required: true,
          store: "webapp.groups",
          storeGetter: "all",
          itemText: "name",
          itemValue: "id",
          cols: 8,
        },
        {
          cmp: Textfield,
          text: this.$t("Password"),
          value: "password",
          type: "password",
          required: true,
          validation: ["min6"],
        },
        {
          cmp: Switchfield,
          text: this.$t("Confirmado"),
          value: "confirmed",
          required: true,
          cols: 6,
        },
        {
          cmp: Switchfield,
          text: this.$t("Ativo"),
          value: "active",
          required: true,
          cols: 6,
        },
      ],
    };
  },

  created: async function () {
    if (process.client) {
      this.store = this.$store.$db().model("webapp.users");
      this.storeUserGroups = this.$store.$db().model("webapp.groups");

      // TODO: Detetar se a store já foi preenchida
      if (this.storeUserGroups) {
        this.storeUserGroups.api().read({
          limit: 100,
          forceLoad: true,
          filters: [{ property: "reserved", value: true, operator: "eq" }],
        });
      }
    }
  },

  methods: {
    onAdd: async function (event) {
      this.formTitle = this.$t("Create User");
      this.formUpdate = false;
      this.record = {
        name: null,
        email: null,
        password: null,
        confirmed: false,
        active: false,
      };

      // Set password to required
      this.formFields[3].required = true;
      this.formFields[3].validation = ["min6"];
      this.formFields[3].ignoreField = false;
      this.formFields[1].readonly = false;

      this.dialog = true;
    },
    onEdit: async function (model) {
      this.formTitle = this.$t("Edit User");
      this.formUpdate = true;
      this.record = model;

      // Set password to not required
      this.formFields[3].required = false;
      this.formFields[3].validation = [];
      this.formFields[3].ignoreField = true;
      this.formFields[1].readonly = true;

      this.dialog = true;
    },
    onDelete: async function ({ model }) {
      this.store.update({
        where: model.id,
        data: { active: false },
      });

      // TODO: Substituir isto pelo update
      // model.active = false;
      // model.$save();
    },

    onBeforeDelete: function (model) {
      this.$store.commit("SET_DIALOGMSG", {
        title: "Aviso!",
        text: "<p>Esta operação apenas desativa e bloqueia o login do utilizador.</p>",
        icon: "mdi-alert",
        color: "red",
        okText: "Confirmar",
        cancelText: "Cancel",
        okFn: this.onDelete,
        okParams: { model: model },
      });
    },

    cancelForm: function (event) {
      this.$refs.usersform.reset();
      this.dialog = false;
    },
    submitForm: function (event) {
      if (this.formUpdate) {
        const data = this.$refs.usersform.getRecord();
        const dirty = this.$refs.usersform.getDirty();

        // const password = data.password;

        // // Do not update password if it wasnt reset
        // if (password && password.length) {
        //   data["password"] = sha1(data["password"]).toString();
        // }

        data["mod_date"] = new Date().toISOString();

        // Set the id for update
        // data["id"] = record.id;

        data.$save();
        // this.store.update(this.record);
      } else {
        this.record["password"] = sha1(this.record["password"]).toString();
        this.store.insert({ data: [this.record] });
      }

      this.dialog = false;
    },

    onInspectUserSessions: async function (row) {
      this.selectedUserName = row.name;

      this.sessionsFilters = [
        {
          operator: "eq",
          property: "user_id",
          value: row.id,
        },
      ];

      this.sessionsDialog = true;
    },

    onSessionEnd: function (record) {
      record["ativo"] = false;

      record.$save();
    },
  },
};
</script>
