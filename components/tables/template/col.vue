<template>
  <div
    :style="isFiltered ? 'color: var(--v-primary-base);' : ''"
    :class="[!isFiltered && (hovered || isSorted) ? 'text--primary' : '']"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
  >
    {{ header.text }}

    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <div small style="display: flex; flex-direction: vertical">
          <v-icon
            v-show="!isAction && isSortable"
            v-bind="attrs"
            v-on="on"
            small
            :style="!isSorted && !hovered ? 'opacity: 0' : ''"
            :color="sortIconColor"
            :disabled="disableSort"
            @click="onSort"
            >{{ sortIcon }}</v-icon
          >

          <template v-if="state.idx > -1">
            {{ state.idx + 1 }}
          </template>
        </div>
      </template>

      {{ $t("Order by") }}
    </v-tooltip>

    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-show="!isAction && isFiltered"
          v-bind="attrs"
          v-on="on"
          :color="isFiltered ? 'primary' : ''"
          small
          @click.stop="onShowFilter"
        >
          mdi-filter
        </v-icon>
      </template>

      {{ $t("Column with active filters") }}
    </v-tooltip>

    <!-- <v-chip small v-if="state.idx > -1">{{ state.idx + 1 }}</v-chip> -->
  </div>
</template>
<script>
import HeaderMixin from "../mixins/header";

export default {
  mixins: [HeaderMixin],
};
</script>