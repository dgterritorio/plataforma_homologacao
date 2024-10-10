<template>
  <v-row>
    <v-col>
      <client-only>
        <RemoteTable
          :title="$t('Notifications')"
          :headers="columns"
          store="Notifications"
          @open="onOpen"
        ></RemoteTable>

        <v-dialog v-model="showEmail" max-width="800">
          <SimpleDetails :title="$t('Read Email')" style="margin: 0 !important;">
            <template v-slot:body>
              <v-card flat>
                <!-- <v-card-title class="headline">Use Google's location service?</v-card-title> -->
                <v-card-text>
                  <v-row justify="center">
                    <v-col sm="2" md="2" lg="2" align-self="center">
                      <div class="body-1 text--secondary">{{$t('From')}}:</div>
                    </v-col>
                    <v-col sm="10" md="10" lg="10">
                      <v-text-field
                        outlined
                        dense
                        readonly
                        hide-details
                        :value="selectedEmail.from_contact"
                      ></v-text-field>
                    </v-col>

                    <v-col sm="2" md="2" lg="2" align-self="center">
                      <div class="body-1 text--secondary">{{$t('To')}}:</div>
                    </v-col>
                    <v-col sm="10" md="10" lg="10">
                      <v-text-field
                        outlined
                        dense
                        readonly
                        hide-details
                        :value="selectedEmail.to_contact"
                      ></v-text-field>
                    </v-col>

                    <v-col sm="2" md="2" lg="2" align-self="center">
                      <div class="body-1 text--secondary">{{$t('Subject')}}:</div>
                    </v-col>
                    <v-col sm="10" md="10" lg="10">
                      <v-text-field
                        outlined
                        dense
                        readonly
                        hide-details
                        :value="selectedEmail.subject"
                      ></v-text-field>
                    </v-col>

                    <v-col sm="2" md="2" lg="2" align-self="start">
                      <div class="body-1 text--secondary">{{$t('Body')}}:</div>
                    </v-col>
                    <v-col sm="10" md="10" lg="10">
                      <div class="pl-3 textarea" style="min-height: 250px; overflow-y: scroll;" v-html="selectedEmail.html"></div>
                    </v-col>
                  </v-row>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <!-- <v-btn color="green darken-1" text @click="showEmail = false">Disagree</v-btn> -->

                  <v-btn
                    color="primary"
                    outlined
                    text
                    width="200"
                    @click="showEmail = false"
                  >{{$t('Close')}}</v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </SimpleDetails>
        </v-dialog>
      </client-only>
    </v-col>
  </v-row>
</template>
<script>
import RemoteTable from "@/components/tables/basic.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  components: {
    RemoteTable,
    SimpleDetails,
  },
  data() {
    return {
      showEmail: false,

      selectedEmail: {},

      columns: [
        {
          text: this.$t("Subject"),
          value: "subject",
          align: "left",
          filterable: {
            type: "simple",
          },
        },
        {
          text: this.$t("Category"),
          value: "category_name",
          // renderer: {
          //   type: "chip",
          //   colorFn: function (value, record) {
          //     return record.category_color;
          //   },
          //   value: "category_name",
          // },
        },
        {
          text: this.$t("De"),
          value: "from_contact",
          filterable: {
            type: "simple",
          },
        },

        {
          text: this.$t("Para"),
          value: "to_contact",
          filterable: {
            type: "simple",
          },
        },

        {
          text: this.$t("Is Sent"),
          value: "was_send",
          renderer: {
            type: "icon",
            value: "was_send",

            fn: function (value) {
              return value ? "mdi-check" : "mdi-close";
            },

            colorFn: function (value) {
              return value ? "green" : "red";
            },
          },
        },

        {
          text: this.$t("Send Date"),
          value: "send_date",
          renderer: {
            type: "simple",
            value: "send_date_str",
          },
          filterable: {
            type: "date",
          },
        },

        {
          text: this.$t("Open"),
          value: "open",
          renderer: {
            type: "action",
            event: "open",
            icon: "mdi-email-search",
          },
        },
      ],
    };
  },

  methods: {
    onOpen: async function (email) {
      const emailId = email.id;

      this.selectedEmail = {};

      try {
        const result = await this.$axios.post("/api/user/notifications/get", {
          emailId: emailId,
        });

        if (result.error) {
          throw "Could not fetch email";
        }

        const email = result.data[0];

        this.selectedEmail = email;

        this.showEmail = true;
      } catch (e) {
        console.log("Error fetching email");
      }
    },
  },
};
</script>

