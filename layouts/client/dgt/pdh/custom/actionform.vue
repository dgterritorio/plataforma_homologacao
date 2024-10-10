<template>
  <v-card>
    <v-card-title
      class="d-flex justify-space-between elevation-1"
      style="z-index: 10"
    >
      {{ title }}
      <v-icon @click="onClose">mdi-close</v-icon>
    </v-card-title>

    <v-card-text style="min-height: 600px" ref="formbody">
      <v-stepper v-model="step" class="no-box-shadow">
        <v-stepper-items class="box-shadow: none !important">
          <!-- First Step -->
          <v-stepper-content step="1" style="padding: 0">
            <!-- <v-row style="margin:0;"> -->
            <!-- Renders introduction here -->
            <slot name="intro"></slot>
            <!-- </v-row> -->
          </v-stepper-content>

          <!-- Templated Step -->
          <template v-for="(action, idx) in actions">
            <v-stepper-content
              :key="'actions-' + idx"
              :step="2 + idx"
              style="padding: 0"
            >
              <!-- Render actions here -->
              <component
                :is="action.cmp"
                :key="'action-' + idx"
                ref="action"
                v-model="formStates[idx].completed"
                :record="record"
                :title="action.title"
                :options="action.options"
                @updatevalid="checkValidaty"
                @validating="onValidatingForm($event, idx)"
              ></component>
            </v-stepper-content>
          </template>

          <v-stepper-content step="200" style="padding: 0">
            <!-- <v-row style="margin:0;"> -->
            <!-- <v-col :sm="12" :md="12" :lg="12"> -->
            <slot name="conclusion"></slot>
            <!-- </v-col> -->
            <!-- </v-row> -->
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card-text>

    <v-card-actions
      class="fixed-card-footer elevation-1 d-flex justify-end"
      style="z-index: 10"
    >
      <v-btn v-if="step > 1" width="30%" @click="onBack">{{
        $t("Back")
      }}</v-btn>
      <v-spacer></v-spacer>

      <template>
        <v-btn
          v-if="step > 1 && step < 200"
          :dark="valid"
          color="primary"
          width="30%"
          @click="onSave"
          >{{ $t("Save") }}</v-btn
        >

        <v-btn
          v-else-if="step != 200"
          :disabled="!valid || step != 1"
          :dark="valid"
          color="primary"
          width="30%"
          @click="onSummary"
          >{{ $t("Next") }}</v-btn
        >

        <v-btn v-else dark color="primary" width="30%" @click="onSubmit">{{
          $t("Submit")
        }}</v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
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

    actions: {
      type: Array,
      default: function () {
        return [];
      },
    },

    formStates: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  data() {
    return {
      step: 1,
      lastScrollPos: 0,
      valid: false,
    };
  },

  created: function () {
    this.checkValidaty();
  },

  methods: {
    onSubmit: function () {
      const actions = this.$refs.action;

      const payloads = [];

      if (actions) {
        actions.forEach(function (action) {
          if (action.getResult) {
            const res = action.getResult();

            payloads.push(res);
          }
        });
      }

      this.$emit("submit", payloads);
    },

    onClose: function () {
      this.$emit("close");
    },

    onBack: function () {
      this.step = 1;

      this.checkValidaty();

      const formBody = this.$refs.formbody;

      formBody.scrollTop = this.lastScrollPos;
    },

    onSave: async function () {
      // -2 because the first is the introduction, and the array is 0 based
      const step = this.step - 2;

      // Actions array
      const actions = this.$refs.action;

      // Target form
      const form = actions[step];

      this.$store.commit("SET_LOADING", true);

      // If the form was saved
      const isSaved = await form.save();

      this.$store.commit("SET_LOADING", false);

      // We go to the introduction again and validate
      if (isSaved) {
        await form.validate();

        this.step = 1;

        this.checkValidaty();
      }
    },

    onSummary: function () {
      const actions = this.$refs.action;

      const payloads = [];
      let order = 1;

      if (actions) {
        actions.forEach(function (action) {
          // if (action.getResult) {
          //   const res = action.getResult();

          //   payloads.push(res);
          // }

          if (action.getReport) {
            const res = action.getReport();

            res.order = order;

            payloads.push(res);

            order++;
          }
        });
      }

      this.$emit("summary", payloads);

      this.step = 200;

      // Scroll form task to top
      const formBody = this.$refs.formbody;

      this.lastScrollPos = formBody.scrollTop;

      formBody.scrollTop = 0;
    },

    checkValidaty: function () {
      let valid = true;

      const validaty = this.formStates;
      const actions = this.actions;

      if (!validaty) {
        this.valid = false;

        return;
      }

      for (let i = 0; i < validaty.length; i++) {
        if (actions[i].ignoreValidity) {
          continue;
        }

        if (!validaty[i].completed) {
          valid = false;

          break;
        }
      }

      this.valid = valid;
    },

    goTo: function (idx) {
      this.step = 2 + idx;

      // Scroll form task to top
      const formBody = this.$refs.formbody;

      this.lastScrollPos = formBody.scrollTop;

      formBody.scrollTop = 0;
    },

    onValidatingForm: function (value, formIdx) {
      this.formStates[formIdx].validating = value;
    },
  },
};
</script>

<style scoped>
.fixed-card-footer {
  padding: 15px 30px 30px 30px;
}

.no-box-shadow {
  box-shadow: none;
}
</style>