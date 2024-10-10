<template>
  <v-card
    :height="height"
    class="d-flex justify-space-between flex-column align-center"
  >
    <v-card-title>{{ title }}</v-card-title>

    <!-- <v-row align="stretch">
      <v-col> -->
    <div
      :class="
        'requests unselectable text-center font-weight-bold my-0 text--secondary ' +
        (height === 300 ? 'text-h1 ' : 'text-h1 ')
      "
    >
      {{ values.requests }}
    </div>
    <!-- </v-col>
    </v-row> -->

    <div
      :style="'height: ' + (showSpecifics ? '100px' : '50px')"
      :class="'d-flex justify-center align-center'"
    >
      <template v-if="showSpecifics">
        <span class="open unselectable font-weight-bold text-h6"
          >{{ $t("On Going:") }} {{ values.open }}</span
        >
        <span class="font-weight-bold text-h6 px-2">/</span>
        <span class="finished unselectable font-weight-bold text-h6"
          >{{ $t("Finished:") }} {{ values.finished }}</span
        >

        <span v-if="showCancelled" class="font-weight-bold text-h6 px-2"
          >/</span
        >
        <span
          v-if="showCancelled"
          class="cancelled unselectable font-weight-bold text-h6"
          >{{ $t("Cancelled:") }} {{ values.cancelled }}</span
        >
      </template>
    </div>
  </v-card>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },

    height: {
      default: 400,
    },

    showCancelled: {
      type: Boolean,
      default: false,
    },

    showSpecifics: {
      type: Boolean,
      default: false,
    },

    values: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
};
</script>

<style scoped>
.requests {
  color: var(--v-sucess-base);
}

.open {
  color: var(--v-primary-base);
}

.finished {
  color: var(--v-success-base);
}

.cancelled {
  color: var(--v-error-darken1);
}
</style>