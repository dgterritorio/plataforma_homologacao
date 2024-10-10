<template>
  <client-only>
    <v-row class="align-self-stretch">
      <v-col class="text-center" sm="12" md="12" lg="4">
        <BasicTable
          ref="usersTable"
          :headers="tableColumnsLeft"
          height="70vh"
          :store="'webapp.users'"
          :title="$t('Users')"
          selectable
          @select="onSelect"
          @unselect="onUnselect"
        ></BasicTable>
      </v-col>

      <v-col sm="12" md="12" lg="4">
        <BasicTable
          ref="membership_table"
          :headers="tableColumnsCenter"
          height="75vh"
          :title="$t('Memberships')"
          :data="memberships"
          hideFooter
          selectable
          itemKey="user_membership_id"
          @membership-remove="onBeforeRemoveMembership"
          @select="onSelectMembership"
          @unselect="onUnselectMembership"
        >
          <template v-slot:actions>
            <v-btn
              :disabled="!selected.user"
              color="primary"
              text
              @click="onOpenMembershipForm"
            >
              <v-icon left>mdi-plus</v-icon>
              {{ $t("Add Membership") }}
            </v-btn>
          </template>
        </BasicTable>
      </v-col>

      <v-col sm="12" md="12" lg="4">
        <BasicTable
          ref="profile_table"
          :headers="tableColumnsRight"
          height="75vh"
          :title="$t('Profiles')"
          :data="profiles"
          hideFooter
          @profile-remove="onBeforeRemoveProfile"
        >
          <template v-slot:actions>
            <v-btn
              :disabled="!selected.user || !selected.membership"
              color="primary"
              text
              @click="onOpenProfileForm"
            >
              <v-icon left>mdi-plus</v-icon>
              {{ $t("Add Profile") }}
            </v-btn>
          </template>
        </BasicTable>
      </v-col>

      <v-dialog
        scrollable
        persistent
        v-model="show.membershipform"
        max-width="500"
      >
        <v-card>
          <v-card-title>
            {{ $t("Add Membership") }}
            <v-spacer />
            <v-btn icon @click="onCloseMembershipForm">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text class="pb-0">
            <BasicForm
              ref="membershipform"
              :record="record.membership"
              :model="fields.membership"
              v-model="valid"
            ></BasicForm>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="onCloseMembershipForm">{{
              $t("Cancel")
            }}</v-btn>

            <v-btn
              :disabled="!valid"
              color="green darken-1"
              text
              @click="onSubmitMembershipForm"
              >{{ $t("Submit") }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        scrollable
        persistent
        v-model="show.profileform"
        max-width="500"
      >
        <v-card>
          <v-card-title>
            {{ $t("Add Profile") }}
            <v-spacer />
            <v-btn icon @click="onCloseProfileForm">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text class="pb-0">
            <BasicForm
              ref="profileform"
              :record="record.profile"
              :model="fields.profile"
              v-model="valid"
            ></BasicForm>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="onCloseProfileForm">{{
              $t("Cancel")
            }}</v-btn>

            <v-btn
              :disabled="!valid"
              color="green darken-1"
              text
              @click="onSubmitProfileForm"
              >{{ $t("Submit") }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </client-only>
</template>


<script>
import BasicTable from "@/components/tables/basic.vue";

import BasicForm from "@/components/forms/basic.vue";
import DisplayField from "@/components/forms/fields/display.vue";
import RemoteSelectfield from "@/components/forms/fields/remotecombobox.vue";

const cols_left = [
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
    text: "Email",
    value: "email",
    filterable: {
      type: "string",
    },
  },
];

const cols_center = [
  {
    text: "ID",
    value: "membership_id",
    width: 70,
    sortable: false,
    divider: true,
  },
  {
    text: "Membro de",
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
    text: "Remover",
    value: "remove",
    sortable: false,
    width: 60,
    renderer: {
      type: "action",
      event: "membership-remove",
      icon: "mdi-delete",
    },
  },
];

const cols_right = [
  // {
  //   text: "ID Filiação",
  //   value: "membership_id",
  //   width: 70,
  //   sortable: false,
  //   divider: true,
  // },
  {
    text: "Permissão",
    value: "profile_id",
    renderer: {
      type: "chip",
      store: "entities/webapp.userprofiles",
      text: "name",
      value: "id",
      storeRead: "all",
    },
    sortable: false,
  },
  {
    text: "Remover",
    value: "remove",
    sortable: false,
    width: 60,
    renderer: {
      type: "action",
      event: "profile-remove",
      icon: "mdi-delete",
    },
  },
];

export default {
  name: "admin-permissions",

  components: {
    BasicTable,
    BasicForm,
    DisplayField,
    RemoteSelectfield,
  },

  data() {
    return {
      stores: {
        users: null,
        memberships: null,
        profiles: null,
      },

      tableColumnsLeft: cols_left,
      tableColumnsCenter: cols_center,
      tableColumnsRight: cols_right,
      fields: {
        membership: [
          {
            cmp: DisplayField,
            text: this.$t("User"),
            value: "name",
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Membership"),
            value: "group_id",
            required: true,
            store: "webapp.groups_list",
            storeGetter: "all",
            itemText: "name",
            itemValue: "id",
          },
        ],
        profile: [
          {
            cmp: DisplayField,
            text: this.$t("User"),
            value: "name",
          },
          {
            cmp: DisplayField,
            text: this.$t("Membership"),
            value: "group_name",
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Profile"),
            value: "profile_id",
            required: true,
            store: "webapp.userprofiles_list",
            storeGetter: "all",
            itemText: "name",
            itemValue: "id",
          },
        ],
      },

      selected: {
        user: null,
        membership: null,
      },

      memberships: [],
      profiles: [],

      show: {
        membershipform: false,
        profileform: false,
      },

      valid: false,
      record: {
        membership: {
          name: null,
          group_id: null,
        },
        profile: {},
      },
    };
  },

  created: async function () {
    const store = this.$store;

    this.stores.users = store.$db().model("webapp.users");
    this.stores.memberships = store.$db().model("webapp.usermemberships");
    this.stores.profiles = store.$db().model("webapp.usermembership_profiles");

    if (process.client) {
      const groupsStore = this.$store.$db().model("webapp.groups");

      groupsStore.api().read({
        limit: 100,
        forceLoad: true,
        filters: [{ property: "reserved", value: false, operator: "eq" }],
      });

      const userprofilesStore = this.$store.$db().model("webapp.userprofiles");

      userprofilesStore.api().read({
        limit: 100,
        forceLoad: true,
      });

      this.stores.groupsList = groupsStore;
      this.stores.profilesList = userprofilesStore;

      this.stores.membershipsCombobox = this.$store
        .$db()
        .model("webapp.groups_list");
      this.stores.profilesCombobox = this.$store
        .$db()
        .model("webapp.userprofiles_list");
    }
  },

  computed: {
    selectedName: function () {
      return this.selected.user ? this.selected.user.name : "";
    },
  },

  methods: {
    unselectMemberships: function () {
      const table = this.$refs.membership_table;

      if (table) {
        table.unselectAll();
      }
    },

    unselectProfiles: function () {
      const table = this.$refs.profile_table;

      if (table) {
        table.unselectAll();
      }
    },

    onSelect: async function (record) {
      const table = this.$refs.membership_table;

      if (!table) {
        console.log("Error: could not find membership table");
        return;
      }

      if (!record) {
        console.log("no record selected (user)");
        return;
      }

      this.unselectProfiles();
      this.unselectMemberships();

      table.loading = true;

      this.selected.user = record;

      try {
        const { id } = record;

        const filters = [
          {
            property: "user_id",
            value: id,
            operator: "==",
          },
        ];

        await this.stores.memberships.api().read({
          filters: filters,
          limit: 100,
          start: 0,
          sortBy: "group_id",
          sortOrder: true,
        });

        this.memberships = this.stores.memberships
          .query()
          .orderBy("group_id")
          .get();
      } catch (e) {
        console.log("Error: ");
      }

      table.loading = false;
    },

    onUnselect: function () {
      const table = this.$refs.membership_table;

      if (!table) {
        console.log("Error: could not find membership table");
        return;
      }

      table.loading = true;

      this.selected.user = null;

      this.memberships = [];

      table.loading = false;
    },

    onSelectMembership: async function (record) {
      const table = this.$refs.profile_table;

      if (!table) {
        console.log("Error: could not find profiles table");
        return;
      }

      if (!record) {
        console.log("no record selected (membership)");
        return;
      }

      table.loading = true;

      this.selected.membership = record;

      try {
        const { user_id, membership_id } = record;

        const filters = [
          {
            property: "user_id",
            value: user_id,
            operator: "==",
          },
          {
            property: "group_id",
            value: membership_id,
            operator: "==",
          },
        ];

        await this.stores.profiles.api().read({
          filters: filters,
          limit: 100,
          start: 0,
          sortBy: "profile_id",
          sortOrder: true,
        });

        this.profiles = this.stores.profiles
          .query()
          .orderBy("profile_id")
          .get();
      } catch (e) {
        console.log("Error: ", e);
      }

      table.loading = false;
    },

    onUnselectMembership: function () {
      const table = this.$refs.profile_table;

      if (!table) {
        console.log("Error: could not find profiles table");
        return;
      }

      table.loading = true;

      this.selected.membership = null;

      this.profiles = [];

      table.loading = false;
    },

    onOpenMembershipForm: function () {
      const selected = this.selected.user;

      if (selected) {
        this.record.membership = {
          name: selected.name,
          user_id: selected.id,
          group_id: null,
        };

        // Load store with memberships that the user does not belong
        const membershipsCombobox = this.stores.membershipsCombobox;
        const memberships = this.stores.memberships.all();

        const params = { limit: -1 };

        if (memberships.length) {
          params.filters = memberships.map((m) => {
            return {
              operator: "noteq",
              value: m.group_id,
              property: "id",
            };
          });

          params.filters.push({
            property: "reserved",
            value: false,
            operator: "eq",
          });
        }

        membershipsCombobox.api().read(params);

        this.show.membershipform = true;
      }
    },

    onCloseMembershipForm: function () {
      this.$refs.membershipform.reset();
      this.show.membershipform = false;
    },

    onSubmitMembershipForm: async function () {
      const { user_id, group_id } = this.record.membership;

      try {
        const result = await this.$axios.post("/api/admin/memberships/create", {
          data: [
            {
              user_id: user_id,
              group_id: group_id,
            },
          ],
          _csrf: this.$csrfToken()
        });

        if (result.error) {
          throw result.error;
        }

        this.stores.memberships.insert({ data: result.data });
      } catch (e) {
        console.log("Error on create membership");
      }

      this.memberships = this.stores.memberships
        .query()
        .orderBy("group_id")
        .get();

      this.unselectMemberships();

      this.show.membershipform = false;
    },

    onBeforeRemoveMembership: function (record) {
      if (this.$auth.user.id === record.user_id) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Aviso!",
          text: `<p>Proibida a modificação do próprio utilizador.</p>`,
          icon: "mdi-alert",
          color: "red",
          okText: "Confirmar",
        });

        return;
      }

      const selectedName = this.selectedName;
      const selectedMembership = this.stores.groupsList.find(record.group_id);

      let selectedMembershipName = "";

      if (selectedMembership) {
        selectedMembershipName = selectedMembership.name;
      }

      this.$store.commit("SET_DIALOGMSG", {
        title: "Aviso!",
        text: `<p>Está prestes a remover a filiação:</p><table style="width: 100%; margin-bottom: 16px; text-align: center;font-weight: 500;"><tbody><tr><td style="padding: 8px;">${selectedName}</td><td>-</td><td style="padding: 8px; ">${selectedMembershipName}</td></tr></tbody></table><p>Deseja continuar?</p>`,
        icon: "mdi-alert",
        color: "red",
        okText: "Confirmar",
        cancelText: "Cancel",
        okFn: this.onRemoveMembership,
        okParams: record,
      });
    },

    onRemoveMembership: function (record) {
      record.$delete();

      this.unselectMemberships();

      this.memberships = this.stores.memberships
        .query()
        .orderBy("group_id")
        .get();
    },

    onOpenProfileForm: function () {
      const selectedUser = this.selected.user;
      const selectedMembership = this.selected.membership;

      if (selectedUser && selectedMembership) {
        const selectedGroup = this.stores.groupsList.find(
          selectedMembership.group_id
        );

        this.record.profile = {
          name: selectedUser.name,
          group_name: selectedGroup.name,
          user_id: selectedMembership.user_id,
          group_id: selectedMembership.group_id,
          profile_id: null,
        };

        // Load store with profiles that the user does not belong
        const profilesCombobox = this.stores.profilesCombobox;
        const profiles = this.stores.profiles.all();

        const params = {};

        if (profiles.length) {
          params.filters = profiles.map((m) => {
            return {
              operator: "noteq",
              value: m.profile_id,
              property: "id",
            };
          });
        }

        profilesCombobox.api().read(params);

        this.show.profileform = true;
      }
    },

    onCloseProfileForm: function () {
      this.$refs.profileform.reset();
      this.show.profileform = false;
    },

    onSubmitProfileForm: async function () {
      const { user_id, group_id, profile_id } = this.record.profile;

      try {
        const result = await this.$axios.post(
          "/api/admin/membershipprofiles/create",
          {
            data: [
              {
                user_id: user_id,
                group_id: group_id,
                profile_id: profile_id,
              },
            ],
            _csrf: this.$csrfToken()
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.stores.profiles.insert({ data: result.data });
      } catch (e) {
        console.log("Error on create membership");
      }

      this.profiles = this.stores.profiles.query().orderBy("profile_id").get();

      this.unselectProfiles();

      this.show.profileform = false;
    },

    onBeforeRemoveProfile: function (record) {
      if (this.$auth.user.id === record.user_id) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Aviso!",
          text: `<p>Proibida a modificação do próprio utilizador.</p>`,
          icon: "mdi-alert",
          color: "red",
          okText: "Confirmar",
        });

        return;
      }

      const selectedName = this.selectedName;
      const selectedMembership = this.stores.groupsList.find(record.group_id);
      const selectedProfile = this.stores.profilesList.find(record.profile_id);

      let selectedMembershipName = "";
      let selectedProfileName = "";

      if (selectedMembership) {
        selectedMembershipName = selectedMembership.name;
      }

      if (selectedProfile) {
        selectedProfileName = selectedProfile.name;
      }

      this.$store.commit("SET_DIALOGMSG", {
        title: "Aviso!",
        text: `<p>Está prestes a remover o perfil:</p><table style="width: 100%; margin-bottom: 16px; text-align: center;font-weight: 500;"><tbody><tr><td style="padding: 8px;">${selectedMembershipName}</td><td>-</td><td style="padding: 8px; ">${selectedProfileName}</td></tr></tbody></table><p>Deseja continuar?</p>`,
        icon: "mdi-alert",
        color: "red",
        okText: "Confirmar",
        cancelText: "Cancel",
        okFn: this.onRemoveProfile,
        okParams: record,
      });
    },

    onRemoveProfile: function (record) {
      record.$delete();

      this.unselectProfiles();

      this.profiles = this.stores.profiles.query().orderBy("group_id").get();
    },
  },
};
</script>
