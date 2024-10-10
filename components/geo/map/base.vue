<template>
  <client-only>
    <v-card flat width="100%" :height="height">
      <vl-map
        ref="map"
        :load-tiles-while-animating="true"
        :load-tiles-while-interacting="true"
        :default-controls="{ zoom: false }"
        @postcompose="onMapPostCompose"
        @mounted="onMapMounted"
      >
        <!-- Ol View -->
        <vl-view
          ref="mapView"
          :zoom.sync="view.zoom"
          :center="view.center"
          :max-zoom="view.maxZoom"
          :min-zoom="view.minZoom"
          :projection.sync="view.proj"
          :extent="view.extent"
          :resolutions="view.resolutions"
        ></vl-view>

        <!-- OSM Layer Tile -->
        <!-- <vl-layer-tile id="osm">
          <vl-source-osm></vl-source-osm>
        </vl-layer-tile>-->

        <!-- Layers -->
        <LayerCmp
          ref="layers"
          :remoteLayers="layers"
          :localLayers="localLayers"
          @layercreated="$emit('layercreated', $event)"
          @sourcecreated="$emit('sourcecreated', $event)"
        ></LayerCmp>

        <!-- TODO: Make this templated (future MasterDetail) -->
        <v-slide-x-transition>
          <MapPanel
            class="md-detail"
            v-if="expand"
            :layers="localLayers"
            @close="expand = false"
          ></MapPanel>
        </v-slide-x-transition>

        <!-- Left side toolbar -->
        <div class="l-toolbar">
          <!-- <v-btn width="40" height="40" style="width: 40px"></v-btn> -->
          <template v-for="(tool, i) of tools">
            <component
              v-if="tool.side === 'left'"
              :is="tool.cmp"
              :key="'tool-' + i"
              class="toolbar-btn"
              :olmap="olmap"
              :vuemap="vuemap"
              @expand="expand = !expand"
            ></component>
          </template>
        </div>

        <!-- Right side toolbar -->
        <div class="r-toolbar d-flex flex-column-reverse">
          <template v-for="(tool, i) of tools">
            <component
              v-if="tool.side === 'right'"
              :is="tool.cmp"
              :key="'tool-' + i"
              class="toolbar-btn"
              :olmap="olmap"
              :vuemap="vuemap"
              @expand="expand = !expand"
            ></component>
          </template>
        </div>

        <div
          v-if="showCoordinates && mouseInside"
          class="unselectable text--secondary map-coordinates text-center d-flex justify-center"
        >
          <div class="map-coordinates-wrapper">
            {{ mousePosition[0] + " / " + mousePosition[1] }}
          </div>
        </div>
      </vl-map>
    </v-card>
  </client-only>
</template>
<script>
// import ScaleLine from "ol/control/ScaleLine";
import MapPanel from "~/components/geo/layers/panel";
import LayerCmp from "~/components/geo/layers/component";
import MasterDetail from "~/components/geo/map/masterDetail";

import ZoomTool from "@/components/geo/tools/zoom.vue";
import ExtentTool from "@/components/geo/tools/extent.vue";
import LayersTool from "@/components/geo/tools/layers.vue";

