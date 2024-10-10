<template>
  <v-row style="margin:0;">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('State Transition Forecast')">
        <template v-slot:body>
          <div class="mt-6 mx-6 body-1  text-justify unselectable">
            Nesta secção encontram-se (à esquerda) o estado atual do processo de registo da mera comunicação prévia e (à direita)
            a predição do próximo estado. O próximo estado pode variar dependendo do resultado de
            cada uma das tarefas cumpridas para o estado atual.
          </div>

          <v-row class="mx-3">
            <v-col :offset="1" :sm="4" :md="4" :lg="4">
              <!-- State -->
              <div
                class="font-weight-medium body-1 text-justify unselectable"
                style="text-align: center !important"
              >Estado Atual</div>
              <State :showTitle="false" :state="state" :store="store" :size="200"></State>
            </v-col>
            <v-col :sm="2" :md="2" :lg="2" class="d-flex justify-center align-center">
              <v-icon large>mdi-arrow-right-thick</v-icon>
            </v-col>
            <v-col :sm="4" :md="4" :lg="4">
              <!-- State -->
              <div
                class="font-weight-medium  body-1 text-justify unselectable"
                style="text-align: center !important"
              >Próximo Estado</div>
              <State :showTitle="false" :state="nextState" :store="store" :size="200"></State>
            </v-col>
          </v-row>
        </template>
      </FormSection>
    </v-col>

    <v-col :sm="12" :md="12" :lg="12">
      <!-- <span class="headline ">{{$t('Summary')}}</span>
      <v-divider></v-divider>-->
      <FormSection :title="$t('Tasks Summary')">
        <template v-slot:body>
          <div class="mt-6 mx-6 body-1  text-justify unselectable">
            Na lista seguinte encontra-se o resumo de cada tarefa cumprida para o estado atual do processo de registo da mera comunicação prévia.
            Consoante a conclusão da tarefa, o processo pode transitar para o estado seguinte ou para um ciclo de
            correção de dados.
          </div>

          <LocalTable
            class="ma-6 mt-6"
            :headers="headers"
            :data.sync="summary"
            hideFooter
            :selectable="false"
            :height="null"
          ></LocalTable>
        </template>
      </FormSection>
    </v-col>

    <v-col :sm="12" :md="12" :lg="12">
      <!-- <span class="headline ">{{$t('Observações Relevantes')}}</span>
      <v-divider></v-divider>-->
      <FormSection :title="$t('Relevant Observations')">
        <template v-slot:body>
          <div
            class="mt-6 mx-6 body-1  text-justify unselectable"
          >Deve preencher observações relevantes a transmitir ao próximo interveniente do processo de registo da mera comunicação prévia.</div>

          <v-textarea
            class="pa-4 py-6 pl-6"
            outlined
            v-model="internalObservations"
            :height="300"
            :placeholder="$t('Escrever observações relevantes')"
          ></v-textarea>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import State from "@/layouts/client/dgt/pdh/custom/symbology/state-icon2.vue";
import LocalTable from "@/components/tables/basic.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

export default {
  components: {
    State,
    LocalTable,
    FormSection,
  },

  props: {
    store: {
      type: String,
      default: 'HomologationStateTypes'
    },
    state: {
      type: Number,
      default: -2,
    },

    nextState: {
      type: Number,
      default: -2,
    },

    summary: {
      type: Array,
      default: function () {
        return [];
      },
    },

    showObservation: {
      type: Boolean,
      default: false,
    },

    observations: {
      type: String,
      default: "",
    },
  },

  model: {
    prop: "observations",
    event: "changeobservations",
  },

  data() {
    return {
      internalObservations: "",

      headers: [
        {
          text: "#",
          value: "order",
          width: 40,
          sortable: false,
        },
        {
          text: this.$t("Task Name"),
          value: "action",
          align: "left",
          sortable: false,
        },
        {
          text: this.$t("Task Conclusion"),
          value: "conclusion",
          sortable: false,
        },
        {
          text: this.$t("Number"),
          value: "number",
          sortable: false,
        },
        {
          text: this.$t("Allows Advance"),
          value: "advance",
          sortable: false,
          renderer: {
            type: "icon",
            value: "advance",
            fn: function (value) {
              return value ? "mdi-check" : "mdi-close";
            },

            colorFn: function (value) {
              return value ? "primary" : "red";
            },
          },
        },
      ],
    };
  },

  watch: {
    internalObservations: {
      handler: function (obs) {
        this.$emit("changeobservations", obs);
      },
    },
  },
};
</script>