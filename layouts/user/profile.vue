<template>
  <div class="row">
    <div class="mx-auto col-md-4 mt-5">
      <client-only>
        <v-card max-width="434">
          <!-- <v-form ref="form" @submit="submitForm" v-model="valid"> -->
          <v-card class="mb-2" max-width="434" tile>
            <v-img
              height="100%"
              src="https://cdn.vuetifyjs.com/images/cards/server-room.jpg"
            >
              <v-row align="end" class="fill-height">
                <v-col align-self="start" class="pa-0" cols="12">
                  <v-avatar
                    v-if="
                      $auth.user &&
                      $auth.user.avatar &&
                      $auth.user.avatar !== ''
                    "
                    class="profile"
                    color="grey"
                    size="164"
                    tile
                  >
                    <v-img
                      :src="$p($auth.user.avatar.replace('32x32', '160x160'))"
                    ></v-img>
                  </v-avatar>

                  <v-icon v-else dark>mdi-account</v-icon>
                </v-col>
                <v-col class="py-0">
                  <v-list-item color="rgba(0, 0, 0, .4)" dark>
                    <v-list-item-content>
                      <v-list-item-title
                        dark
                        class="font-weight-medium unselectable"
                        >{{ user.name }}</v-list-item-title
                      >
                      <v-list-item-subtitle class="unselectable">{{
                        $t(user.group)
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content>
                      <input
                        type="file"
                        ref="file"
                        accept=".jpg,.png"
                        style="display: none"
                        v-on:change="handlePhotoUpload()"
                      />

                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            variant="primary"
                            outlined
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-icon left>mdi-cog</v-icon>

                            {{ $t("Settings") }}
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item>
                            <v-btn block text @click="$refs.file.click()">
                              <v-icon left>mdi-image</v-icon
                              >{{ $t("Change Photo") }}</v-btn
                            >
                          </v-list-item>

                          <v-list-item>
                            <v-btn block text @click="onEdit">
                              <v-icon left>mdi-account-edit</v-icon>
                              {{ $t("Editar Perfil") }}</v-btn
                            >
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-img>
          </v-card>

          <v-card-text>
            <DisplayField
              :options="{
                text: $t('Name'),
              }"
              :model="user.name"
            />

            <DisplayField
              :options="{
                text: $t('Email'),
              }"
              :model="user.email"
            />

            <DisplayField
              :options="{
                text: $t('Phone'),
              }"
              :model="user.phone ? user.phone : 'Sem número'"
            />

            <DisplayField
              :options="{
                text: $t('VAT'),
              }"
              :model="user.vat ? user.vat : 'Sem número'"
            />

            <DisplayField
              :options="{
                text: $t('Address'),
              }"
              :model="user.address ? user.address : 'Sem morada'"
            />

            <DisplayField
              :options="{
                text: $t('Locality'),
              }"
              :model="user.locality ? user.locality : 'Sem localidade'"
            />

            <DisplayField
              :options="{
                text: $t('Zip Code'),
              }"
              :model="user.zipcode ? user.zipcode : 'Sem código postal'"
            />
          </v-card-text>
        </v-card>

        <v-dialog v-model="dialog" max-width="600" scrollable persistent>
          <v-card>
            <v-card-title>{{ $t("Edit Profile") }}</v-card-title>

            <v-card-text>
              <BasicForm
                ref="form"
                :record="record"
                :model="profileColumns"
                v-model="valid"
              ></BasicForm>
            </v-card-text>

            <v-card-actions class="mb-2 mx-2">
              <v-btn
                width="150"
                text
                outlined
                color="primary darken-1"
                @click="onCloseForm"
                >Cancel</v-btn
              >
              <v-spacer></v-spacer>

              <v-btn
                width="150"
                text
                outlined
                :disabled="!valid"
                color="primary darken-1"
                @click="onSubmitForm"
                >Submit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </client-only>
    </div>
  </div>
</template>

<script>
import sha1 from "crypto-js/sha1";
import DisplayField from "@/components/forms/fields/display.vue";
import BasicForm from "@/components/forms/basic.vue";
import Textfield from "@/components/forms/fields/text.vue";