export default {
  name: "BaseMap",

  components: {
    MapPanel,
    LayerCmp,
    MasterDetail,

    ZoomTool,
    LayersTool,
    ExtentTool,
  },

  props: {
    mapId: {
      type: Number,
      default: -1,
    },

    olView: {
      type: Object,
      default: function () {
        return {
          proj: "EPSG:4326",
          zoom: 2,
          maxZoom: 28,
          minZOom: 0,
          center: [0, 0],
          rotation: null,
          extent: null,
          resolutions: undefined,
        };
      },
    },

    height: {
      type: String,
      default: "100%",
    },

    useOSM: {
      type: Boolean,
      default: true,
    },

    showCoordinates: {
      type: Boolean,
      default: false,
    },

    coordinatesPrecision: {
      type: Number,
      default: 6
    },

    localLayers: {
      type: Array,
      default: function () {
        return [];
      },
    },

    tools: {
      type: Array,
      default: function () {
        return [
          {
            cmp: ZoomTool,
            side: "left",
          },
          {
            cmp: ExtentTool,
            side: "left",
          },
          {
            cmp: LayersTool,
            side: "right",
          },
        ];
      },
    },
  },

  data() {
    return {
      mapId_: 0,
      layers: this.useOSM
        ? [
            {
              id: "osm",
              cmp: "vl-layer-tile",
              source: {
                cmp: "vl-source-osm",
              },
            },
          ]
        : [],
      view: {
        proj: "EPSG:4326",
        zoom: 2,
        maxZoom: 28,
        minZOom: 0,
        center: [0, 0],
        rotation: null,
        extent: null,
        resolutions: undefined,
      },

      mousePosition: [0, 0],
      mouseInside: false,

      expand: false,

      olmap: null,
      olmapEl: null,

      vuemap: null,
    };
  },

  created: async function () {
    const view = this.olView;

    // Override with prop view
    this.setView(view);
  },

  model: {
    property: "layers",
    event: "updatelayers",
  },

  methods: {
    loadMap: async function (mapId) {
      if (mapId > -1) {
        await this.loadLayers(mapId);

        await this.loadCfgs(mapId);
      }
    },

    reloadMap: async function () {
      if (this.mapId > -1) {
        await this.reloadLayers(mapId);

        await this.reloadCfgs(mapId);
      }
    },

    loadLayers: async function (mapId) {
      this.layers = await this.getLayers(mapId);
    },

    reloadLayers: async function () {
      await this.loadLayers(this.mapId);
    },

    loadCfgs: async function (mapId) {
      const cfgs = await this.getMapCfg(mapId);

      // Properties are sync. Cannot replace object
      if (cfgs) {
        this.view.zoom = cfgs.zoom;
        this.view.center[0] = cfgs.center[0];
        this.view.center[1] = cfgs.center[1];
        this.view.proj = cfgs.proj;
      }
    },

    reloadCfgs: async function () {
      await this.loadCfgs(this.mapId);
    },

    getMapCfg: async function (mapId) {
      const res = await this.$axios.post("/mapcfgs", {
        mapId: mapId,
      });

      const cfgs = res.data.data.length ? res.data.data[0] : null;

      function parseCenter(c) {
        const sub = c.substring(1, c.length - 1);

        const split = sub.split(",");

        return [parseFloat(split[0]), parseFloat(split[1])];
      }

      const view = cfgs
        ? {
            proj: cfgs.projection,
            zoom: parseInt(cfgs.zoom),
            center: parseCenter(cfgs.center),
            rotation: parseInt(this.rotation),
          }
        : null;

      return view;
    },

    registerEvents: function () {
      const olmap = this.olmap;

      if (this.showCoordinates) {
        const self = this;

        olmap.on("pointermove", function (evt) {
          const coordinate = evt.coordinate;

          const precision = self.coordinatesPrecision;

          coordinate[0] = coordinate[0].toFixed(precision);
          coordinate[1] = coordinate[1].toFixed(precision);

          self.mousePosition = coordinate;
          self.mouseInside = true;
        });
      }
    },

    getLayers: async function (mapId) {
      if (Number.isInteger(mapId) && mapId > 0) {
        const result = await this.$store.dispatch("layers/getLayers", {
          filter: [
            {
              property: "menu_id",
              type: "number",
              value: mapId,
            },
          ],
        });

        return result;
      } else {
        // console.log("> Id was null... ", mapId);
      }

      return [];
    },

    getLayerById: function (id) {
      const layers = this.$refs.layers;
      return layers.$refs[id];
    },

    fitToExtent: function (extent, duration = 1000, save = false) {
      this.$refs.mapView.$view.fit(extent, {
        size: this.$refs.map.$map.getSize(),
        duration: duration,
      });

      if (save) {
        this.saveExtent();
        this.saveCenter();
        this.saveZoom();
      }
    },

    getExtent: function () {
      return this.olmap.getView().calculateExtent(this.olmap.getSize());
    },

    getCenter: function () {
      return this.olmap.getView().getCenter();
    },

    getZoom: function () {
      return this.olmap.getView().getZoom();
    },

    saveCenter: function () {
      return (this.view.center = this.getCenter());
    },

    saveZoom: function () {
      this.view.zoom = this.getZoom();
    },

    saveExtent: function () {
      this.view.extent = this.getExtent();
    },

    setView: function (view) {
      const defaultView = this.view;

      if (view.zoom) defaultView.zoom = view.zoom;
      if (view.proj) defaultView.proj = view.proj;
      if (view.center) defaultView.center = view.center;
      if (view.rotation) defaultView.rotation = view.rotation;
      if (view.maxZoom) defaultView.maxZoom = view.maxZoom;
      if (view.minZoom) defaultView.minZoom = view.minZoom;
      if (view.extent) defaultView.extent = view.extent;
      if (view.resolutions) defaultView.resolutions = view.resolutions;
    },

    onMapPostCompose({ vectorContext, frameState }) {
      // this.$refs.map.render();
      // this.$emit('render');
    },

    async onMapMounted($event) {
      const self = this;

      const mapId = this.mapId;

      await this.loadMap(mapId);

      // now ol.Map instance is ready and we can work with it directly
      const olmap = $event.$map;

      this.olmap = olmap;
      this.olmapEl = $event.$el;

      this.registerEvents();

      this.vuemap = this;

      this.$emit("mount", olmap);
    },
  },

  computed: {
    layer: function () {
      const mapRef = this.$refs.map;

      this.$emit("updatelayers", []);

      if (!map) {
        return [];
      }

      const layers = map.$map.getLayers();

      this.$emit("updatelayers", layers);

      return layers;
    },

    allLayers: function () {
      return this.layers.concat(this.localLayers);
    },
  },

  watch: {
    mapId: function (newId) {
      this.loadMap(newId);
    },
  },
};
</script>
<style scoped>
.r-toolbar {
  position: absolute;
  top: 0px;
  right: 0;
  bottom: 0px;
  z-index: 1;
  overflow: hidden;
  height: 100%;
  padding: 10px 10px;
}

.l-toolbar {
  position: absolute;
  top: 0px;
  left: 0;
  bottom: 0px;
  z-index: 1;
  overflow: hidden;
  height: 100%;
  padding: 10px 10px;
}

.map-coordinates {
  position: absolute;
  bottom: 0px;
  z-index: 1;
  width: 100%;
  padding: 15px 10px;

  pointer-events: none;
}

.map-coordinates >>> .map-coordinates-wrapper {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  padding: 0 5px;
}

.toolbar-btn {
  margin: 10px 0px;
}

.toolbar-btn:nth-of-type(1) {
  margin: 0px 0px 10px 0;
}

.toolbar-btn >>> .v-btn {
  border-radius: 5px;
}

.md-detail {
  position: absolute;
  top: 0px;
  right: 0;
  bottom: 0px;
  z-index: 2;
  overflow: hidden;
}
</style>