<template>
  <client-only>
    <v-row>
      <v-col sm="12" md="6" lg="6">
        <UserInfo
          user="Estatísticas Gerais da Plataforma de Homologação"
          group="Direção-Geral do Território"
          noicon
        ></UserInfo>
      </v-col>

      <v-col sm="12" md="6" lg="6"></v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <GeneralStatistics
          :title="
            $t('Number of Registered Entities for Cartography Production')
          "
          :values="globalProducers"
          :height="400"
          :showCancelled="false"
          :showSpecifics="false"
        />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <ProducerCartoTypes :values="producers.producerTypes" />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <GeneralStatistics
          :title="
            $t('Number of Processes Submitted for Homologation of Topographic Cartography')"
          :values="globalCartography"
          :height="400"
          :showCancelled="false"
          :showSpecifics="true"
        />
      </v-col>

      <v-col :sm="12" :md="6" :lg="6">
        <HomologationCartoTypes :values="homologation.cartoTypes" />
      </v-col>

      <v-col :sm="12" :md="12" :lg="12">
        <v-card>
          <v-card-title>{{
            $t("Global Map of Approved Cartography")
          }}</v-card-title>
          <GlobalMap height="530" onlyFinished></GlobalMap>
        </v-card>
      </v-col>
    </v-row>
  </client-only>
</template>
<script>
import GraphHeading from "@/components/graphs/heading.vue";
import GraphCard from "@/components/graphs/card.vue";
import BasicTable from "~/components/tables/basic.vue";
import Map from "@/layouts/client/dgt/pdh/homologation/details/map.vue";
import UserInfo from "@/layouts/client/dgt/pdh/custom/simple-info-user.vue";
import GlobalMap from "@/layouts/client/dgt/pdh/maps/global-map.vue";

import GeneralStatistics from "@/layouts/client/dgt/pdh/custom/graphs/general-statistics.vue";
import HomologationCartoTypes from "@/layouts/client/dgt/pdh/custom/graphs/homologation-carto-types.vue";
import ProducerCartoTypes from "@/layouts/client/dgt/pdh/custom/graphs/producers-carto-types.vue";

export default {
  components: {
    GraphHeading,
    GraphCard,
    BasicTable,
    Map,
    UserInfo,
    GlobalMap,
    GeneralStatistics,
    HomologationCartoTypes,
    ProducerCartoTypes,
  },

  data() {
    return {
      dirty: false,
      updatedAt: "",
      startDate: null,
      endDate: null,

      startDateMenu: false,
      endDateMenu: false,

      homologation: {
        cartoTypes: [0, 0],
      },

      producers: {
        producerTypes: [],
      },

      globalCartography: {
        requests: 0,
      },

      globalProducers: {
        requests: 0,
      },
    };
  },

  created: async function () {
    if (process.client) {
      await this.requestGlobalStatistics();
    }
  },

  methods: {
    requestGlobalStatistics: async function (start, end) {
      const me = this;
      try {
        let result = await this.$axios.post(
          "/api/homologation/statistics/getgeneral",
          {
            timestart: start,
            timeend: end,
            onlyPublic: true,
          }
        );

        if (result.error) {
          throw result.error;
        }

        let data = result.data[0];

        const globalCartography = this.globalCartography;

        globalCartography.requests = data.requests;
        globalCartography.open = data.requests_open;
        globalCartography.finished = data.requests_success;
        globalCartography.cancelled = data.requests_cancelled;

        /**
         * Cartography types
         */
        const cartoLabels = [
          this.$t("Vectorial Topographic Cartography"),
          this.$t("Topographic Image Cartography"),
        ];
        const cartoValues = [data.requests_vectorial, data.requests_image];

        this.homologation.cartoTypes = cartoValues;

        /**
         * Global Producers
         */
        result = await this.$axios.post("/api/producer/statistics/getgeneral", {
          timestart: start,
          timeend: end,
        });

        if (result.error) {
          throw result.error;
        }

        data = result.data[0];

        const globalProducers = this.globalProducers;

        globalProducers.requests = data.requests_success;
        // globalProducers.open = data.requests_open;
        // globalProducers.finished = data.requests_finished;
        // globalProducers.cancelled = data.requests_cancelled;

        /**
         * Producer Cartography Types
         */

        const producerLabels = [
          this.$t("Vector Topographic Cartography"),
          this.$t("Topographic Image Cartography"),
          this.$t("Aerophotogrammetric Coverage"),
        ];

        const producerValues = [
          data.requests_vectorial_success,
          data.requests_image_success,
          data.requests_aerial_success,
        ];

        this.producers.producerTypes = producerValues;
      } catch (e) {
        console.log("Error on get activty");
      }
    },
  },
};
</script>

<style scoped>
.requests {
  color: var(--v-sucess-base);
}

.open {
  color: var(--v-primary-base);
}

.finished {
  color: var(--v-success-base);
}

.cancelled {
  color: var(--v-error-darken1);
}
</style>