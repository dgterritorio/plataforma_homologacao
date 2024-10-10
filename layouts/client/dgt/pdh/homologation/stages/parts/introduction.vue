<template>
  <v-row style="margin:0;" class="shrinked-row">
    <v-col :sm="8" :md="8" :lg="8" class="py-4">
      <FormSection :title="$t('Description of the State')">
        <template v-slot:body>
          <div class="body-1 mt-6 ml-6 text-justify unselectable" v-html="description"></div>
        </template>
      </FormSection>
    </v-col>
    <v-col :sm="4" :md="4" :lg="4" class="mt-16">
      <v-row>
        <v-col sm="12" md="12" lg="12">
          <State :showTitle="false" :state="state" :store="store" :size="200"></State>
        </v-col>

        <!-- <v-col sm="3" md="3" lg="3"> -->
        <!-- </v-col>
        <v-col sm="3" md="3" lg="3">-->
        <!-- </v-col>
        <v-col sm="3" md="3" lg="3">-->
        <!-- </v-col>-->
      </v-row>
    </v-col>

    <v-col class="mx-8">
      <!-- <FormSection :title="$t('Homologation Characteristics')">
      <template v-slot:body>-->
      <v-row>
        <v-col sm="4" md="4" lg="4">
          <ProductTypeSymbol expanded :record="record"></ProductTypeSymbol>
        </v-col>

        <v-col sm="4" md="4" lg="4" v-if="record.intervening">
          <HomologationTypeSymbol expanded :record="record"></HomologationTypeSymbol>
        </v-col>

        <v-col sm="4" md="4" lg="4" v-if="record.intervening">
          <ExceptionalSymbol expanded :record="record"></ExceptionalSymbol>
        </v-col>
      </v-row>
      <!-- </template>
      </FormSection>-->
    </v-col>

    <v-col v-if="showObservation" :sm="12" :md="12" :lg="12" class="py-4">
      <FormSection :title="$t('Relevant Observations')">
        <template v-slot:body>
          <div
            class="body-1 mx-6 my-6 text-justify"
            v-html="observations && observations.length ? observations : 'Sem observações relevantes'"
          ></div>
        </template>
      </FormSection>
    </v-col>

    <v-col :sm="12" :md="12" :lg="12" class="py-4">
      <FormSection :title="$t('Required Tasks')">
        <template v-slot:body>
          <div class="mt-6 mx-6 body-1 text-justify unselectable">
            Na lista seguinte encontra-se um conjunto de tarefas a cumprir de modo a progredir no estado da tramitação.
            Leia atentamente o objetivo de cada tarefa e preencha os campos obrigatórios.
          </div>

          <LocalTable
            class="ma-5 mt-4"
            :headers="headers"
            :data.sync="formStates"
            hideFooter
            :selectable="false"
            :height="null"
            @inspect="onInspect"
          ></LocalTable>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import State from "@/layouts/client/dgt/pdh/custom/symbology/state-icon2.vue";
import LocalTable from "@/components/tables/basic.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ExceptionalSymbol from "@/layouts/client/dgt/pdh/custom/symbology/exceptional-regime.vue";
import ProductTypeSymbol from "@/layouts/client/dgt/pdh/custom/symbology/product-type.vue";
import HomologationTypeSymbol from "@/layouts/client/dgt/pdh/custom/symbology/homologation-type.vue";

export default {
  components: {
    State,
    LocalTable,
    FormSection,
    ExceptionalSymbol,
    ProductTypeSymbol,
    HomologationTypeSymbol,
  },

  props: {
    store: {
      type: String,
      default: "HomologationStateTypes",
    },
    state: {
      type: Number,
      default: -2,
    },

    description: {
      type: String,
      default: "",
    },

    showObservation: {
      type: Boolean,
      default: false,
    },

    observations: {
      type: String,
      default: "",
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
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },

  data() {
    return {
      headers: [
        {
          text: "#",
          value: "order",
          width: 40,
          sortable: false,
        },
        {
          text: this.$t("Task"),
          value: "description",
          sortable: false,
          align: "left",
        },
        {
          text: this.$t("Completed"),
          value: "completed",
          renderer: {
            type: "icon",
            value: "completed",
            fn: function (value, record) {
              if (record.validating) {
                return "";
              }

              if (value) {
                return "mdi-check";
              } else {
                return "mdi-close";
              }
            },
            colorFn: function (value) {
              if (value) {
                return "primary";
              } else {
                return "red";
              }
            },
            textFn: function (value, record) {
              return record.validating ? "A validar..." : "";
            },
          },

          sortable: false,
        },
        // {
        //   text: this.$t("Validating"),
        //   value: "validating",
        //   renderer: {
        //     type: "icon",
        //     value: "validating",
        //     fn: function (value) {
        //       if (value) {
        //         return "mdi-refresh";
        //       } else {
        //         return "mdi-check";
        //       }
        //     },
        //     color: "primary",
        //   },
        //   sortable: false,
        // },
        {
          text: this.$t("Edit"),
          value: "inspect",
          renderer: {
            type: "action",
            icon: "mdi-pencil",
            event: "inspect",
          },
          sortable: false,
        },
      ],
    };
  },

  methods: {
    onInspect: function (row) {
      this.$emit("goto", row);
    },
  },
};
</script>