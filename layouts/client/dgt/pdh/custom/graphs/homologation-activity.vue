<template>
  <GraphCard
    :type="'line-chart'"
    :title="cmptitle"
    :data.sync="chartData"
    :options="chartOpts"
    :color="'primary'"
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
      default: [0, 0],
    },

    labels: {
      type: Array,
      default: [0, 0],
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
        : this.$t("Platform Homologation Activity"),

      chartOpts: {
        scales: {
          yAxes: [
            {
              gridLines: {
                color: "rgba(200,200,200, 0.2)",
              },
              ticks: {
                stepSize: 10,
                beginAtZero: true,
                maxTicksLimit: 5,
                // fontColor: "#fff",
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
                color: "rgba(200,200,200, 0.1)",
              },
              ticks: {
                // fontColor: "#fff",
              },
            },
          ],
        },
        legend: {
          display: false,
          labels: {
            // fontColor: "#fff",
          },
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
            label: this.$t("Requests/day"),
            borderColor: "rgba(50, 115, 220, 1.0)",
            backgroundColor: "rgba(50, 115, 220, 0.3)",
            data: values,
          },
        ],
      };
    },
  },
};
</script>