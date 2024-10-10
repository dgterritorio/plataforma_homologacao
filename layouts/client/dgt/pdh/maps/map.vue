<template>
  <v-row class="shrinked-row">
    <BaseMap
      ref="map"
      :localLayers="layers"
      :olView="olview"
      :height="height"
      showCoordinates
      :coordinatesPrecision="0"
      @addlayer="onUpdateLayers"
      @mount="onMountMap"
      @sourcecreated="onSourceCreated"
    ></BaseMap>

    <v-overlay
      :absolute="true"
      :value="!layers.length"
      opacity="0.8"
      style="border-radius: 8px; z-index: 1"
    >
      <div class="text-h5 unselectable">{{ overlayText }}</div>
      <v-progress-linear
        v-show="fetching"
        indeterminate
        color="white darken-2"
      ></v-progress-linear>
    </v-overlay>
  </v-row>
</template>
<script>
import BaseMap from "@/components/geo/map/base.vue";
import mapview from "../config/map.json"

export default {
  components: {
    BaseMap,
  },

  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    height: {
      default: "350",
    },
  },

  data() {
    return {
      layers: [],

      canvas: document.createElement("canvas"),

      layerColor: "#1d82ac",

      baseLayers: [],

      olmap: null,
      olview: {
        zoom: 10,
        proj: mapview.proj,
        minZoom: mapview.minZoom,
        maxZoom: mapview.maxZoom,
        extent: mapview.extent,
      },

      initializing: false,
      fetching: false,

      sequentialId: 0,
    };
  },

  created: async function () {
    const record = this.record;

    this.initializing = true;

    let layers = [];

    if (process.client) {
      const store = this.$store.$db().model("private_layers");

      await store.api().read();

      layers = store.api().toVuelayers();
    }

    this.baseLayers = layers;

    if (record.request.id && record.cartography.id) {
      await this.requestGeometry();
    }

    this.initializing = false;
  },

  methods: {
    styleFuncFactory() {
      // cache to allow styles reusing for features with same state
      let cache = {};

      // pre build some shared styles
      const canvas = this.canvas;
      const context = this.canvas.getContext("2d");
      const layerColor = this.layerColor;
      const width = 4;

      const pattern = (function () {
        canvas.width = 6;
        canvas.height = 6;
        context.fillStyle = layerColor;

        for (let i = 0; i < 6; ++i) {
          context.fillRect(i, i, 1, 1);
        }

        return context.createPattern(canvas, "repeat");
      })();

      const outerStroke = this.$olStyleFactory("stroke", {
        color: "black",
        width: width + 3,
      });

      const stroke = this.$olStyleFactory("stroke", {
        color: layerColor,
        width: width,
      });

      const fill = this.$olStyleFactory("fill", {
        color: pattern,
      });

      const outerStyle = this.$olStyleFactory("style", {
        stroke: outerStroke,
      });

      const style = this.$olStyleFactory("style", {
        fill: fill,
        stroke: stroke,
      });

      return (feature, resolution) => {
        // feature - ol.Feature instance
        // resolution - current view resolution as float

        // build styles based on feature state
        // style function always return array of Style instances
        return [outerStyle, style];
      };
    },

    requestGeometry: async function () {
      this.fetching = true;

      try {
        const vectorial = this.vectorial;
        const cartographyId = this.cartographyId;

        if (
          typeof vectorial !== "boolean" ||
          typeof cartographyId !== "number"
        ) {
          this.layers = [];

          return;
        }

        const payload = {
          vectorial: vectorial,
          cartographyId: cartographyId,
        };

        const result = await this.$axios.post(
          "/api/homologation/cartography/getbbox",
          payload
        );

        const row = result.data[0];

        this.changeLayer(row);
      } catch (e) {
        console.log("Error fetching geom");
      }

      this.fetching = false;
    },

    changeLayer: function (row) {
      const projection = this.olview.proj;
      const geomStr = row.geom;
      let area = row.area ? row.area : 0;
      const perimeter = row.perimeter;
      const type = row.type;

      let color;

      try {
        area = area.toLocaleString("pt-PT").replace(/\s+/g, ".");
      } catch (e) {
        // Could not convert, so do nothing
      }

      if (!geomStr) {
        this.layers = [];

        return;
      }

      // Set color
      switch (type) {
        case 1:
          color = "#219e46";
          break;
        case 2:
          color = "#000000";
          break;
        default:
          color = "#f56200";
          break;
      }

      // this.area = (area / 1000.0).toFixed(2);

      const geojson = JSON.parse(geomStr);

      const features = [
        {
          id: 0,
          type: "Feature",
          geometry: geojson,
          properties: {
            area: area,
          },
        },
      ];

      const seqId = this.sequentialId++;

      this.layers = this.baseLayers.concat([
        // {
        //   id: "ortos_2018",
        //   title: "Ortos DGT 2018",
        //   cmp: "vl-layer-tile",
        //   visible: false,
        //   source: {
        //     cmp: "vl-source-wms",
        //     url:
        //       "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
        //     layers: "Ortos2018-RGB",
        //     extParams: { TRANSPARENT: true, CRS: "EPSG:3763" },
        //     serverType: "qgis",
        //   },
        // },
        // {
        //   id: "counties",
        //   title: "Limites Administrativos",
        //   cmp: "vl-layer-tile",
        //   visible: true,
        //   source: {
        //     cmp: "vl-source-wms",
        //     url:
        //       "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
        //     layers: "concelhos",
        //     extParams: { TRANSPARENT: true },
        //     serverType: "qgis",
        //   },
        // },
        {
          id: "work_area_" + seqId,
          title: this.$t("Work Area"),
          cmp: "vl-layer-vector",
          visible: true,
          opacity: 1.0,
          zIndex: 1000,
          source: {
            cmp: "vl-source-vector",
            features: features,
            matrixSet: projection,
            // url:"https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
          },
          style: [
            {
              cmp: "vl-style-func",
              factory: this.styleFuncFactory,
            },
          ],
        },
      ]);
    },

    onUpdateLayers: function (event) {
      const element = event.element;

      const arr = element.getLayersArray();

      const layer = arr[0];

      if (!source) {
        return;
      }

      const source = layer.getSource();

      const extent = source.getExtent();

      this.$refs.map.fitToExtent(extent, 0, true);
    },

    onMountMap: function (olmap) {
      this.olmap = olmap;
    },

    onSourceCreated: function (event) {
      const self = this;
      const source = event.$source;

      source.once("change", function (e) {
        if (source.getState() === "ready") {
          const extent = source.getExtent();

          if (self.$refs.map) {
            self.$refs.map.fitToExtent(extent, 0, true);
          }
        }
      });
    },
  },

  computed: {
    cartographyId: function () {
      return this.record.cartography.id;
    },

    vectorial: function () {
      return this.record.request.vectorial;
    },

    overlayText: function () {
      let text;
      const carto = this.record.cartography;

      if (this.fetching) {
        return this.$t("Fetching geometry");
      }

      if (this.initializing) {
        return this.$t("Initializing...");
      }

      if (
        !carto.hasOwnProperty("id") ||
        carto.id === null ||
        carto.invalid ||
        !this.layers.length
      ) {
        return this.$t("No cartography detected");
      }

      // This will never hit, unless something unexpected happens
      return this.$t("Recovering cartography...");
    },
  },

  watch: {
    // geometry: {
    //   handler: function (geom) {
    //     this.changeLayer(geom);
    //   },
    // },

    cartographyId: {
      handler: function (value) {
        const carto = this.record.cartography;
        const request = this.record.request;

        const carto_reqid = carto.request_id;
        const reqid = request.id;

        if (!carto_reqid || !reqid) {
          // Premature fetch
          return;
        }

        if (carto_reqid !== reqid) {
          // Premature fetch
          return;
        }

        this.requestGeometry();
      },
    },

    vectorial: {
      handler: function (value) {
        const carto = this.record.cartography;
        const request = this.record.request;

        const carto_reqid = carto.request_id;
        const reqid = request.id;

        if (!carto_reqid || !reqid) {
          // Premature fetch
          return;
        }

        if (carto_reqid !== reqid) {
          // Premature fetch
          return;
        }

        this.requestGeometry();
      },
    },
  },
};
</script>