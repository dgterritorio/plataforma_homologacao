<template>
  <v-card class="py-4">
    <div class="d-flex unselectable px-6 justify-space-between align-start">
      <div>
        <!-- Username -->
        <v-card-title style="padding: 0" class="pb-3">
          <v-icon large class="mr-4" :color="color">{{
            user ? "" : "mdi-account-box"
          }}</v-icon>
          {{ user ? user : $auth.user.name }}
        </v-card-title>

        <!-- User Group -->
        <v-card-text
          class="body-1 text--secondary font-weight-medium unselectable ml-9"
        >
          <!-- <v-icon class="mr-4" :color="iconColor">{{ 'mdi-account-group' }}</v-icon> -->
          {{ group ? group : $t(usergroup) }}
        </v-card-text>
      </div>

      <!--  Avatar -->
      <v-avatar
        v-if="
          !user && $auth.user && $auth.user.avatar && $auth.user.avatar !== ''
        "
        class="profile"
        color="grey"
        size="100"
        tile
      >
        <v-img :src="$p($auth.user.avatar.replace('32x32', '160x160'))"></v-img>
      </v-avatar>
    </div>

    <template v-if="!noicon">
      <v-divider style="padding: 0" class="px-6 my-4"></v-divider>

      <!-- <v-card-text class="body-2 font-weight-medium px-6 unselectable">{{subtitle}}</v-card-text> -->
      <!-- <v-card-text class="body-2 font-weight-medium unselectable">{{$t('Manage')}}</v-card-text> -->
      <v-card-actions class="d-flex flex-column px-6" style="padding: 0">
        <div
          v-if="homologation && homologation.new"
          class="d-flex flex-row-reverse justify-space-between pt-2"
          style="width: 100%"
        >
          <v-btn text color="primary" :to="homologation.toNew">{{
            homologation.new
          }}</v-btn>
          <div
            class="unselectable body-1 text--secondary d-flex"
            style="align-items: center"
          >
            Abrir processo de homologação
          </div>
        </div>

        <div
          v-if="producer && $auth.user && $auth.user.group_id === 4"
          class="d-flex flex-row-reverse justify-space-between pt-2"
          style="width: 100%"
        >
          <v-btn
            text
            :color="nProducerNeedIntervetion === 0 ? 'primary' : 'red'"
            :to="producer.toManage"
          >
            <v-icon left v-if="nProducerNeedIntervetion > 0">{{
              "mdi-alert-outline"
            }}</v-icon>
            {{ producer.manage }}
          </v-btn>
          <div
            class="unselectable body-1 text--secondary d-flex"
            style="align-items: center"
          >
            {{ nProducerNeedIntervetion }} registos necessitam intervenção
          </div>
        </div>
        <!-- <v-spacer></v-spacer> -->
        <div
          v-if="homologation"
          class="d-flex flex-row-reverse justify-space-between pt-2"
          style="width: 100%"
        >
          <v-btn
            text
            :color="nHomologationNeedIntervetion === 0 ? 'primary' : 'red'"
            :to="homologation.toManage"
          >
            <v-icon left v-if="nHomologationNeedIntervetion > 0">{{
              "mdi-alert-outline"
            }}</v-icon>
            {{ homologation.manage }}
          </v-btn>
          <div
            class="unselectable body-1 text--secondary d-flex"
            style="align-items: center"
          >
            {{ nHomologationNeedIntervetion }} requerimentos necessitam
            intervenção
          </div>
        </div>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script>
export default {
  name: "OngoingCard",

  props: {
    user: {
      type: String,
      default: null,
    },

    group: {
      type: String,
      default: null,
    },

    noicon: {
      type: Boolean,
      default: false,
    },

    icon: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: null,
    },

    homologation: {
      type: Object,
      default: function () {
        return null;
      },
    },

    producer: {
      type: Object,
      default: function () {
        return null;
      },
    },

    value: null,
  },

  data() {
    return {
      usergroup: null,
      nProducerNeedIntervetion: 0,
      nHomologationNeedIntervetion: 0,
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

        const groupInfo = store.find(user.group_id);

        if (groupInfo) {
          this.usergroup = groupInfo.name;
        } else {
          this.usergroup = null;
        }
      }

      if (this.producer) {
        await this.requestProducersIntervetion();
      }

      if (this.homologation) {
        await this.requestHomologationIntervetion();
      }
    }
  },

  methods: {
    requestHomologationIntervetion: async function () {
      try {
        const result = await this.$axios.post(
          "/api/homologation/request/getall",
          {
            filter: [
              {
                property: "must_intervene",
                operator: "eq",
                value: true,
              },
            ],
          }
        );

        if (result.error) {
          throw result.error;
        }

        const count = result.total;

        this.nHomologationNeedIntervetion = count;
      } catch (e) {}
    },

    requestProducersIntervetion: async function () {
      try {
        const result = await this.$axios.post("/api/producer/entity/getall", {
          filter: [
            {
              property: "must_intervene",
              operator: "eq",
              value: true,
            },
          ],
        });

        if (result.error) {
          throw result.error;
        }

        const count = result.total;

        this.nProducerNeedIntervetion = count;
      } catch (e) {}
    },
  },
};
</script>