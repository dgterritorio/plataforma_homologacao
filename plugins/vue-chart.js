import Vue from 'vue'
import { Line, Bar, mixins } from 'vue-chartjs'
import "chartjs-plugin-annotation"
const { reactiveProp } = mixins;

const verticalLinePlugin = {
  getLinePosition: function (chart, pointIndex) {
    const meta = chart.getDatasetMeta(0); // first dataset is used to discover X coordinate of a point
    const data = meta.data;

    return data[pointIndex]._model.x;
  },
  renderVerticalLine: function (chartInstance, pointIndex, opts) {
    const lineLeftOffset = this.getLinePosition(chartInstance, pointIndex);
    const scale = chartInstance.scales['y-axis-0'];
    const context = chartInstance.chart.ctx;

    // render vertical line
    context.beginPath();
    context.strokeStyle = opts.color;
    context.moveTo(lineLeftOffset, scale.top);
    context.lineTo(lineLeftOffset, scale.bottom);
    context.stroke();

    // write label
    if (opts.label) {
      context.fillStyle = opts.color;
      context.textAlign = 'center';
      context.fillText(opts.label, lineLeftOffset, (scale.bottom - scale.top) / 2 + scale.top);
    }
  },

  afterDatasetsDraw: function (chart, easing) {
    if (chart.data.lineAtIndex) {
      chart.data.lineAtIndex.forEach(line => {
        const { index, label, color } = line;

        this.renderVerticalLine(chart, index, {
          label: label,
          color: color
        })
      });
    }
  }
};


Vue.component('vue-line-chart', {
  extends: Line,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  mounted() {
    this.addPlugin(verticalLinePlugin);
    this.renderChart(this.chartData, this.options)
  },

  watch: {
    chartData(to, from) {
      this.renderChart(this.chartData, this.options);
    },
  },
});

Vue.component('vue-bar-chart', {
  extends: Bar,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  mounted() {
    this.renderChart(this.chartData, this.options)
  },

  watch: {
    chartData(to, from) {
      this.renderChart(this.chartData, this.options);
    },
  },
});