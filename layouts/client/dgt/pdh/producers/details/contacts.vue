<template>
  <v-row class="shrinked-row">
    <v-col :sm="6" :md="6" :lg="6">
      <SimpleDetails :title="$t('Entity Contacts')" :record="contacts" :fields="fields"></SimpleDetails>
    </v-col>

    <v-col :sm="6" :md="6" :lg="6">
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
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

import EvaluationSymbology from "@/layouts/client/dgt/pdh/producers/details/symbology-evaluation.vue";
import CartographySymbology from "@/layouts/client/dgt/pdh/producers/details/symbology-cartography.vue";

export default {
  components: {
    SimpleDetails,
    EvaluationSymbology,
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
      contacts: {},

      fields: [
        {
          label: this.$t("Email"),
          value: "email",
        },

        {
          label: this.$t("Address"),
          value: "address",
        },
        {
          label: this.$t("Locality"),
          value: "locality",
        },

        {
          label: this.$t("County"),
          value: "county",
        },

        {
          label: this.$t("Zip Code"),
          value: "zipcode",
        },

        {
          label: this.$t("Phone"),
          value: "phone",
        },
        {
          label: this.$t("Website"),
          value: "url",
        },
      ],
    };
  },

  created: function () {
    const request = this.record.request;

    this.contacts = {
      ...request,
    };

    if (!request.url) {
      this.contacts["url"] = "Sem website";
    }
  },
};
</script>