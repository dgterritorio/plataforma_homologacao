<template>
  <ActionForm
    ref="actionform"
    :title="title"
    :actions="actions"
    :formStates="formStates"
    :record="record"
    @close="onClose"
    @submit="onSubmit"
    @summary="onSummary"
  >
    <template v-slot:intro>
      <Introduction
        :observations="lastObservations"
        :description="description"
        :showObservation="showObservations"
        :state="record.code"
        :record="record"
        :actions="actions"
        :formStates="formStates"
        @goto="onGoto"
      ></Introduction>
    </template>

    <template v-slot:conclusion>
      <Conclusion
        @changeobservations="observations = $event"
        :summary="summary"
        :showObservation="true"
        :state="record.code"
        :nextState="nextState"
      ></Conclusion>
    </template>
  </ActionForm>
</template>
<script>
import ActionForm from "@/layouts/client/dgt/pdh/custom/actionform.vue";
import Introduction from "@/layouts/client/dgt/pdh/homologation/stages/parts/introduction.vue";
import Conclusion from "@/layouts/client/dgt/pdh/homologation/stages/parts/conclusion.vue";

export default {
  name: "StageTemplate",

  components: {
    ActionForm,
    Introduction,
    Conclusion,
  },

  props: {
    title: {
      type: String,
      default: "",
    },
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    states: {
      type: Array,
      default: function () {
        return [];
      },
    },

    description: {
      type: String,
      default: "",
    },

    actions: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  data() {
    return {
      observations: "",
      advance: true,
      summary: [],
      nextState: -2,

      store: "HomologationStateTypes",
      isOrm: false,
      ormNamespace: null,
      ormModel: null,
    };
  },

  created: function () {
    const database = this.$store.$db();

    // Check if store is vuex-orm
    const modelsList = database.models();

    this.isOrm = modelsList.hasOwnProperty(this.store);

    if (this.isOrm) {
      // and set the database namespace and model
      this.ormNamespace = database.namespace;
      this.ormModel = database.model(this.store);

      this.ormModel.api().read();
    }
  },

  methods: {
    onClose: function () {
      this.$emit("close");
    },

    onSummary: async function (payloads) {
      let advance = true;
      const record = this.record;
      const requestId = record.id;

      this.summary = payloads;

      for (let i = 0; i < payloads.length; i++) {
        if (!payloads[i].advance) {
          advance = false;
        }
      }

      this.advance = advance;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/predict",
          {
            requestId: requestId,
            advance: advance,
          }
        );

        if (result.error) {
          throw result.error;
        }

        const data = result.data;
        const row = data[0];

        this.nextState = row.predict_next_state;
      } catch (e) {
        this.nextState = -2;
        console.log("Error predicting next state");
      }
    },

    onSubmit: async function (payloads) {
      const record = this.record;
      const observations = this.observations ? this.observations : "";

      const requestId = record.id;
      const stateId = record.state_id;
      const state = record.code;
      const advance = this.advance;

      try {
        const result = await this.$axios.post(
          "/api/homologation/state/change",
          {
            requestId: requestId,
            stateId: stateId,
            advance: advance,
            observations: observations,
          },
          {
            progress: true,
          }
        );

        if (result.error) {
          throw result.error;
        }

        this.onClose();

        const code = result.data[0].code;

        this.$emit("submit", code);
      } catch (e) {
        console.log("Error advancing state");
      }
    },

    onGoto: function (row) {
      this.$refs.actionform.goTo(row.step);
    },
  },

  computed: {
    formStates: function () {
      if (!this.actions.length) {
        return [];
      }

      return this.actions.map(function (row, idx) {
        return {
          order: idx + 1,
          description: row.title,
          completed: false,
          validating: false,
          step: idx,
        };
      });
    },
    statesTypes: function () {
      return this.ormModel ? this.ormModel.all() : [];
    },

    lastObservations: function () {
      const states = this.states;
      const len = states.length;

      if (len < 2) {
        return "";
      }

      let idx = 2;

      const currentState = states[len - 1];
      let observations = null;

      while (idx <= len && observations === null) {
        const lastState = states[len - idx];

        const lastCode = lastState.code;

        // If state was reverted
        if (lastCode === 300) {
          idx += 2;

          continue;
        }

        if (lastCode === currentState.code) {
          idx++;

          continue;
        }

        observations = lastState.observations ? lastState.observations : '';
      }

      return observations && observations.length
        ? observations
        : this.$t("No relevant observations.");
    },

    showObservations: function () {
      const states = this.states;
      const len = states.length;

      return len > 1;
    },
  },
};
</script>
<style>
.text-justify {
  text-align: justify;
  text-justify: inter-word;
}
</style>