<template>
  <div
    :style="isFiltered ? 'color: var(--v-primary-base);' : ''"
    :class="[
      !isFiltered && (hovered || isSorted) ? 'text--primary' : '',
      'basic-column-header',
    ]"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
  >
    {{ header.text }}

    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
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
  </div>
</template>
<script>
import HeaderMixin from "../mixins/header";

export default {
  mixins: [HeaderMixin],
};
</script>
<style scoped>
.basic-column-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

th.text-left div,
th.text-right div {
  display: block !important;
}
</style>