<template>
  <!-- Overview -->
  <v-row>
    <v-col :sm="4" :md="4" :lg="4">
      <SimpleInfoCard
        icon="mdi-receipt"
        iconColor="primary"
        :title="$t('Requests')"
        :subtitle="$t('Total Number of Requests')"
        :value="total"
      ></SimpleInfoCard>
      <!-- On Going -->
    </v-col>

    <v-col :sm="4" :md="4" :lg="4">
      <SimpleInfoCard
        icon="mdi-ballot-recount-outline"
        iconColor="yellow darken-2"
        :title="$t('Requests')"
        :subtitle="$t('On going requests')"
        :value="ongoing"
      ></SimpleInfoCard>
      <!-- On Going -->
    </v-col>

    <v-col :sm="4" :md="4" :lg="4">
      <!-- Finished -->
      <SimpleInfoCard
        icon="mdi-check"
        iconColor="green darken-2"
        :title="$t('Requests')"
        :subtitle="$t('Finished requests')"
        :value="finished"
      ></SimpleInfoCard>
    </v-col>

    <!-- <v-col :sm="4" :md="4" :lg="4">
      <SimpleInfoCard
        icon="mdi-alert"
        iconColor="red darken-2"
        :title="$t('Notifications')"
        :subtitle="$t('Unread notifications')"
        :value="notifications"
      ></SimpleInfoCard>
    </v-col>-->
  </v-row>
</template>
<script>
import SimpleInfoCard from "~/components/cards/simple-info.vue";

export default {
  name: "OverviewHeader",

  components: {
    SimpleInfoCard,
  },

  props: {
    ongoing: {
      default: 0,
    },

    finished: {
      default: 0,
    },

    total: {
      default: 0,
    },
  },
};
</script>