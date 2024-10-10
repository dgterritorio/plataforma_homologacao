<template>
  <v-row class="shrinked-row">
    <BaseMap
      ref="map"
      :localLayers="layers"
      :height="height"
      :olView="olview"
      showCoordinates
      :coordinatesPrecision="0"
    ></BaseMap>
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

    let layers = [];

    if (process.client) {
      const store = this.$store.$db().model("global_private_layers");

      await store.api().read();

      layers = store.api().toVuelayers();
    }

    const paramsFinished = {
      SERVICE: "WMS",
      TRANSPARENT: true,
    };

    const paramsInprogress = {
      SERVICE: "WMS",
      TRANSPARENT: true,
    };

    const user = this.$auth.user;

    // Se não existe user, return
    if (!user) {
      this.initializing = false;

      console.log("[ERROR] Could not get layers");
      return;
    }

    // Se existe user e não for avaliador ou inspector
    if (user.group_id !== 4 && user.group_id !== 6) {
      const userId = user.id;

      paramsFinished["FILTER"] = 'cartografia_homologada:"a_id" = ' + userId;
      paramsInprogress["FILTER"] =
        'cartografia_em_homologacao:"a_id" = ' + userId;
    }

    const finished = layers.find(function (layer) {
      return layer.source.layers === "cartografia_homologada";
    });

    if (finished) {
      finished.source.extParams = paramsFinished;
    }

    const ongoing = layers.find(function (layer) {
      return layer.source.layers === "cartografia_em_homologacao";
    });

    if (ongoing) {
      ongoing.source.extParams = paramsInprogress;
    }

    this.layers = layers;

    //   [{
    //     id: "ortos_2018",
    //     title: "Ortos DGT 2018",
    //     cmp: "vl-layer-tile",
    //     visible: false,
    //     source: {
    //       cmp: "vl-source-wms",
    //       url:
    //         "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
    //       layers: "Ortos2018-RGB",
    //       extParams: { TRANSPARENT: true, CRS: 'EPSG:3763'  },
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
    //       extParams: paramsFinished,
    //       serverType: "qgis",
    //     },
    //   },
    //   {
    //     id: "imagery_carto",
    //     title: "Cartografia em Homologação",
    //     cmp: "vl-layer-tile",
    //     visible: true,
    //     source: {
    //       cmp: "vl-source-wms",
    //       url:
    //         "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
    //       layers: "cartografia_em_homologacao",
    //       extParams: paramsInprogress,
    //       serverType: "qgis",
    //     },
    //   },

    //   // {
    //   //   id: "vectorial_carto",
    //   //   title: "Cartografia Vetorial",
    //   //   cmp: "vl-layer-tile",
    //   //   visible: true,
    //   //   source: {
    //   //     cmp: "vl-source-wms",
    //   //     url:
    //   //       "https://homologacao.geomaster.pt/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi",
    //   //     layers: "cartografia_vetorial",
    //   //     extParams: { TRANSPARENT: true },
    //   //     serverType: "qgis",
    //   //   },
    //   // },

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
};
</script>