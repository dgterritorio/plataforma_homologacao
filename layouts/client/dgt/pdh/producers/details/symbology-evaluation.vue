<template>
  <v-row class="shrinked-row ">
    <v-col sm="12" md="12" lg="12">
      <StateInfo :store="'ProducerStateTypes'" :showTitle="false" :state="record.request.code"></StateInfo>
    </v-col>
    <!-- <v-col sm="12" md="12" lg="12">
              <Timer
                :store="'ProducerStateTypes'"
                flat
                expanded
                :record="record.states[record.states.length -1]"
                :states="record.states"
              ></Timer>
    </v-col>-->
    <v-col sm="12" md="12" lg="12">
      <MustIntervene
        flat
        expanded
        :finished="record.request.finished"
        :record="record.states[record.states.length -1]"
        :states="record.states"
      ></MustIntervene>
    </v-col>
  </v-row>
</template>
<script>
import StateInfo from "@/layouts/client/dgt/pdh/custom/symbology/state-icon.vue";
//import Timer from "@/layouts/client/dgt/pdh/custom/symbology/state-timer.vue";
import MustIntervene from "@/layouts/client/dgt/pdh/custom/symbology/must-intervene.vue";

export default {
  components: {
//    Timer,
    MustIntervene,
    StateInfo,
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