<template>
  <client-only>
    <v-row class="align-self-stretch">
      <v-col class="text-center">
        <BasicTable
          :headers="tableColumnsLeft"
          height="70vh"
          :store="'Menus'"
          :title="$t('Menu')"
          :sortBy="'id'"
          :sortDesc="true"
          selectable
          @select="onMenuSelect"
        ></BasicTable>
      </v-col>

      <v-col>
        <BasicTable
          :headers="tableColumnsRight"
          height="70vh"
          :remoteFilters="filters"
          :store="'Permission'"
          :title="$t('Permissões')"
          :sortBy="'menu_id'"
          :sortDesc="true"
          @changePermission="onChangePermission"
        ></BasicTable>
      </v-col>
    </v-row>
  </client-only>
</template>


<script>
import BasicTable from "@/components/tables/basic.vue";

const cols_left = [
  {
    text: "ID",
    value: "id",
    width: 65,
    filterable: {
      operator: "eq",
    },
  },
  {
    text: "Título",
    value: "title",
    filterable: {
      type: "string",
    },
  },
  {
    text: "Rota",
    value: "route",
    filterable: {
      type: "string",
    },
  },
  {
    text: "Icon",
    value: "icon",
    filterable: {
      type: "string",
    },
  },
];

const cols_right = [
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
    // value: "groupname",
    sortable: false,
  },
  {
    text: "Permissão",
    value: "permission",
    sortable: false,
    width: 60,
    renderer: {
      type: "checkbox",
      event: "changePermission",
    },
  },
];

export default {
  name: "admin-permissions",

  components: {
    BasicTable,
  },

  data() {
    return {
      menuStore: null,
      permissionStore: null,

      tableColumnsLeft: cols_left,
      tableColumnsRight: cols_right,

      filters: [],
    };
  },

  created: async function () {
    this.menuStore = this.$store.$db().model("Menus");
    this.permissionStore = this.$store.$db().model("Permission");

    if (process.client) {
      const id = this.$auth.user.id;

      const groupsStore = this.$store.$db().model("webapp.groups");

      groupsStore.api().read({ forceLoad: true, limit: 100 });
    }
  },

  computed: {},

  methods: {
    onMenuSelect: async function (record) {
      this.filters = [
        {
          property: "menu_id",
          value: record.id,
          operator: "==",
        },
      ];
      let req_options = {
        filters: this.filters,
        limit: 10,
        start: 0,
      };
      try {
        await this.permissionStore.api().read(req_options);
      } catch (e) {
        console.log("Error: ");
      }
    },

    onChangePermission: async function (record) {
      this.permissionStore.update({
        where: (permission) => {
          return (
            permission.menu_id === record["menu_id"] &&
            permission.group_id === record["group_id"]
          );
        },
        data: { permission: !record["permission"] },
      });
    },
  },
};
</script>
