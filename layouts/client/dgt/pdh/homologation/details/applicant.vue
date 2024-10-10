<template>
  <!-- :title="$t('Applicant Information')" -->
  <!-- <SimpleCard flat>
    <template v-slot:body> -->
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="12">
      <SimpleDetails :title="$t('General Identification')">
        <!-- :record="record.applicant"
            :fields="fields"-->
        <template v-slot:body>
          <!-- Base Details -->
          <v-row align="center">
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                class="mb-10"
                :options="{ text: $t('Applicant Name'), align: 'center' }"
                :model="record.applicant.name"
              ></DisplayField>

              <DisplayField
                :options="{ text: $t('Email'), align: 'center' }"
                :model="record.applicant.email"
              ></DisplayField>
            </v-col>

            <v-col :sm="6" :md="6" :lg="6" align-self="start">
              <!-- <v-card flat tile class="d-flex justify-center"> -->
              <v-avatar
                class="profile"
                color="grey"
                size="164"
                tile
                v-if="record.applicant.avatar"
              >
                <v-img
                  :src="$p(record.applicant.avatar.replace('32x32', '160x160'))"
                ></v-img>
              </v-avatar>

              <v-icon size="160" v-else>mdi-account</v-icon>

              <!-- </v-card> -->
            </v-col>
          </v-row>

          <!-- Other Details-->
          <v-row align="center">
            <!-- <v-col :sm="6" :md="6" :lg="6">
                  <DisplayField
                    :options="{text: $t('NIC'), align: 'center'}"
                    :model="record.applicant.nic"
                  ></DisplayField>
                </v-col> -->
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('VAT'), align: 'center' }"
                :model="record.applicant.vat"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Phone Number'), align: 'center' }"
                :model="record.applicant.phone"
              ></DisplayField>
            </v-col>
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('Address'), align: 'center' }"
                :model="record.applicant.address"
              ></DisplayField>
            </v-col>
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('Locality'), align: 'center' }"
                :model="record.applicant.locality"
              ></DisplayField>
            </v-col>
            <v-col :sm="6" :md="6" :lg="6">
              <DisplayField
                :options="{ text: $t('ZIP Code'), align: 'center' }"
                :model="record.applicant.zipcode"
              ></DisplayField>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>
  </v-row>
  <!-- </template>
  </SimpleCard> -->
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