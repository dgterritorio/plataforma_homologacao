<template>
  <GraphCard
    :type="'bar-chart'"
    :height="400"
    :title="cmptitle"
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
      default: [],
    },

    labels: {
      type: Array,
      default: [],
    },

    title: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      cmptitle: this.title
        ? this.title
        : this.$t("Homologation Requests per State"),
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