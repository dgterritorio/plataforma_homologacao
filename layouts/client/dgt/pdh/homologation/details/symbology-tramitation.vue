<template>
  <v-row class="shrinked-row">
    <v-col sm="12" md="12" lg="12">
      <StateInfo :showTitle="false" :state="record.request.code"></StateInfo>
    </v-col>

    <v-col sm="12" md="12" lg="12">
      <MustIntervene flat expanded :record="record.request"></MustIntervene>
    </v-col>

    <v-col sm="12" md="12" lg="12">
      <Timer flat expanded :record="record.request"></Timer>
    </v-col>
    <v-col sm="12" md="12" lg="12">
      <TramitationTimer
        flat
        expanded
        :record="record.request"
      ></TramitationTimer>
    </v-col>

    <v-col sm="12" md="12" lg="12">
      <EvaluationOwner flat expanded :record="record.request"></EvaluationOwner>
    </v-col>
  </v-row>
</template>
<script>
import Timer from "@/layouts/client/dgt/pdh/custom/symbology/state-timer.vue";
import TramitationTimer from "@/layouts/client/dgt/pdh/custom/symbology/tramitation-timer.vue";
import MustIntervene from "@/layouts/client/dgt/pdh/custom/symbology/must-intervene.vue";
import StateInfo from "@/layouts/client/dgt/pdh/custom/symbology/state-icon.vue";
import EvaluationOwner from "@/layouts/client/dgt/pdh/custom/symbology/evaluation-owner.vue";

export default {
  components: {
    Timer,
    TramitationTimer,
    MustIntervene,
    StateInfo,
    EvaluationOwner,
  },
  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
};
</script>