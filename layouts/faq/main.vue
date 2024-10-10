<template>
  <div class="py-6" style="height: 100%">
    <v-row>
      <!-- <v-row align-self="start"> -->
      <template v-for="(section, idx) of sections">
        <v-col sm="12" md="12" lg="12" :key="'section-' + idx">
          <!-- <v-col sm="12" md="12" lg="12" :key="'section-' + idx"> -->
          <SimpleDetails :title="section.title">
            <template v-slot:body>
              <v-expansion-panels
                multiple
                hover
                flat
                class="my-2"
                :value="
                  section.subsections
                    ? section.subsections.map((c, idx) => idx)
                    : []
                "
              >
                <v-expansion-panel
                  dense
                  v-for="(subsection, i) in section.subsections"
                  :key="i"
                >
                  <v-expansion-panel-header
                    class="subtitle-1 font-weight-medium"
                    >{{ i + 1 }} -
                    {{ subsection.title }}</v-expansion-panel-header
                  >
                  <v-expansion-panel-content class="body-1 mx-6">
                    <div class="justify-text" v-html="subsection.body" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </template>
          </SimpleDetails>
          <!-- </v-col> -->
        </v-col>
      </template>
      <!-- </v-row> -->
    </v-row>
  </div>
</template>
<script>
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  components: {
    FormSection,
    SimpleDetails,
  },

  data() {
    return {
      store: null,
    };
  },
  created: async function () {
    if (process.client) {
      const store = this.$store.$db().model("FAQ");

      if (store) {
        await store.api().read();

        this.store = store;
      }
    }
  },

  computed: {
    sections: function () {
      if (!this.store) {
        return [];
      }

      return this.store.query().orderBy('ord', 'asc').get();
    },
  },
};
</script>
<style scoped>
.justify-text {
  text-align: justify;
}

.justify-text >>> b {
  font-weight: 500 !important;
}
</style>