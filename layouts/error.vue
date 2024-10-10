<template>
  <v-row align="center" justify="center" style="height: 100%">
    <div class="text-md-center unselectable">
      <h1 v-if="error.statusCode === 404" class="errorCode">{{ pageNotFound }}</h1>
      <h1 v-else>{{ otherError }}</h1>
      <NuxtLink to="/">
        <v-btn width="150" large color="primary">{{ $t('Go Home') }}</v-btn>
      </NuxtLink>
    </div>
  </v-row>
</template>

<script>
export default {
  layout: "empty",
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title
    };
  },
  data() {
    return {
      pageNotFound: this.$t("404 Not Found"),
      otherError: this.$t("An error occurred")
    };
  }
};
</script>

<style>
.d {
  margin: 0 auto;
  width: 25% !important;
}
.errorCode {
  text-align: center;
  vertical-align: middle;
  font-size: 55px;
  line-height: 100px;
  font-weight: 800;
  color: #424242;
  text-shadow: rgba(61, 61, 61, 0.3) 1px 1px, rgba(61, 61, 61, 0.2) 2px 2px,
    rgba(61, 61, 61, 0.3) 3px 3px;
}
</style>