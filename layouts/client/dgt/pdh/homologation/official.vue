<template>
  <client-only>
    <div class="px-12 pt-6" style="height: 100%; width: 100%">
      <!-- <v-row class="px-12 mt-4" align="stretch"> -->
      <!-- <v-col :sm="12" :md="12" :lg="12"> -->
      <v-card flat height="100%">
        <v-card-title>
          <div>{{ $t("Cartografia Homologada até") }} {{ dateNow }}</div>
          <v-spacer></v-spacer>

          <!-- TODO: Importação -->
          <v-btn v-show="false" color="primary" @click="onImport"
            ><v-icon left>mdi-microsoft-excel</v-icon> {{ $t("Import") }}</v-btn
          >
        </v-card-title>

        <v-card-text class="pb-0">
          <v-row>
            <v-col sm="5" md="5" lg="5" class="py-0">
              <v-text-field
                outlined
                :rules="rules"
                validate-on-blur
                dense
                clearable
                :label="'Pesquisar por proprietário'"
                v-model="ownerValue"
                @keyup.enter="onFilter"
                @click:clear="onClearOwner"
              ></v-text-field>
            </v-col>
            <v-col sm="5" md="5" lg="5" class="py-0">
              <v-text-field
                outlined
                :rules="rules"
                validate-on-blur
                dense
                clearable
                :label="'Pesquisar por produtor'"
                v-model="producerValue"
                @keyup.enter="onFilter"
                @click:clear="onClearProducer"
              ></v-text-field>
            </v-col>

            <v-col sm="2" md="2" lg="2" class="py-0">
              <v-btn
                block
                outlined
                color="primary"
                :disabled="!isValid"
                @click="onFilter"
              >
                <v-icon left>mdi-magnify</v-icon>
                Aplicar Filtro</v-btn
              >
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-text>
          <BasicTable
            flat
            :height="'65vh'"
            :headers="tableColumns"
            :defaultFilters="filters"
            :store="'OfficialHomologationRequests'"
            :defaultSortBy="'end_date'"
            :defaultSortOrder="false"
          ></BasicTable>
        </v-card-text>
      </v-card>
      <!-- </v-col>
      </v-row> -->
    </div>
  </client-only>
</template>

<script>
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
    text: "Entidade Requerente",
    value: "applicant_name",
    align: "left",
    filterable: {
      type: "string",
    },
  },
  {
    text: "Identificação do Processo",
    value: "name",
    filterable: {
      type: "string",
    },
  },
  {
    text: "Terminado Em",
    value: "end_date",
  },
  {
    text: "Produtor",
    value: "producers_list",
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
  },
  {
    text: "Proprietário",
    value: "owner_name",
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
  },
  {
    text: "Especificação dos Dados",
    value: "product_type",
    renderer: {
      type: "remotesimple",
      store: "entities/ProductTypes",
      text: "description",
      value: "code",
      storeRead: "all",
    },
  },
  {
    text: "Escala",
    value: "data_specification",
    renderer: {
      type: "remotesimple",
      store: "entities/DataSpecificationTypes",
      text: "description",
      value: "code",
      storeRead: "all",
    },
  },
];

export default {
  components: {
    BasicTable,
  },

  data() {
    return {
      tableColumns: columns,
      filters: [],
      ownerValue: null,
      producerValue: null,
    };
  },

  created: async function () {
    const EPSGStore = this.$store.$db().model("EpsgTypes");
    const DataSpecificationStore = this.$store
      .$db()
      .model("DataSpecificationTypes");
    const DataTypeStore = this.$store.$db().model("DataTypes");
    const ProductTypesStore = this.$store.$db().model("ProductTypes");

    if (process.client) {
      await EPSGStore.api().read({ once: true });
      await DataSpecificationStore.api().read({ once: true });
      await DataTypeStore.api().read({ once: true });
      await ProductTypesStore.api().read({ once: true });
    }
  },

  computed: {
    dateNow: function () {
      return new Date().toISOString().split("T")[0];
    },

    rules: function () {
      return [];
    },

    isValid: function () {
      const validOwner = this.ownerValue && this.ownerValue.length >= 4;
      const validProducer =
        this.producerValue && this.producerValue.length >= 4;

      return true; //validProducer || validOwner;
    },
  },

  methods: {
    onFilter: function () {
      const owner = this.ownerValue;
      const producer = this.producerValue;

      const filters = [];

      if (owner && owner.length) {
        filters.push({
          property: "owner_name",
          operator: "like",
          value: owner,
        });
      }

      if (producer && producer.length) {
        filters.push({
          property: "producers_list",
          operator: "likein",
          value: producer,
        });
      }

      this.filters = filters;
    },

    onClearProducer: function () {
      const owner = this.ownerValue;

      const filters = [];

      if (owner && owner.length) {
        filters.push({
          property: "owner_name",
          operator: "like",
          value: owner,
        });
      }

      this.filters = filters;
    },

    onClearOwner: function () {
      const producer = this.producerValue;

      const filters = [];

      if (producer && producer.length) {
        filters.push({
          property: "producers_list",
          operator: "likein",
          value: producer,
        });
      }

      this.filters = filters;
    },

    min4: function (val) {
      const valid = val && val.length >= 4;

      return valid || "Digite pelos menos 4 caracteres";
    },

    onImport: function () {
      // TODO: import to excell
    },
  },
};
</script>

<style>
.ho {
  overflow: hidden;
}
</style>
