<template>
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
                :model="record.request[fields[3].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[4].label }"
                :model="record.request[fields[4].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12" v-if="record.request.is_collective">
              <DisplayField
                :options="{ text: fields[5].label }"
                :model="record.request[fields[5].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12"  v-if="record.request.is_comercial">
              <DisplayField
                :options="{ text: fields[6].label }"
                :model="record.request[fields[6].value]"
              ></DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: fields[7].label }"
                :model="!record.request.observations ? 'Sem Observações.' : ''"
              ></DisplayField>
              <v-btn
                v-if="record.request.observations"
                class="ml-10 mb-4"
                dense
                outlined
                text
                @click="showObservations = true"
                >{{ $t("Read Observations") }}</v-btn
              >

              <v-dialog v-model="showObservations" max-width="600">
                <SimpleDetails
                  :title="fields[6].label"
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
          <EvaluationSymbology :record="record"></EvaluationSymbology>
        </template>
      </SimpleDetails>

      <!-- Tramitation Characteristics -->
      <SimpleDetails :title="$t('Producer Characteristics')" class="my-6">
        <template v-slot:body>
          <CartographySymbology :record="record"></CartographySymbology>
        </template>
      </SimpleDetails>
    </v-col>
  </v-row>
</template>
<script>
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import Map from "@/layouts/client/dgt/pdh/homologation/details/map.vue";
import BaseMap from "~/components/geo/map/base.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import EvaluationSymbology from "@/layouts/client/dgt/pdh/producers/details/symbology-evaluation.vue";
import CartographySymbology from "@/layouts/client/dgt/pdh/producers/details/symbology-cartography.vue";
import DisplayField from "@/components/forms/fields/display.vue";

export default {
  components: {
    Map,
    SimpleDetails,
    FormSection,
    EvaluationSymbology,
    CartographySymbology,
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
      showObservations: false,

      fields: [
        {
          label: this.$t("Producer Name"),
          value: "name",
        },
        {
          label: this.$t("Registration Number"),
          value: "id",
        },
        {
          label: this.$t("VAT"),
          value: "vat",
        },
        {
          label: this.$t("Entity Type"),
          value: "is_collective_description",
        },
        {
          label: this.$t("CAE Code"),
          value: "cae",
        },
        {
          label: this.$t("Entidade Sujeita a Registo Comercial"),
          value: "is_comercial_description",
        },
        {
          label: this.$t(
            "Código do acesso online à Certidão Permanente do Registo"
          ),
          value: "cpr_code",
        },
        {
          label: this.$t("Registration Observations"),
          value: "observations",
          // default: 'Sem Observações'
        },

        // {
        //   label: this.$t("Produces Imagery Cartography"),
        //   value: "carto_imagery_description",
        // },

        // {
        //   label: this.$t("Produces Aerial Cartography"),
        //   value: "carto_aerial_description",
        // },
      ],
    };
  },
};
</script>