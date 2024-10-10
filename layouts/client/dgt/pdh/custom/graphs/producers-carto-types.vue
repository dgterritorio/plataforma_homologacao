<template>
  <GraphCard
    :type="'bar-chart'"
    :height="400"
          :title="$t('Production Domains Registered by the Entities')"
    :data.sync="chartData"
    :options="chartOpts"
    :color="'success'"
  ></GraphCard>
</template>
<script>
import GraphCard from "@/components/graphs/card.vue";

export default {
  components: {
    GraphCard,
  },
  props: {
    values: {
      type: Array,
      default: [0, 0, 0],
    },
  },

  data() {
    return {
      labels: [
          this.$t("Vector Topographic Cartography"),
          this.$t("Topographic Image Cartography"),
          this.$t("Aerophotogrammetric Coverage"),
        ],

      chartOpts: {
        scales: {
          yAxes: [
            {
              ticks: {
                stepSize: 1,
                beginAtZero: true,
              },
            },
          ],
        },

        legend: {
          display: false,
        },

        maintainAspectRatio: false,
      },
    };
  },

  computed: {
    chartData: function () {
      const values = this.values;
      const labels = this.labels;

      return {
        labels: labels,
        datasets: [
          {
            label: this.$t("Amount"),
            borderWidth: 3,
            borderColor: "rgba(50, 115, 120, 1.0)",
            backgroundColor: "rgba(50, 115, 120, 0.3)",
            data: values,
          },
        ],
      };
    },
  },
};
</script>