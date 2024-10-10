<template>
  <SimpleDetails :title="$t('Tramitation History')">
    <template v-slot:body>
      <v-row justify="center">
        <v-col :sm="12" :md="12" :lg="12" class="text-center subtitle">
          <span class="headline font-weight-bold">{{ todayText }}</span>
          <v-btn
            text
            outlined
            color="primary"
            :style="
              (hasRevertedStates ? 'right: 100px;' : 'right: 30px;') +
              'position: absolute'
            "
            @click="ascending = !ascending"
          >
            {{ $t("Order") + ": " }}
            {{ orderText }}
            <v-icon class="ml-2">{{
              ascending ? "mdi-arrow-down" : "mdi-arrow-up"
            }}</v-icon>
          </v-btn>

          <v-btn
            v-if="hasRevertedStates"
            outlined
            text
            color="primary"
            style="right: 30px; position: absolute"
            @click="showReverted = !showReverted"
          >
            <v-icon>
              {{ showReverted ? "mdi-eye" : "mdi-eye-off" }}
            </v-icon>
          </v-btn>
        </v-col>

        <v-col :sm="12" :md="12" :lg="12">
          <v-timeline
            align-top
            class="px-2"
            style="overflow-x: hidden; overflow-y: scroll"
          >
            <v-timeline-item
              v-for="(state, idx) in reversedStates"
              :key="idx"
              :color="state.color"
              :right="state.intervening ? false : true"
              :left="state.intervening ? true : false"
              small
              v-show="
                !state.hasOwnProperty('reverted') ||
                (state.hasOwnProperty('reverted') && showReverted)
              "
            >
              <StateSquare
                :record="state"
                @click="onInspectState(state, idx)"
              ></StateSquare>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>

      <v-dialog
        width="900"
        content-class="actionform"
        scrollable
        v-model="stateDialog"
      >
        <!-- <SimpleDetails
          :title="$t('State History')"
          style="margin: 0 !important"
        >
          <template v-slot:body> -->
        <StateHistory
          :record="selectedState"
          :previousState="selectedPreviousState"
          @close="onCloseState"
        ></StateHistory>

        <!-- <v-container class="d-flex">
              <v-spacer></v-spacer>
              <v-btn outlined color="primary" @click="onCloseState">
                {{ $t("Close") }}
              </v-btn>
            </v-container> -->
        <!-- </template>
        </SimpleDetails> -->
      </v-dialog>
    </template>
  </SimpleDetails>
</template>

<script>
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import StateSquare from "@/layouts/client/dgt/pdh/homologation/timeline/square.vue";
import StateHistory from "@/layouts/client/dgt/pdh/homologation/details/review-homologation.vue";

export default {
  name: "FullTimeline",

  components: {
    StateSquare,
    StateHistory,
    SimpleDetails,
  },

  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    title: {
      type: String,
      default: function () {},
    },
  },

  data() {
    return {
      ascending: true,
      showReverted: false,
      hasRevertedStates: false,

      stateDialog: false,
      selectedState: null,
      selectedPreviousState: null
    };
  },

  computed: {
    orderText: function () {
      return this.ascending ? this.$t("Descending") : this.$t("Ascending");
    },

    todayText: function () {
      return this.ascending ? this.$t("Today") : this.$t("Beggining");
    },

    reversedStates: function () {
      return this.reverseStates(this.record.states);
    },
  },

  methods: {
    parseDate: function (date) {
      try {
        const d = new Date(date);

        return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
      } catch (e) {
        return "";
      }
    },

    reverseStates: function (states) {
      if (!states) {
        return [];
      }

      for (let i = 0; i < states.length; i++) {
        if (states[i].hasOwnProperty("reverted")) {
          this.hasRevertedStates = true;

          break;
        }
      }

      // If order = ascending, return
      if (!this.ascending) {
        return states;
      }

      // Else, reverse
      const len = states.length;

      const reversed = new Array(len);

      for (let i = 0; i < len; i++) {
        reversed[len - i - 1] = states[i];
      }

      return reversed;
    },

    onInspectState: function (state, idx) {
      this.selectedState = state;

      const states = this.reversedStates;
      const ascending = this.ascending;

      const previousIdx = ascending ? idx + 1 : idx - 1;

      if(previousIdx >= 0 && previousIdx < states.length){
        this.selectedPreviousState = states[previousIdx];
      } else {
        this.selectedPreviousState = null;
      }

      this.stateDialog = true;
    },

    onCloseState: function () {
      this.stateDialog = false;
    },
  },
};
</script>
