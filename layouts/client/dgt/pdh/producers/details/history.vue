<template>
  <SimpleDetails :title="$t('Tramitation History')">
    <template v-slot:body>
      <v-row justify="center">
        <v-col :sm="12" :md="12" :lg="12" class="text-center subtitle">
          <span class="headline font-weight-bold">{{todayText}}</span>
          <v-btn
            text
            outlined
            color="primary"
            style="right: 30px; position: absolute;"
            @click="ascending = !ascending"
          >
            {{$t('Order') + ': '}}
            {{orderText}}
            <v-icon class="ml-2">{{ascending ? 'mdi-arrow-down' : 'mdi-arrow-up'}}</v-icon>
          </v-btn>
        </v-col>

        <v-col :sm="12" :md="12" :lg="12">
          <v-timeline class="px-2">
            <v-timeline-item
              v-for="(state, idx) in reversedStates"
              :key="idx"
              :color="state.color"
              :right="state.intervening ? false : true"
              :left="state.intervening ? true : false"
              small
            >
              <StateSquare :record="state" isProducer noDetails></StateSquare>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>
    </template>
  </SimpleDetails>
</template>

<script>
import SimpleCard from "@/components/cards/simplecard.vue";
import StateSquare from "@/layouts/client/dgt/pdh/homologation/timeline/square.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  name: "FullTimeline",

  components: {
    StateSquare,
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
  },
};
</script>
