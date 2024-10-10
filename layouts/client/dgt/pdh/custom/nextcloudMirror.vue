<template>
  <v-card style="min-height: 300px" class="mb-8">
    <v-btn block color="primary" @click="onRefresh">{{$t('Refresh List')}}</v-btn>
    <v-overlay :absolute="true" :value="loading">
      <span style="color: white" class="title font-weight-bold">{{$t('Loading')}}...</span>
    </v-overlay>

    <v-treeview
      v-model="tree"
      :open="open"
      open-all
      open-on-click
      :items="items"
      dense
      activatable
      item-key="name"
    >
      <template v-slot:prepend="{ item, open }">
        <v-icon
          v-if="item.isDirectory"
        >{{ item.loading ? 'mdi-autorenew' : (open ? 'mdi-folder-open' : 'mdi-folder') }}</v-icon>
        <v-icon
          v-else
        >{{ files.hasOwnProperty(item.extension) ? files[item.extension] : 'mdi-file-question' }}</v-icon>
      </template>

      <template v-slot:append="{ item }">
          <span v-if="item.name === 'Root'">{{items.length ? $t('Folder contains files') : $t('Folder is empty')}}</span>
      </template>
    </v-treeview>
  </v-card>
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },

    items: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  data() {
    return {
      //   open: ['root'],
      tree: [],
      files: {
        html: "mdi-language-html5",
        js: "mdi-nodejs",
        json: "mdi-json",
        md: "mdi-markdown",
        pdf: "mdi-file-pdf",
        png: "mdi-file-image",
        jpg: "mdi-file-image",
        txt: "mdi-file-document-outline",
        xls: "mdi-file-excel",
        sql: "mdi-database-search",
        geojson: "mdi-map",
        geotiff: "mdi-map",
        shp: "mdi-map"
      },
      open: ['Root'],
    };
  },

  methods: {
    onRefresh: function () {
      this.$emit("refresh");
    },
  }
};
</script>