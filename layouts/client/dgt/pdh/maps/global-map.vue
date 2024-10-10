<template>
  <v-row class="shrinked-row">
    <BaseMap
      ref="map"
      :localLayers="layers"
      :height="height"
      :olView="olview"
      showCoordinates
      :coordinatesPrecision="0"
      @mount="onMountMap"
    ></BaseMap>
  </v-row>
</template>
<script>
//       @addlayer="onUpdateLayers"
//      @sourcecreated="onSourceCreated"

import BaseMap from "@/components/geo/map/base.vue";
import mapview from "../config/map.json"

export default {
  components: {
    BaseMap,
  },

  props: {
    onlyUser: {
      type: Boolean,
      default: false,
    },

    onlyFinished: {
      type: Boolean,
      default: false,
    },

    height: {
      default: "350",
    },
  },

  data() {
    return {
      layers: [],

      olmap: null,
      olview: {
        zoom: mapview.zoom,
        proj: mapview.proj,
        minZoom: mapview.minZoom,
        maxZoom: mapview.maxZoom,
        extent: mapview.extent,
      },

      initializing: false,

      area: 0,
    };
  },

  created: async function () {
    this.initializing = true;

    // await this.requestGeometries();

    let layers = [];

    if (process.client) {
      const store = this.$store.$db().model("global_layers");

      await store.api().read();

      layers = store.api().toVuelayers();
    }

    this.layers = layers;

    // [
    //   {
    //     id: "ortos_2018",
    //     title: "Ortos DGT 2018",
    //     cmp: "vl-layer-tile",
    //     visible: false,
    //     source: {
    //       cmp: "vl-source-wms",
    //       url:
    //         "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
    //       layers: "Ortos2018-RGB",
    //       extParams: { TRANSPARENT: true, CRS: "EPSG:3763" },
    //       serverType: "qgis",
    //     },
    //   },
    //   {
    //     id: "counties",
    //     title: "Limites Administrativos",
    //     cmp: "vl-layer-tile",
    //     visible: true,
    //     source: {
    //       cmp: "vl-source-wms",
    //       url:
    //         "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
    //       layers: "concelhos",
    //       extParams: { TRANSPARENT: true },
    //       serverType: "qgis",
    //     },
    //   },

    //   {
    //     id: "vectorial_carto",
    //     title: "Cartografia Homologada",
    //     cmp: "vl-layer-tile",
    //     visible: true,
    //     source: {
    //       cmp: "vl-source-wms",
    //       url:
    //         "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
    //       layers: "cartografia_homologada",
    //       extParams: { TRANSPARENT: true },
    //       serverType: "qgis",
    //     },
    //   },

    //   // {
    //   //   id: "imagery_carto",
    //   //   title: "Cartografia Imagem",
    //   //   cmp: "vl-layer-tile",
    //   //   visible: true,
    //   //   source: {
    //   //     cmp: "vl-source-wms",
    //   //     url:
    //   //       "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
    //   //     layers: "cartografia_imagem",
    //   //     extParams: { TRANSPARENT: true },
    //   //     serverType: "qgis",
    //   //   },
    //   // },
    // ];

    this.initializing = false;
  },

  methods: {
    // requestGeometries: async function () {
    //   try {
    //     const onlyUser = this.onlyUser;
    //     const onlyFinished = this.onlyFinished;

    //     const result = await this.$axios.post(
    //       "/api/homologation/cartography/getglobalbbox",
    //       { onlyUser: onlyUser, onlyFinished: onlyFinished }
    //     );

    //     const rows = result.data;

    //     let finished = [],
    //       cancelled = [],
    //       ongoing = [];

    //     rows.forEach(function (row, idx) {
    //       const geom = row.geom;
    //       const type = row.type;

    //       const geojson = JSON.parse(geom);

    //       const feat = {
    //         id: idx,
    //         type: "Feature",
    //         geometry: geojson,
    //       };

    //       switch (type) {
    //         case 1:
    //           finished.push(feat);
    //           break;
    //         case 2:
    //           cancelled.push(feat);
    //           break;
    //         default:
    //           ongoing.push(feat);
    //           break;
    //       }
    //     });

    //     this.changeLayer(ongoing, finished, cancelled);
    //   } catch (e) {
    //     console.log("Error fetching geom");
    //   }
    // },

    // changeLayer: function (ongoing, finished, cancelled) {
    //   // if (features) {
    //   this.layers = [
    //     {
    //       id: "work_area_finished",
    //       title: this.$t("Cartografia Homologada"),
    //       cmp: "vl-layer-vector",
    //       visible: true,
    //       source: {
    //         cmp: "vl-source-vector",
    //         features: finished,
    //         matrixSet: "EPSG:3763",
    //         // url:"https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
    //       },
    //       style: [
    //         {
    //           cmp: "vl-style-box",
    //           styles: {
    //             "vl-style-fill": {
    //               color: [255, 255, 255, 0.3],
    //             },
    //             "vl-style-stroke": {
    //               color: "#219e46",
    //               width: 2,
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   ];

    //   if (!this.onlyFinished) {
    //     this.layers.unshift({
    //       id: "work_area_ongoing",
    //       title: this.$t("Cartografia em Homologação"),
    //       cmp: "vl-layer-vector",
    //       visible: true,
    //       source: {
    //         cmp: "vl-source-vector",
    //         features: ongoing,
    //         matrixSet: "EPSG:3763",
    //         // url:"https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
    //       },
    //       style: [
    //         {
    //           cmp: "vl-style-box",
    //           styles: {
    //             "vl-style-fill": {
    //               color: [255, 255, 255, 0.3],
    //             },
    //             "vl-style-stroke": {
    //               color: "#f56200",
    //               width: 2,
    //             },
    //           },
    //         },
    //       ],
    //     });

    //     this.layers.push({
    //       id: "work_area_cancelled",
    //       title: this.$t("Cartografia Não-Homologada"),
    //       cmp: "vl-layer-vector",
    //       visible: true,
    //       source: {
    //         cmp: "vl-source-vector",
    //         features: cancelled,
    //         matrixSet: "EPSG:3763",
    //         // url:"https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
    //       },
    //       style: [
    //         {
    //           cmp: "vl-style-box",
    //           styles: {
    //             "vl-style-fill": {
    //               color: [255, 255, 255, 0.3],
    //             },
    //             "vl-style-stroke": {
    //               color: "#000000",
    //               width: 2,
    //             },
    //           },
    //         },
    //       ],
    //     });
    //   }
    // },

    // onUpdateLayers: function (event) {
    //   const element = event.element;

    //   const arr = element.getLayersArray();

    //   const layer = arr[0];

    //   if (!source) {
    //     return;
    //   }

    //   const source = layer.getSource();

    //   const extent = source.getExtent();

    //   this.$refs.map.fitToExtent(extent, 0, true);
    // },

    onMountMap: function (olmap) {
      this.olmap = olmap;
    },

    // onSourceCreated: function (event) {
    //   const self = this;
    //   const source = event.$source;

    //   source.once("change", function (e) {
    //     if (source.getState() === "ready") {
    //       const extent = source.getExtent();

    //       if (self.$refs.map) {
    //         self.$refs.map.fitToExtent(extent, 0, true);
    //       }
    //     }
    //   });
    // },
  },
};
</script>