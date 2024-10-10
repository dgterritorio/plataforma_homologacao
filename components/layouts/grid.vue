<template>
  <div class="grid-wrapper" style="display: flex; width: calc(100% + 10px)">
    <!-- Toolbar -->
    <template v-if="!loading && (layout.length || isEditing)">
      <grid-layout
        ref="grid"
        key="grid"
        :layout.sync="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="isEditing"
        :is-resizable="isEditing"
        :is-mirrored="false"
        :vertical-compact="false"
        :margin="[0, 0]"
        :use-css-transforms="true"
        style="margin-left: -10px; width: 100%"
      >
        <!-- Grid Item -->
        <grid-item
          v-bind:class="{
            'grid-item': true,
            'grid-item-editting': isEditing,
            'grid-item-dirty': !item.cmp && isEditing,
            'grid-item-small': item.h < 4 ? 'grid-item-small' : '',
          }"
          v-for="item in layout"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :minH="item.minH"
          :minW="item.minW"
          :i="item.i"
          :ref="`grid-component-${item.i}`"
          :key="item.i"
        >
          <!-- Templated Component -->
          <component
            class=""
            :class="isEditing ? 'no-click' : ''"
            :is="item.cmp"
            v-bind="item.props"
            @editgrid="onEdit"
            @save="onSaveCmp(item, $event)"
          ></component>

          <!-- Tooltips -->
          <div
            v-if="isEditing"
            class="dashboard-item-drag-text-wrapper unselectable"
          >
            <div class="dashboard-item-drag-text">
              <v-icon small>mdi-cursor-move</v-icon>
              {{ $t("Drag the component to reposition") }}
            </div>
          </div>

          <!-- Add button -->
          <v-tooltip bottom v-if="isEditing && !item.cmp">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-if="isEditing && !item.cmp"
                class="dashboard-item-add"
                color="primary"
                outlined
                text
                small
                width="40"
                height="40"
                v-bind="attrs"
                v-on="on"
                @click="onBeforeCreate(item)"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Add component") }} </span>
          </v-tooltip>

          <!-- Remove button -->
          <v-tooltip bottom v-if="isEditing">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="dashboard-item-remove"
                color="primary"
                outlined
                text
                small
                width="40"
                height="40"
                v-bind="attrs"
                v-on="on"
                @click="onRemove(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Remove component") }} </span>
          </v-tooltip>
        </grid-item>
      </grid-layout>

      <!-- Grid layout -->
      <v-slide-x-reverse-transition>
        <v-card
          v-if="isEditing"
          :width="sizes.tools"
          style="
            display: flex;
            flex-direction: column;
            height: 100%;
            position: sticky;
            top: 100px;
            margin: 0 10px 0 10px;
          "
        >
          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                :width="sizes.tools"
                :height="sizes.tools"
                small
                icon
                v-bind="attrs"
                v-on="on"
                @click="onCreate"
              >
                <v-icon>mdi-plus</v-icon></v-btn
              >
            </template>
            <span>{{ $t("Add component") }} </span>
          </v-tooltip>

          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                :width="sizes.tools"
                :height="sizes.tools"
                small
                icon
                v-bind="attrs"
                v-on="on"
                @click="onReset"
              >
                <v-icon>mdi-backup-restore</v-icon></v-btn
              >
            </template>
            <span>{{ $t("Reset to default layout") }} </span>
          </v-tooltip>

          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="red darken-1"
                :width="sizes.tools"
                :height="sizes.tools"
                small
                icon
                v-bind="attrs"
                v-on="on"
                @click="onDeleteAll"
              >
                <v-icon>mdi-delete-alert-outline</v-icon></v-btn
              >
            </template>
            <span>{{ $t("Reset to default layout") }} </span>
          </v-tooltip>

          <v-divider class="my-1" />

          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                :width="sizes.tools"
                :height="sizes.tools"
                small
                icon
                v-bind="attrs"
                v-on="on"
                @click="onSave"
                ><v-icon>mdi-content-save</v-icon></v-btn
              >
            </template>
            <span>{{ $t("Save layout") }} </span>
          </v-tooltip>

          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                :width="sizes.tools"
                :height="sizes.tools"
                small
                icon
                v-bind="attrs"
                v-on="on"
                @click="onCancel"
                ><v-icon>mdi-close</v-icon></v-btn
              >
            </template>
            <span>{{ $t("Cancel edit") }} </span>
          </v-tooltip>
        </v-card>
      </v-slide-x-reverse-transition>
    </template>

    <v-card
      v-else-if="loading"
      height="78vh"
      width="100%"
      class="
        d-flex
        flex-column
        justify-center
        align-center
        dashboard-offset-margin-right
      "
    >
      <v-card-title
        class="
          text--secondary
          unselectable
          text--center
          mb-12
          d-flex
          flex-column
        "
      >
        <h4>{{ loadingText }}</h4>
        <v-progress-linear
          color="primary"
          indeterminate
          class="my-2"
          height="6px"
          rounded
        />
      </v-card-title>
    </v-card>

    <v-card
      v-else
      height="78vh"
      width="100%"
      class="
        d-flex
        flex-column
        justify-center
        align-center
        dashboard-offset-margin-right
      "
    >
      <v-card-title
        class="
          text--secondary
          unselectable
          text--center
          mb-12
          d-flex
          flex-column
        "
      >
        {{ $t("No dashboard items") }}
        <v-btn
          v-if="editable"
          width="250"
          class="my-3"
          color="primary"
          @click="isEditing = true"
        >
          {{ $t("edit") }}
        </v-btn>
      </v-card-title>
    </v-card>

    <v-dialog v-model="showForm" max-width="300">
      <v-card>
        <v-card-title
          >{{ $t("Component Creation") }} <v-spacer />
          <v-btn icon @click="onCloseForm"> <v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-select
            outlined
            :label="$t('Component Selection')"
            :items="componentsTpls"
            dense
            hide-details
            :menu-props="{
              'offset-y': true,
              bottom: true,
            }"
            itemText="text"
            itemValue="cmp"
            return-object
            v-model="selectedComponent"
          >
            <template v-slot:item="{ item }">
              <div class="v-list-item__content">
                <div class="v-list-item__title">
                  <v-icon v-if="item.icon" class="mr-2">{{ item.icon }}</v-icon>
                  {{ item.text }}
                </div>
              </div>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="onCloseForm">{{ $t("Cancel") }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!selectedComponent"
            text
            @click="onCreateCmp(selectedComponent)"
            color="primary"
            >{{ $t("Create") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import Cube from "@/components/layouts/cube.vue";
import SectionTitle from "@/components/layouts/section-title.vue";
import Form from "@/components/forms/basic.vue";
import Textareafield from "@/components/forms/fields/textarea.vue";

export default {
  components: {
    Form,
    Textareafield,
    Cube,
    SectionTitle,
  },

  props: {
    components: {
      type: Array,
      default: function () {
        return [];
      },
    },

    componentsTpls: {
      type: Array,
      default: function () {
        return [];
      },
    },

    editable: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    loadingText: {
      type: String,
      default: "A carregar",
    },

    showToolbar: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      layout: [],
      pristineLayout: [],
      isEditing: false,
      showForm: false,
      selectedComponent: null,

      sizes: { tools: 50 },
    };
  },

  created: function () {
    this.setComponents(this.components);
  },

  watch: {
    components: {
      handler: function (components) {
        this.setComponents(components);
      },
    },
  },

  methods: {
    clearExcelSheetName: function (s) {
      return s.replace(/[\<\>\*\\\/\?|]/g, "");
    },

    getCubeComponents: function (cmp) {
      let result = [];

      cmp.$children.forEach((c) => {
        if (c.$options.propsData && c.$options.propsData.exportTool) {
          result.push(c);
        } else {
          c.$children.forEach((cc) => {
            let aux = [];
            aux = this.getCubeComponents(cc);
            result = result.concat(aux);
          });
        }
      });

      return result;
    },

    export: function () {
      if (!this.$refs.grid) return null;

      const cubeCmp = this.getCubeComponents(this.$refs.grid);
      const titles = this.layout.reduce((result, element) => {
        if (element.props.options.chart.export) {
          let t = this.clearExcelSheetName(element.props.options.chart.title);
          result.push(t);
        }
        return result;
      }, []);

      const data = [];
      for (let i = 0; i < cubeCmp.length; i++) {
        data.push({ name: titles[i], data: cubeCmp[i].getExportData()["data"] });
      }

      return data;
    },

    cloneJSON: function (json) {
      try {
        return JSON.parse(JSON.stringify(json));
      } catch (e) {
        console.log("[Error] Could not clone json", json);

        return {};
      }
    },

    setComponents: function (cmps) {
      this.layout = cmps;
    },

    onSave: function () {
      if (this.isEditing) {
        this.$emit("save", this.layout);
      }

      this.isEditing = !this.isEditing;
    },

    onEdit: function (event) {
      this.pristineLayout = JSON.parse(JSON.stringify(this.layout));

      this.isEditing = event;
    },

    onCancel: function () {
      this.layout = this.pristineLayout;

      this.pristineLayout = null;

      this.isEditing = false;
    },

    onBeforeCreate: function (item) {
      if (this.componentsTpls.length) {
        this.selectedComponent = this.componentsTpls[0];
      }

      this.targetComponent = item;
      this.showForm = true;
    },

    onCreate: function () {
      let newX = 0,
        newY = 0,
        newI = 0;

      const defaultW = 6;
      const defaultH = 12;

      let maxCols = 12;

      const cmps = this.layout;

      // LRTD search to find an empty spot
      for (let idx = 0; idx < cmps.length; idx++) {
        const cmp = cmps[idx];

        const { x, y, w, h, i } = cmp;

        // Test X first
        if (x + w > newX) {
          newX = x + w;

          // If the X overexceeds the maxixum allowed W
          // jump to the next line
          if (newX + defaultW > maxCols) {
            newX = 0;
            newY = newY + h;
          }
        }

        // Set the index to max(i) + 1
        if (i >= newI) newI = i + 1;
      }

      this.layout.push({
        i: newI,
        x: newX,
        y: newY,
        w: defaultW,
        h: defaultH,
        cmp: null,
      });

      // On next render, scroll component into view
      this.$nextTick(function () {
        const components = this.$refs[`grid-component-${newI}`];

        if (components && components.length) {
          const element = components[0].$el;

          element.scrollIntoView({
            behavior: "smooth",
          });
        }
      });
    },

    onRemove: function (toRemove) {
      const cmps = this.layout;

      const i = cmps.findIndex(function (cmp) {
        return cmp.i === toRemove.i;
      });

      if (i >= 0) {
        cmps.splice(i, 1);
      }
    },

    onDeleteAll: function () {
      this.$emit("deleteall");
    },

    onReset: function () {
      this.$emit("reset");
    },

    onCreateCmp: function (selectedTemplate) {
      let item = this.targetComponent;

      try {
        if (!selectedTemplate) {
          console.log("No component selected for creation");

          return;
        }

        const { defaultProperties, defaultLayout } = selectedTemplate;

        // Set default layout
        if (defaultLayout) {
          const clonedLayout = this.cloneJSON(defaultLayout);
          const keys = Object.keys(clonedLayout);

          keys.forEach((k) => {
            item[k] = clonedLayout[k];
          });
        }

        // Set default properties
        if (defaultProperties) {
          item.props = this.cloneJSON(defaultProperties);

          console.log(defaultProperties);
        } else {
          item.props = {};
        }

        // Set component for item
        item.cmp = selectedTemplate.cmp; //"Cube";
      } catch (e) {
        console.log("[Error] Template config: ", e);
      }

      this.onCloseForm();
    },

    onSaveCmp: function (item, options) {
      this.$emit("savecmp", { item: item, options: options });
    },

    onCloseForm: function () {
      this.showForm = false;

      this.selectedComponent = null;
      this.targetComponent = null;
    },
  },
};
</script>
<style>
.grid-item {
  padding-bottom: 10px;
  padding-left: 10px;
  overflow: hidden;
}

.grid-item-editting {
  /* border: thin solid rgb(13, 66, 64); */
}

.grid-item-editting::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background: rgba(0, 0, 0, 0.45);
  border: thin solid rgb(13, 66, 64);
  border-radius: 4px;
  margin-bottom: 10px;
  margin-left: 10px;
  pointer-events: none;
}

.grid-item-dirty::after {
  border: thin solid rgb(105, 37, 37);
}

.grid-item-editting:hover .dashboard-item-drag-text {
  opacity: 1 !important;
}

.vue-grid-item > .vue-resizable-handle {
  bottom: 22px !important;
  right: 12px !important;
  width: 40px !important;
  height: 40px !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
  background-size: 10px !important;
  background-position: 50% 50% !important;
  z-index: 6;
  border-radius: 4px;
}

.grid-item-small > .vue-resizable-handle {
  bottom: 20px !important;
  right: 12px !important;
  width: 30px !important;
  height: 30px !important;
  background-size: 8px !important;
}

.no-click {
  pointer-events: none;
}

.dashboard-item-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.dashboard-item-add {
  position: absolute;
  right: 74px;
  top: 12px;
  min-width: 40px !important;
  background: rgba(255, 255, 255, 0.8);
  z-index: 6;
}

.grid-item-small > .dashboard-item-add {
  right: 112px;
  top: 10px;
  width: 30px !important;
  height: 30px !important;
}

.dashboard-item-remove {
  position: absolute;
  right: 12px;
  top: 12px;
  min-width: 40px !important;
  background: rgba(255, 255, 255, 0.8);
  z-index: 6;
}

.grid-item-small > .dashboard-item-remove {
  right: 52px;
  top: 10px;
  width: 30px !important;
  height: 30px !important;
}

.dashboard-item-drag-wrapper {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dashboard-item-drag-text-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  z-index: 6;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.dashboard-item-drag-text {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 0px 8px;
  opacity: 0;
  transition: 0.3s;
  margin-left: 30px;
  margin-right: 30px;
  margin-bottom: 10px;
}

.dashboard-item-drag-wrapper:hover div {
  opacity: 1;
}

.dashboard-offset-margin-right {
  margin-right: 10px;
}

/* .grid-wrapper::after {
  box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.7) !important;
  content: "";
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  padding: 12px;
  z-index: 9999 !important;
  pointer-events: none;
} */
</style>