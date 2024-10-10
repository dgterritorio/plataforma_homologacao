<template>
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="12">
      <SimpleDetails :title="$t('Owner Identification')">
        <template v-slot:body>
          <!-- Base Details -->
          <v-row align="center">
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('Owner Name'), align: 'center' }"
                :model="record.owner.name"
              ></DisplayField>
            </v-col>

            <v-col :sm="6" :md="6" :lg="6" align-self="start">
              <DisplayField
                :options="{ text: $t('Email'), align: 'center' }"
                :model="record.owner.email"
              ></DisplayField>
            </v-col>

            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('VAT'), align: 'center' }"
                :model="record.owner.vat"
              ></DisplayField>
            </v-col>

            <v-col :sm="6" :md="6" :lg="6" align-self="start">
              <DisplayField
                :options="{ text: $t('Phone Number'), align: 'center' }"
                :model="record.owner.phone"
              ></DisplayField>
            </v-col>

            <!-- Other Details-->
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('Address'), align: 'center' }"
                :model="record.owner.address"
              ></DisplayField>
            </v-col>
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('Locality'), align: 'center' }"
                :model="record.owner.locality"
              ></DisplayField>
            </v-col>
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('ZIP Code'), align: 'center' }"
                :model="record.owner.zipcode"
              ></DisplayField>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>
  </v-row>
</template>
<script>
import SimpleCard from "@/components/cards/simplecard.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import DisplayField from "@/components/forms/fields/display.vue";

export default {
  components: {
    SimpleCard,
    SimpleDetails,
    DisplayField,
  },
  props: {
    record: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      fields: [
        {
          label: this.$t("Name"),
          value: "name",
        },
        {
          label: this.$t("VAT"),
          value: "vat",
          cols: 6,
        },
        {
          label: this.$t("NIC"),
          value: "nic",
          cols: 6,
        },
        {
          label: this.$t("Email"),
          value: "email",
          cols: 6,
        },
        {
          label: this.$t("Phone Number"),
          value: "phone",
          cols: 6,
        },
        {
          label: this.$t("Address"),
          value: "address",
        },
        {
          label: this.$t("Locality"),
          value: "locality",
          cols: 6,
        },
        {
          label: this.$t("Zip Code"),
          value: "zipcode",
          cols: 6,
        },
      ],
    };
  },
};
</script>