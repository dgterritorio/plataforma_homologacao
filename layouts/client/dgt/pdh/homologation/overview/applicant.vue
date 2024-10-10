<template>
  <client-only>
    <v-row class="fill-height" align="start" justify="center">
      <v-col :sm="12" :md="12" :lg="12">
        <!-- Overview -->
        <OverviewHeader
          :ongoing="nOngoing"
          :finished="nFinished"
          :total="nTotal"
        ></OverviewHeader>
      </v-col>

      <v-col :sm="12" :md="12" :lg="12" style="margin-bottom: 50px">
        <BasicTable
          :headers="tableColumns"
          :store="'HomologationRequests'"
          :title="$t('Pedidos de Homologação')"
          :defaultSortBy="'state_start_date'"
          :defaultSortOrder="false"
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
    text: "ID do Requerimento",
    value: "id",
    width: 60,
    filterable: {
      operator: "eq",
    },
    divider: true,
  },
  {
    text: "Nome da Cartografia",
    value: "name",
    filterable: {
      type: "string",
    },
  },
  // {
  //   text: "Número Sequêncial do Requerimento",
  //   value: "order_number",
  //   width: 60,
  //   hide: true,
  //   filterable: {
  //     operator: "eq",
  //   },
  // },
  {
    text: "Concelho(s) Abrangido(s)",
    value: "county",
    filterable: {
      type: "string",
    },
    hide: true,
  },
  {
    text: "Finalidade",
    value: "purpose",
    renderer: {
      type: "remotesimple",
      store: "entities/PurposeTypes",
      text: "description",
      value: "code",
      storeRead: "all",
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      store: "entities/PurposeTypes",
      storeRead: "all",
      itemText: "description",
      itemValue: "code",
    },
    hide: true,
  },
  {
    text: "Entidade(s) Envolvida(s)",
    value: "producers_list",
    sortable: false,
    renderer: {
      type: "simple",
      value: "producers_list",
      fn: function (val) {
        if (typeof val === "object") {
          return "<div>" + val.join("</div><div>") + "</div>";
        } else {
          return "-";
        }
      },
    },
    hide: true,
  },
  {
    text: "Nome do Proprietário",
    value: "owner_name",
    filterable: {
      type: "string",
    },
    renderer: {
      type: "simple",
      value: "owner_name",
      fn: function (val, rec) {
        return rec.applicant_is_owner ? rec.applicant_name : val;
      },
    },
    hide: true,
  },
  {
    text: "Tipo Cartografia",
    value: "vectorial",
    renderer: {
      type: "icon",
      value: "type_description",
      textFn: function (val, record) {
        return val;
      },
      fn: function (val, record) {
        return record.vectorial
          ? "mdi-vector-polygon"
          : "mdi-image-size-select-actual";
      },
      color: "primary",
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      values: [
        { text: "Vetorial", value: true },
        { text: "Imagem", value: false },
      ],
    },
  },
  {
    text: "Especificação de Dados",
    value: "data_specification",
    renderer: {
      type: "remotesimple",
      store: "entities/DataSpecificationTypes",
      text: "description",
      value: "code",
      storeRead: "all",
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      store: "entities/DataSpecificationTypes",
      storeRead: "all",
      itemText: "description",
      itemValue: "code",
    },
    hide: true,
  },
  {
    text: "Tipo de Dados",
    value: "data_type",
    renderer: {
      type: "remotesimple",
      store: "entities/DataTypes",
      text: "description",
      value: "code",
      storeRead: "all",
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      store: "entities/DataTypes",
      storeRead: "all",
      itemText: "description",
      itemValue: "code",
    },
    hide: true,
  },
  {
    text: "Sistema de Georreferência",
    value: "epsg",
    renderer: {
      type: "remotesimple",
      store: "entities/EpsgTypes",
      text: "description",
      value: "code",
      storeRead: "all",
    },
    filterable: {
      type: "combobox",
      operator: "eq",
      store: "entities/EpsgTypes",
      storeRead: "all",
      itemText: "description",
      itemValue: "code",
    },
    hide: true,
  },
  {
    text: "Data de Entrada",
    value: "start_date",
    filterable: {
      type: "date",
      property: "start_date",
      operator: "eq",
    },
  },
  {
    text: "Data de Homologação",
    value: "end_date",
    filterable: {
      type: "date",
      property: "end_date",
      operator: "eq",
    },
    renderer: {
      type: "simple",
      value: "end_date_str",
      fn: function (val) {
        return val ? val : "-";
      },
    },
    hide: true,
  },
  {
    text: "Taxa de Homologação",
    value: "tax",
    renderer: {
      type: "simple",
      value: "tax",
      fn: function (value) {
        const str = value !== null && !isNaN(value) ? value + "" : null;

        if (!str) {
          return "-";
        }

        const isFloating = str.indexOf(".") > -1;
        const parsed = isFloating ? str.replace(".", ",") : str;

        return parsed + " €";
      },
    },
    filterable: {
      operator: "eq",
    },
    divider: true,
    hide: true,
  },
  {
    text: "Estado da Tramitação",
    value: "code",
    renderer: {
      type: "chip",
      store: "entities/HomologationStateTypes",
      text: "description",
      value: "code",
      storeRead: "all",
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
  //   text: "Avaliador Responsável",
  //   value: "evaluation_owner_name",
  //   renderer: {
  //     type: "simple",
  //     value: "evaluation_owner_name",
  //     fn: function (value) {
  //       return value ? value : "-";
  //     },
  //   },
  //   filterable: {
  //     type: "string",
  //   },
  // },
  {
    text: "Data de Início do Estado",
    value: "state_start_date",
    filterable: {
      type: "date",
      property: "state_start_date",
      operator: "eq",
    },
  },
  {
    text: "Data de Prazo do Estado",
    value: "state_deadline_date",
    filterable: {
      type: "date",
      property: "state_deadline_date",
      operator: "eq",
    },
  },
  {
    text: "Prazo do Estado (dias)",
    value: "deadline",
    hide: true,
    filterable: {
      operator: "eq",
    },
  },
  {
    text: "Prazo Vencido (dias)",
    value: "ellapsed_days",
    hide: true,
    filterable: {
      operator: "eq",
    },
  },
  {
    text: "Prazo Restante (dias)",
    value: "remaining_days",
    hide: true,
    filterable: {
      operator: "eq",
    },
  },
  {
    text: "Prazo do Estado (%)",
    value: "state_progress",
    width: 180,
    // renderer: {
    //   type: "progress",
    //   symbol: "%",
    //   fn: function (record) {
    //     const percent = record.state_progress;
    //     const symbol = "%";
    //     const color = percent > 100 ? "red" : "primary";

    //     return { value: percent, symbol: symbol, color: color };
    //   },
    // },
    renderer: {
      type: "progress",
      symbol: "%",
      fn: function (record) {
        const finished = record.finished;
        const noDeadline = !record.state_deadline_date;
        const percent = record.state_progress;
        const symbol = !finished && !noDeadline ? "%" : "";
        const color = percent > 100 && !finished ? "red" : "primary";
        let text;

        if (finished) text = "Terminado";
        else if (noDeadline) text = "Sem Prazo";
        else text = percent;

        return { value: percent, symbol: symbol, color: color, text: text };
      },
    },
    filterable: {
      type: "combobox",
      operator: "gteq",
      values: [
        { text: "Recente", value: 0 },
        { text: "A Terminar", value: 50 },
      ],
    },
  },
  {
    text: "Prazo Absoluto da Tramitação (%)",
    value: "absolute_processing_time",
    width: 180,
    // renderer: {
    //   type: "progress",
    //   symbol: "%",
    //   fn: function (record) {
    //     const percent = (record.absolute_processing_time * 100.0) / 90.0;
    //     const symbol = "%";
    //     const color = percent > 100 ? "red" : "primary";

    //     return { value: percent, symbol: symbol, color: color };
    //   },
    // },
    renderer: {
      type: "progress",
      symbol: "%",
      fn: function (record) {
        const finished = record.finished;
        const percent = (record.absolute_processing_time * 100.0) / 90.0;
        const symbol = !finished ? "%" : "";
        const color = percent > 100 && !finished ? "red" : "primary";
        const text = !finished ? Math.ceil(percent) : "Terminado";

        return { value: percent, symbol: symbol, color: color, text: text };
      },
    },
    filterable: {
      type: "combobox",
      operator: "gteq",
      values: [
        { text: "Recente", value: 0 },
        { text: "A Terminar", value: 50 },
      ],
    },
  },
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
  name: "OverviewPrivate",

  components: {
    OverviewHeader,
    BasicTable,
  },

  data() {
    return {
      nNotifications: 0,

      main: true,

      selected: null,

      filters: [],

      tableColumns: columns,

      record: {
        request: {
          purpose: null,
        },
        states: [],
        cartography: {},
        documents: [],
        producers: [],
        supervisor: {},
        entities: [],
        entity_members: [],
      },

      store: null,

      nOngoing: 0,
      nFinished: 0,
      nTotal: 0,
    };
  },

  created: async function () {
    this.store = this.$store.$db().model("HomologationRequests"); //await this.$ormutils.registerModel(Requests);
    this.stateTypesStore = this.$store.$db().model("HomologationStateTypes");
    const purposeStore = this.$store.$db().model("PurposeTypes");
    const dataSpecificationStore = this.$store
      .$db()
      .model("DataSpecificationTypes");
    const dataTypesStore = this.$store.$db().model("DataTypes");
    const epsgStore = this.$store.$db().model("EpsgTypes");

    if (process.client) {
      const id = this.$auth.user.id;

      this.filters = [
        {
          type: "number",
          property: "applicant_id",
          value: id,
        },
      ];

      this.stateTypesStore.api().read();
      purposeStore.api().read({ once: true });
      dataSpecificationStore.api().read({ once: true });
      dataTypesStore.api().read({ once: true });
      epsgStore.api().read({ once: true });

      // Request counts
      this.requestCounts();
    }
  },

  computed: {
    // nOngoing: function () {
    //   return this.store
    //     .query()
    //     .where("code", function (code) {
    //       return code >= 0 && code < 56;
    //     })
    //     .count();
    // },
    // nFinished: function () {
    //   return this.store
    //     .query()
    //     .where("code", function (code) {
    //       return code >= 56;
    //     })
    //     .count();
    // },
    // nTotal: function () {
    //   return this.store.getTotal();
    // },
  },

  methods: {
    onInspect: async function (record) {
      this.record.request = record;

      this.selected = record;
    },

    requestCounts: async function () {
      try {
        const response = await this.$axios.post(
          "/api/homologation/request/getcount"
        );

        if (response.error) {
          throw "[Error] Couldn't fetch counts";
        }

        const data = response.data;

        const total = data.total;
        const finished = data.finished;
        const ongoing = data.ongoing;

        this.nTotal = total;
        this.nFinished = finished;
        this.nOngoing = ongoing;
      } catch (e) {
        console.log("[Error] Couldn't fetch counts");
      }
    },
  },

  watch: {
    selected: {
      handler: async function (recordId) {
        const record = this.record;
        const request = record.request;

        const id = request.id;

        this.$router.push({ path: "/homologation/request-p/" + id });
      },
    },
  },
};
</script>

<style>
.ho {
  overflow: hidden;
}
</style>
