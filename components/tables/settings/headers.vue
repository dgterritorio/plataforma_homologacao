<template>
  <v-card max-height="80vh">
    <v-card-title>
      {{ $t("Active Columns") }}
      <v-spacer> </v-spacer>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            icon
            :color="showAll ? 'primary' : ''"
            @click="showAll = !showAll"
          >
            <v-icon>mdi-eye-plus</v-icon></v-btn
          >
        </template>

        {{ $t("Show all") }}
      </v-tooltip>

      <v-btn icon @click="onClose"> <v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>

    <v-card-text>
      <v-list>
        <template v-for="(header, index) in headers">
          <v-list-item :key="index" v-if="!isAction(header)">
            <v-list-item-action>
              <v-checkbox
                hide-details
                block
                :multiple="false"
                text
                class="d-flex justify-start"
                :true-value="true"
                :false-value="false"
                v-model="map[header.value]"
                @change="$emit('change')"
              ></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="unselectable">{{
                header.text
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card-text>

    <v-card-actions>
      <v-btn text color="" @click="onClose">{{ $t("Cancel") }}</v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="onSubmit">{{ $t("Confirm") }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },

    headers: {
      type: Array,
      default: [],
    },
  },

  data() {
    return {
      show_: this.show,
      showAll: false,

      map: this.initializeMap(),
    };
  },

  model: {
    prop: "show",
    event: "show",
  },

  methods: {
    initializeMap: function () {
      const map = {};

      const headers = this.headers;

      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];

        const column = header.value;
        const hidden = header.hide;
        const isAction = this.isAction(header);

        if (!isAction) {
          map[column] = !hidden;
        }
      }

      return map;
    },

    resetVisibility: function () {
      const headers = this.headers;

      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];

        const column = header.value;
        const hidden = header.hide;
        const isAction = this.isAction(header);

        if (!isAction) {
          this.map[column] = !hidden;
        }
      }
    },

    updateVisiblity: function () {
      const headers = this.headers;

      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];

        const column = header.value;
        const isAction = this.isAction(header);

        if (!isAction) {
          headers[i].hide = !this.map[column];
        }
      }
    },

    forceVisibility: function (value) {
      const keys = Object.keys(this.map);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        this.map[key] = value;
      }
    },

    isAction: function (header) {
      return (
        header.hasOwnProperty("renderer") && header.renderer.type === "action"
      );
    },

    onSubmit: function () {
      this.updateVisiblity();

      this.$emit("submit");
    },

    onClose: function () {
      this.$emit("close");
    },
  },

  watch: {
    show: function (value) {
      if (value) {
        this.resetVisibility();
      }
    },

    showAll: function (value) {
      this.forceVisibility(value);
    },
  },
};
</script>