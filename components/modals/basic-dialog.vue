<template>
  <v-dialog v-model="state" :max-width="maxWidth" :scrollable="scrollable">
    <v-card>
      <v-card-title class="headline d-flex justify-space-between elevation-1">
        {{title}}
        <v-btn text @click="hide">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Templated content here-->
        <slot name="content"></slot>
      </v-card-text>

      <v-card-actions>
        <slot name="actions" v-bind:state="state"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    // Show/Hide dialog at creation
    value: {
      type: Boolean,
      default: false
    },

    // Header bar title
    title: {
      type: String,
      default: ""
    },

    maxWidth: {
      type: Number,
      default: 800
    },

    scrollable: {
      type: Boolean,
      default: true
    }
  },

  model: {
    // Set model to the prop
    prop: "value",
    event: "value"
  },

  data() {
    return {
      // Sync model with the internal state
      state: this.value
    };
  },

  methods: {
    show: function() {
      this.state = true;
    },

    hide: function() {
      this.state = false;
    }
  },

  watch: {
    // Sync internal state with the prop
    value: {
      handler: function(newValue) {
        this.state = newValue;
      }
    },

    // Sync the external state with the internal state
    state: {
      handler: function(newState) {
        return this.$emit("value", newState);
      }
    }
  }
};
</script>