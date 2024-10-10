<template>
  <v-row>
    <v-col>
      <client-only>
        <RemoteTable
          :title="$t('Notifications Administration')"
          :headers="columns"
          store="AdminNotifications"
          @resend="resend"
        ></RemoteTable>
      </client-only>
    </v-col>
  </v-row>
</template>
<script>
import RemoteTable from "@/components/tables/basic.vue";

export default {
  components: {
    RemoteTable,
  },
  data() {
    return {
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
          text: this.$t("User Name"),
          value: "user_name",
          filterable: {
            type: "simple",
          },
        },
        {
          text: this.$t("From"),
          value: "from_contact",
          filterable: {
            type: "simple",
          },
        },

        {
          text: this.$t("To"),
          value: "to_contact",
          filterable: {
            type: "simple",
          },
        },

        {
          text: this.$t("Creation Date"),
          value: "creation_date",
          renderer: {
            type: "simple",
            value: "creation_date_str",
          },
          filterable: {
            type: "date",
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
          text: this.$t("Resend"),
          value: "resend",
          renderer: {
            type: "action",
            icon: "mdi-email-send-outline",
            event: "resend",
          },
        },
      ],
    };
  },

  methods: {
    resend: async function (record) {
      const emailId = record.id;

      try {
        const result = await this.$axios.post(
          "/api/admin/notifications/resend",
          {
            emailId: emailId,
          }
        );

        if (!result.error) {
          const data = result.data;

          const row = data[0];

          const date = row.send_date;

          record.send_date = date;

          record.$save();
        }

        console.log("TODO: Process result");
      } catch (e) {
        console.log("> Error resending email..");
      }
    },
  },
};
</script>