<template>
  <client-only>
    <v-row class="mx-auto d-flex align-stretch" justify="center">
      <!-- <client-only v-if="main"> -->
      <v-col :sm="12" :md="12" :lg="12">
        <!-- Overview -->
        <OverviewHeader
          :ongoing="nOngoing"
          :finished="nFinished"
          :total="nTotal"
        ></OverviewHeader>
      </v-col>

      <v-col :sm="12" :md="12" :lg="12">
        <BasicTable
          :headers="tableColumns"
          :store="'ProducerRequests'"
          :title="$t('Registration List')"
          :sortBy="'start_date'"
          :sortDesc="true"
          @inspect="onInspect"
        ></BasicTable>
      </v-col>
    </v-row>
  </client-only>
</template>

<script>
import OverviewHeader from "@/layouts/client/dgt/pdh/custom/overview-header.vue";
import BasicTable from "~/components/tables/basic.vue";

const columns = [
  {
    text: "ID do Registo",
    value: "id",
    width: 60,
    filterable: {
      operator: "eq",
    },
    divider: true,
  },
  {
    text: "Nome da Entidade Produtora",
    value: "name",
    filterable: {
      type: "string",
    },
  },
  {
    text: "Número Sequêncial do Registo",
    value: "order_number",
    hide: true,
    width: 60,
    filterable: {
      operator: "eq",
    },
  },
  {
    text: "Produz Cartografia Vetorial",
    value: "carto_vectorial",
    renderer: {
      type: "icon",
      value: "carto_vectorial",
      fn: function () {
        return "mdi-vector-polygon";
      },
      colorFn: function (val) {
        return val ? "primary" : "grey";
      },
      textFn: function (val) {
        return val ? "Sim" : "Não";
      },
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      values: [
        { text: "Sim", value: true },
        { text: "Não", value: false },
      ],
    },
  },
  {
    text: "Produz Cartografia de Imagem",
    value: "carto_imagery",
    renderer: {
      type: "icon",
      value: "carto_imagery",
      fn: function () {
        return "mdi-image";
      },
      colorFn: function (val) {
        return val ? "primary" : "grey";
      },
      textFn: function (val) {
        return val ? "Sim" : "Não";
      },
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      values: [
        { text: "Sim", value: true },
        { text: "Não", value: false },
      ],
    },
  },
  {
    text: "Executa Coberturas Aerofotogramétricas",
    value: "carto_aerial",
    renderer: {
      type: "icon",
      value: "carto_aerial",
      fn: function () {
        return "mdi-airplane-takeoff";
      },
      colorFn: function (val) {
        return val ? "primary" : "grey";
      },
      textFn: function (val) {
        return val ? "Sim" : "Não";
      },
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      values: [
        { text: "Sim", value: true },
        { text: "Não", value: false },
      ],
    },
  },

  // {
  //   text: "Tipo Cartografia",
  //   value: "vectorial",
  //   renderer: {
  //     type: "simple",
  //     value: "type_description",
  //   },
  //   filterable: {
  //     type: "combobox",
  //     operator: "eq",
  //     values: [
  //       { text: "Vetorial", value: true },
  //       { text: "Imagem", value: false },
  //     ],
  //   },
  // },
  {
    text: "Data de Entrada",
    value: "start_date",
    renderer: {
      type: "simple",
      value: "start_date",
    },
    filterable: {
      type: "date",
      property: "start_date",
      operator: "eq",
    },
  },
  {
    text: "Estado da Tramitação",
    value: "code",
    renderer: {
      type: "chip",
      store: "entities/ProducerStateTypes",
      text: "description",
      value: "code",
      storeRead: "all",
    },
  },
  {
    text: "Data de Início do Estado",
    value: "state_start_date",
    renderer: {
      type: "simple",
      value: "state_start_date",
    },
    filterable: {
      type: "date",
      property: "state_start_date",
      operator: "eq",
    },
  },
  {
    text: "Requer Intervenção",
    value: "must_intervene",
    sortable: false,
    renderer: {
      type: "icon",
      value: "must_intervene_description",
      fn: function (val, record) {
        return record.must_intervene ? "mdi-alert-outline" : "mdi-check";
      },
      colorFn: function (val, record) {
        return record.must_intervene ? "red" : "primary";
      },
      textFn: function (val) {
        return val;
      },
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      values: [
        { text: "Sim", value: true },
        { text: "Não", value: false },
      ],
    },
  },
  // {
  //   text: "Prazo do Estado (%)",
  //   value: "state_processing_time",
  //   width: 180,
  //   renderer: {
  //     type: "progress",
  //     symbol: "%",
  //   },
  //   filterable: {
  //     type: "combobox",
  //     operator: "gteq",
  //     values: [
  //       { text: "Recente", value: 0 },
  //       { text: "A Terminar", value: 50 },
  //     ],
  //   },
  // },
  {
    text: "Inspecionar",
    value: "inspect",
    width: 30,
    renderer: {
      type: "action",
      icon: "mdi-magnify",
      event: "inspect",
    },
  },
];

export default {
  name: "OverviewEvaluator",

  components: {
    OverviewHeader,
    BasicTable,
  },

  data() {
    return {
      nNotifications: 0,
      main: true,

      selected: null,

      tableColumns: columns,
    };
  },

  created: async function () {
    this.store = this.$store.$db().model("ProducerRequests");

    this.stateTypesStore = this.$store.$db().model("ProducerStateTypes");

    if (process.client) {
      this.stateTypesStore.api().read();
    }
  },

  computed: {
    nOngoing: function () {
      return this.store
        .query()
        .where("code", function (code) {
          return code >= 0 && code < 2;
        })
        .count();
    },

    nFinished: function () {
      return this.store
        .query()
        .where("code", function (code) {
          return code >= 3;
        })
        .count();
    },

    nTotal: function () {
      return this.store.getTotal();
    },
  },

  methods: {
    onInspect: async function (record) {
      this.selected = record;
    },
  },

  watch: {
    selected: {
      handler: async function (recordId) {
        const record = this.selected;

        const id = record.id;

        this.$router.push({ path: "/producers/request/" + id });
      },
    },
  },
};
</script>
