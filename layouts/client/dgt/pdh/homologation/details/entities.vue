<template>
  <!-- :title="$t('Entities')" -->
  <!-- <SimpleCard flat>
  <template v-slot:body>-->
  <v-row align="stretch" class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="12">
      <SimpleDetails :title="$t('Participating Entities')">
        <template v-slot:body>
          <v-row>
            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{
                  text: isCollective
                    ? $t('Consortium Name')
                    : $t('Name of the Entity Responsible for Production'),
                }"
                :model="collectiveName"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6" v-show="false">
              <DisplayField
                :options="{ text: $t('Is a Consortium?') }"
                :model="isCollective ? $t('Yes') : $t('No')"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <RemoteTable
                flat
                :title="
                  isCollective
                    ? $t('Consortium Details')
                    : $t('Details of the Entities Involved')
                "
                :headers="columns"
                :data.sync="record.entities"
                :height="200"
                hideFooter
              ></RemoteTable>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails :title="$t('Production Accountable')" style="height: 100%">
        <template v-slot:body>
          <DisplayField
            :options="{ text: $t('Technician Name') }"
            :model="technician.name"
          ></DisplayField>

          <DisplayField
            :options="{ text: $t('Professional Order / Certificate ID') }"
            :model="techProfessional"
          ></DisplayField>

          <!-- <DisplayField
            :options="{ text: $t('Technician Certificate') }"
            :model="technician.certificate"
          ></DisplayField> -->

          <DisplayField
            :options="{ text: $t('Certificate Validity') }"
            :model="technician.certificate_validaty"
          ></DisplayField>
        </template>
      </SimpleDetails>
    </v-col>
    <v-col :sm="12" :md="12" :lg="6">
      <SimpleDetails
        :title="$t('Supervisory Accountable')"
        style="height: 100%"
      >
        <template v-slot:body>
          <DisplayField
            v-if="!supervisor.hasOwnProperty('producer_id')"
            :options="{ text: '' }"
            :model="$t('Undeclared')"
          ></DisplayField>

          <DisplayField
            v-if="supervisor.hasOwnProperty('producer_id')"
            :options="{ text: $t('Supervisory Technician') }"
            :model="supervisor.name"
          ></DisplayField>

          <DisplayField
            v-if="supervisor.hasOwnProperty('producer_id')"
            :options="{ text: $t('Belongs to') }"
            :model="supervisor.belongs_to"
          ></DisplayField>

          <DisplayField
            v-if="supervisor.hasOwnProperty('producer_id')"
            :options="{ text: $t('Professional Order / Certificate ID') }"
            :model="supervisorProfessional"
          ></DisplayField>

          <!-- <DisplayField
            v-if="supervisor.hasOwnProperty('producer_id')"
            :options="{ text: $t('Technician Certificate') }"
            :model="supervisor.certificate"
          ></DisplayField> -->

          <DisplayField
            v-if="supervisor.hasOwnProperty('producer_id')"
            :options="{ text: $t('Certificate Validity') }"
            :model="supervisor.certificate_validaty"
          ></DisplayField>
        </template>
      </SimpleDetails>
    </v-col>
  </v-row>
  <!-- </template>
  </SimpleCard>-->
</template>
<script>
import SimpleCard from "@/components/cards/simplecard.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
// import DisplayField from "@/components/cards/displayField.vue";
import DisplayField from "@/components/forms/fields/display.vue";
import RemoteTable from "@/components/tables/basic.vue";

export default {
  components: {
    SimpleCard,
    SimpleDetails,
    DisplayField,
    RemoteTable,
  },
  props: {
    record: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      technician: {},
      supervisor: {},

      columns: [
        {
          text: this.$t("Entity Name"),
          value: "name",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Email"),
          value: "email",
          sortable: false,
          renderer: {
            type: "simple",
            value: "email",
            fn: function (value) {
              return !value ? "-" : value;
            },
          },
        },
        {
          text: this.$t("Phone"),
          value: "phone",
          sortable: false,
          renderer: {
            type: "simple",
            value: "phone",
            fn: function (value) {
              return !value ? "-" : value;
            },
          },
        },
        {
          text: this.$t("Produces Vectorial Cartography"),
          value: "carto_vectorial",
          sortable: false,
          renderer: {
            type: "simple",
            value: "carto_vectorial",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
        },
        {
          text: this.$t("Produces Image Cartography"),
          value: "carto_imagery",
          sortable: false,
          renderer: {
            type: "simple",
            value: "carto_vectorial",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
        },
        {
          text: this.$t("Performs Aerophotogrammetric Coverage"),
          value: "carto_aerial",
          sortable: false,
          renderer: {
            type: "simple",
            value: "carto_vectorial",
            fn: function (value) {
              return value ? "Sim" : "Não";
            },
          },
        },
      ],
    };
  },

  created: async function () {
    this.record.entity_members.forEach(function (member) {
      const supervisor = member.supervisor;

      if (supervisor) {
        this.supervisor = {
          producer_id: member.producer_id,
          name: member.name,
          professional_order: member.professional_order,
          certificate: member.certificate,
          certificate_validaty: member.certificate_validaty,
          belongs_to: null,
        };
      } else {
        this.technician = {
          producer_id: member.producer_id,
          name: member.name,
          professional_order: member.professional_order,
          certificate: member.certificate,
          certificate_validaty: member.certificate_validaty,
          belongs_to: null,
        };
      }
    }, this);

    if (process.client) {
      const supervisor = this.supervisor,
        technician = this.technician;

      const store = this.$store.$db().model("OfficialProducers");

      const filters = [];

      if (!technician) {
        return;
      }

      if (supervisor.hasOwnProperty("producer_id")) {
        filters.push({
          operator: "in",
          property: "id",
          value: [supervisor.producer_id /*, technician.producer_id*/],
        });
      } else {
        // filters.push({
        //   operator: "eq",
        //   property: "id",
        //   value: technician.producer_id,
        // });
      }

      await store.api().read({ filters: filters });

      // if (technician.hasOwnProperty("producer_id")) {
      //   const record = store.find(technician.producer_id);

      //   technician.belongs_to = record.name;
      // }

      if (supervisor.hasOwnProperty("producer_id")) {
        const record = store.find(supervisor.producer_id);

        if (record) {
          supervisor.belongs_to = record.name;
        }
      }
    }
  },

  computed: {
    isCollective: function () {
      const record = this.record;

      const request = record.request;

      return !!request.collective_name;
      // return record.entities && record.entities.length > 1;
    },

    collectiveName: function () {
      const record = this.record;

      return this.isCollective
        ? record.request["collective_name"]
        : record.entities[0].name;
    },

    techProfessional: function () {
      const technician = this.technician;

      if (technician.professional_order && technician.certificate) {
        return technician.professional_order + " / " + technician.certificate;
      } else {
        return "Sem informação";
      }
    },

    supervisorProfessional: function () {
      const supervisor = this.supervisor;

      if (supervisor.professional_order && supervisor.certificate) {
        return supervisor.professional_order + " / " + supervisor.certificate;
      } else {
        return "Sem informação";
      }
    },
  },
};
</script>