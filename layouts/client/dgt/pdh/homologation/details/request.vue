<template>
  <!-- <SimpleCard flat>
  <template v-slot:body>-->
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="6">
      <!-- Request Details -->
      <SimpleDetails :title="$t('Request Details')" style="height: 100%">
        <template v-slot:body>
          <v-row class="shrinked-row">
            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[0].label }"
                :model="record.request[fields[0].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[1].label }"
                :model="record.request[fields[1].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[2].label }"
                :model="record.request[fields[2].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[3].label }"
                :model="record.request[fields[3].value] ? 'Sim' : 'Não'"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[4].label }"
                :model="fields[4].default"
              ></DisplayField>
            </v-col>

            <!-- <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[3].label }"
                :model="record.request[fields[3].value]"
              ></DisplayField>
            </v-col> -->

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[5].label }"
                :model="record.request[fields[5].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[6].label }"
                :model="record.request[fields[6].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[7].label }"
                :model="!record.request.observations ? fields[7].default : ''"
              ></DisplayField>
              <v-btn
                v-if="record.request.observations"
                class="ml-10"
                dense
                outlined
                text
                @click="onReadObservations"
                >{{ $t("Read Observations") }}</v-btn
              >

              <v-dialog v-model="showObservations" max-width="600">
                <SimpleDetails
                  :title="$t('Observations')"
                  style="margin: 0 !important"
                >
                  <template v-slot:tools>
                    <v-btn
                      text
                      icon
                      @click="showObservations = false"
                      class="mx-1"
                    >
                      <v-icon>{{ "mdi-close" }}</v-icon>
                    </v-btn>
                  </template>

                  <template v-slot:body>
                    <v-row
                      style="min-height: 400px"
                      class="body-1 shrinked-row"
                      align="stretch"
                    >
                      <v-col sm="12" md="12" lg="12">
                        <DisplayField
                          class="body-1"
                          style="height: 85%"
                          :options="{
                            outlined: false,
                            height: 300,
                            readonly: true,
                          }"
                          :model="record.request.observations"
                        ></DisplayField>

                        <v-row>
                          <v-spacer></v-spacer>
                          <v-btn
                            outlined
                            color="primary"
                            @click="showObservations = false"
                            class="mx-1"
                            >{{ $t("Go Back") }}</v-btn
                          >
                        </v-row>
                      </v-col>
                    </v-row>
                  </template>
                </SimpleDetails>
              </v-dialog>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-col :sm="12" :md="12" :lg="6">
      <!-- Tramitation State -->
      <SimpleDetails :title="$t('Tramitation State')">
        <template v-slot:body>
          <TramitationSymbology :record="record"></TramitationSymbology>
        </template>
      </SimpleDetails>

      <!-- Tramitation Characteristics -->
      <SimpleDetails :title="$t('Homologation Characteristics')" class="mt-6">
        <template v-slot:body>
          <CartographySymbology :record="record"></CartographySymbology>
        </template>
      </SimpleDetails>
    </v-col>

    <v-col :sm="12" :md="12" :lg="12" class="px-4" style="margin-top: 20px">
      <FormSection :flat="false" :title="$t('Affected Area')">
        <template v-slot:body>
          <Map :record="record" height="350"></Map>
        </template>
      </FormSection>
    </v-col>
  </v-row>
  <!-- </template>
  </SimpleCard>-->
</template>
<script>
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import TramitationSymbology from "@/layouts/client/dgt/pdh/homologation/details/symbology-tramitation.vue";
import CartographySymbology from "@/layouts/client/dgt/pdh/homologation/details/symbology-cartography.vue";
import Map from "@/layouts/client/dgt/pdh/homologation/details/map.vue";
import SimpleCard from "@/components/cards/simplecard.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import DisplayField from "@/components/forms/fields/display.vue";

export default {
  components: {
    Map,
    SimpleCard,
    SimpleDetails,
    FormSection,
    DisplayField,
    TramitationSymbology,
    CartographySymbology,
  },
  props: {
    record: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      showObservations: false,

      purposeStore: null,

      fields: [
        {
          label: this.$t("Cartography Name"),
          value: "name",
        },
        {
          label: this.$t("Process Number"),
          value: "id",
        },
        {
          label: this.$t("Affected Counties"),
          value: "county",
        },
        {
          label: this.$t("Specific Themes"),
          value: "has_themes",
        },
        {
          label: this.$t("Purpose"),
          default: null,
        },
        // {
        //   label: this.$t("Coverage Area"),
        //   default: this.record.cartography.area
        //     ? this.record.cartography.area
        //     : this.$t("Analysing..."),
        // },

        // {
        //   label: this.$t("Order Number"),
        //   value: "order_number",
        // },
        {
          label: this.$t("Initial Request Date"),
          value: "start_date_trim",
        },
        {
          label: this.$t("Homologation Date"),
          value: "end_date_str",
        },
        {
          label: this.$t("Request Observations"),
          default: this.record.request.observations
            ? this.record.request.observations
            : this.$t("No relevant observations."),
        },
      ],
    };
  },

  created: async function () {
    if (process.client) {
      try {
        const database = this.$store.$db();

        const purposeStore = database.model("PurposeTypes");

        await purposeStore.api().read({ once: true });

        this.purposeStore = purposeStore;

        this.fields[4].default = this.getPurpose();
      } catch (e) {
        console.log("Error gettings types: ");
      }
    }
  },

  methods: {
    getPurpose: function () {
      const store = this.purposeStore;

      const request = this.record.request;

      if (!store) {
        return "";
      }

      const records = store.query().where("code", request.purpose).get();

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    onReadObservations: function () {
      this.showObservations = true;
    },
  },

  watch: {
    "record.request.purpose": function (val, old) {
      this.fields[4].default = this.getPurpose();
    },
  },
};
</script>
<style>
.shrinked-row {
  margin-left: 0;
  margin-right: 0;
}
.shrinked-row > .col {
  padding: 0;
  padding: 5px 0;
}
</style>