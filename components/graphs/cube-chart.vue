<template>
  <div
    class="d-flex border-light"
    style="height: 100%; padding: 12px !important"
    v-if="data"
  >
    <component
      :is="type"
      class="chart-override"
      legend="bottom"
      :data="series(data)"
      :stacked="stacked"
      :download="download"
      @mouseover.native="displayBttns = true"
      @mouseleave.native="displayBttns = false"
    ></component>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "line-chart",
    },
    stacked: {
      type: Boolean,
      default: false,
    },
    download: {
      type: [Boolean, Object],
      default: null,
    },

    colors: {
      type: Object,
      default: function () {
        return {};
      },
    },

    data: null,

    exportTool: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      displayBttns: false,
    };
  },

  methods: {
    series(resultSet) {
      this.editedQuery = resultSet.query();

      const colors = this.colors;

      const self = this;

      return resultSet.series().map(function (series, idx) {
        const config = {
          name: series.title,

          data: series.series.map((row) => {
            let rx = row.x;
            let value =
              typeof row.value == "number" ? row.value.toFixed(2) : row.value;
            if (
              (self.type == "column-chart" || self.type === "bar-chart") &&
              self.isDate(row.x)
            ) {
              rx = row.x.split("-")[0];
            }
            return [rx, value];
          }),
        };

        const key = series.key;

        const colorCfg = colors[key];

        console.log(colors, colorCfg);

        if (colorCfg) {
          const { borderColor, color } = colorCfg;

          const borderColorStr = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
          const colorStr = `rgba(${color.r},${color.g},${color.b},${color.a})`;

          config["borderColor"] = borderColorStr;
          config["color"] = colorStr;
        }

        return config;
      });
    },

    isDate(value) {
      try {
        let date = new Date(value);
        return true;
      } catch {
        return false;
      }
    },

    toExcelDateString(date) {
      return (
        date.getUTCFullYear() +
        "/" +
        ("0" + (date.getUTCMonth() + 1)).slice(-2) +
        "/" +
        ("0" + date.getUTCDate()).slice(-2) +
        " " +
        ("0" + date.getUTCHours()).slice(-2) +
        ":" +
        ("0" + date.getUTCMinutes()).slice(-2) +
        ":" +
        ("0" + date.getUTCSeconds()).slice(-2)
      );
    },

    getExportData() {
      const dt = [];
      this.data.series().forEach((ser) => {
        let sd = {};
        sd["Indicador"] = ser.title;
        ser.series.forEach((d) => {
          let category = this.isDate(d["category"])
            ? this.toExcelDateString(new Date(d["category"]))
            : d["category"];
          sd[category] = d["value"];
        });

        dt.push(sd);
      });

      return { name: "export", data: dt };
    },

    async onExport() {
      let sheets = [];
      var dt = [];
      this.data.series().forEach((ser) => {
        let sd = {};
        sd["Indicador"] = ser.title;
        ser.series.forEach((d) => {
          let category = this.isDate(d["category"])
            ? this.toExcelDateString(new Date(d["category"]))
            : d["category"];
          sd[category] = d["value"];
        });

        dt.push(sd);
      });

      try {
        const result = await this.$axios.post(
          "/api/export",
          {
            data: {
              sheets: [{ name: "export", data: dt }],
            },
          },
          {
            progress: true,
          }
        );

        // console.log(result);
        if (result.error) {
          throw result.error;
        }

        const data = result.data;
        const file = data[0];

        const name = file.name;
        const stream = file.stream;

        const a = document.createElement("a");
        a.href = "data:application/octet-stream;base64," + escape(stream);
        a.download = name ? name : "export.xls";
        a.click();
      } catch (e) {
        this.$store.commit("SET_DIALOGMSG", {
          title: this.$t("Error!"),
          icon: "mdi-close",
          color: "red",
          text:
            "<p>" + this.$t("An error occurred while exporting data.") + "</p>",
          okText: this.$t("Confirm"),
        });
      }
    },
  },
};
</script>
<style scoped>
.chart-override {
  height: 100% !important;
}
</style>