export default {
  name: "ProfilePage",
  // middleware: "router",

  components: {
    DisplayField,
    BasicForm,
    Textfield,
  },

  data() {
    return {
      genders: [
        { gender: "Male", value: true },
        { gender: "Female", value: false },
      ],

      groupsStore: null,

      user: {},
      record: {
        id: null,
        name: null,
        email: null,
        vat: null,
        address: null,
        locality: null,
        zipcode: null,
        phone: null,
      },

      dialog: false,
      valid: false,
      profileColumns: [
        {
          cmp: Textfield,
          text: this.$t("Name"),
          value: "name",
          required: true,
        },
        {
          cmp: Textfield,
          text: this.$t("VAT"),
          value: "vat",
          mask: "#########",
          cols: 6,
        },
        {
          cmp: Textfield,
          text: this.$t("Address"),
          value: "address",
        },
        {
          cmp: Textfield,
          text: this.$t("Locality"),
          value: "locality",
          cols: 6,
        },
        {
          cmp: Textfield,
          text: this.$t("Zip Code"),
          value: "zipcode",
          mask: "####-###",
          cols: 6,
        },
        {
          cmp: Textfield,
          text: this.$t("Phone"),
          value: "phone",
          mask: "#########",
          cols: 6,
        },
      ],
    };
  },

  created: async function () {
    if (process.client) {
      const store = this.$store.$db().model("UserGroups");

      const user = this.$auth.user;

      if (user) {
        await store.api().read({
          filters: [
            {
              property: "id",
              operator: "eq",
              value: user.group_id,
            },
          ],
        });
      }

      this.groupsStore = store;

      this.loadProfile();
    }
  },

  methods: {
    loadProfile() {
      const user = this.$auth.user;

      if (!user) {
        return;
      }

      const store = this.groupsStore;

      let groupInfo = store.find(user.group_id);

      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        group: groupInfo ? groupInfo.name : "",
        gender: user.gender,
        vat: user.vat,
        address: user.address,
        phone: user.phone,
        locality: user.locality,
        zipcode: user.zipcode,
      };

      this.user = userInfo;
    },

    handlePhotoUpload: async function () {
      const photo = this.$refs.file.files[0];

      let formData = new FormData();

      formData.append("file", photo);

      const result = await this.$axios.post("/api/user/uploadphoto", formData, {
        progress: true,
      });

      if (!result.error) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text: "<p>Imagem de perfil atualizada!</p>",
          okText: "Confirmar",
        });

        // TODO: Not sure if this is too agressive (might be too reactive)
        this.$auth.fetchUser();
      } else {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-close",
          color: "red",
          text: "<p>Ocorreu um erro ao atualizar a imagem de perfil.</p>",
          okText: "Confirmar",
        });
      }
    },

    onEdit: function () {
      const {
        id,
        name,
        email,
        vat,
        address,
        locality,
        zipcode,
        phone,
      } = this.user;

      this.record = {
        id: id,
        name: name,
        email: email,
        vat: vat ? vat : "",
        address: address ? address : "",
        locality: locality ? locality : "",
        zipcode: zipcode ? zipcode : "",
        phone: phone ? phone : "",
      };

      this.dialog = true;
    },

    onCloseForm: function () {
      this.dialog = false;
    },

    onSubmitForm: async function (evt) {
      const form = this.$refs.form;

      if (!form) {
        // ERROR
        return;
      }

      const dirty = form.getDirty();
      const { id } = this.user;

      if (!Object.keys(dirty).length) {
        this.dialog = false;
        return;
      }

      try {
        const result = await this.$axios.post(
          "/api/user/update",
          {
            data: {
              id,
              ...dirty,
            },
            key: "id",
            _csrf: this.$csrfToken()
          },
          {
            progress: true,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          icon: "mdi-check",
          color: "green",
          text: "<p>Utilizador atualizado!</p>",
          okText: "Confirmar",
        });

        // Update user
        await this.$auth.fetchUser();

        this.loadProfile();
      } catch (e) {
        this.$store.commit("SET_DIALOGMSG", {
          title: "Erro!",
          icon: "mdi-close",
          color: "red",
          text:
            "<p>Ocorreu um erro ao atualizar o utilizador. Para manter a consistência, \
             revertemos todos os campos para os valores anteriores.</p>",
          okText: "Confirmar",
        });
      }

      this.dialog = false;
    },
  },
};
</script>

<style></style>
