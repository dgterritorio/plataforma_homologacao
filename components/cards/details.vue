<template>
  <v-row class="fill-height" align="start" justify="center">
    <v-col :sm="8" :md="8" :lg="9">
      <!-- Multi-tab panels-->
      <v-tabs v-model="tab" class="hide-slider">
        <v-tab-item
          :transition="false"
          :reverse-transition="false"
          v-for="(panel,idx) in components"
          :key="idx"
        >
          <!-- Tpl component -->
          <component
            v-if="panel.type === 'cmp'"
            :key="'panel-' + idx"
            :is="panel.cmp"
            :record="record"
            style="min-height:700px;"
          ></component>
        </v-tab-item>
      </v-tabs>
    </v-col>

    <v-col :sm="4" :md="4" :lg="3">
      <!-- Control panel -->
      <SimpleCard :title="$t('Menu')">
        <template v-slot:body>
          <v-list rounded>
            <v-list-item-group v-model="itemIdx" color="primary">
              <template v-for="(panel, idx) in panels">
                <v-list-item
                  :key="'item-' + idx"
                  v-if="panel.type === 'cmp' || panel.type==='event'"
                  @click="onTabClick(panel, panel._idx)"
                >
                  <v-list-item-action>
                    <v-icon>{{panel.icon}}</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>{{$t(panel.title)}}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-subheader
                  :key="'subheader-' + idx"
                  v-else-if="panel.type === 'subheader'"
                  class="font-weight-bold"
                >{{$t(panel.title)}}</v-subheader>

                <v-divider :key="'divider-' + idx" v-else></v-divider>
              </template>
            </v-list-item-group>
          </v-list>
        </template>
      </SimpleCard>
    </v-col>
  </v-row>
</template>

<script>
import SimpleCard from "@/components/cards/simplecard.vue";

export default {
  name: "DetailsCard",

  components: {
    SimpleCard,
  },

  props: {
    panels: {
      type: Array,
      default: function () {
        return [];
      },
    },
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },

  data() {
    return {
      itemIdx: 0,
      lastItemIdx: 0,
      tab: 0,

      mapping: {},
    };
  },

  created: function () {},

  methods: {
    onTabClick(panel, idx) {
      switch (panel.type) {
        case "cmp":
          this.tab = idx;
          break;

        case "event":
          this.$emit(panel.event);
          break;
      }
    },
  },

  computed: {
    components: function () {
      const panels = this.panels;

      let idx = 0;

      const components = panels.filter(function (panel) {
        if (panel.type === "cmp") {
          panel._idx = idx;
          idx++;

          return true;
        } else {
          return false;
        }
      });

      return components;
    },
  },

  watch: {
    itemIdx: function (value) {
      const idx = value;

      if (idx !== undefined) {
        this.lastItemIdx = idx;

        return idx;
      } else {
        return this.lastItemIdx;
      }
    },
  },
};
</script>
<style>
.hide-slider .v-slide-group {
  height: 0;
}
</style>