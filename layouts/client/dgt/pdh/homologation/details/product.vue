<template>
  <!-- :title="$t('Product Details')" -->
  <!-- <SimpleCard flat>
  <template v-slot:body>-->
  <v-row class="shrinked-row">
    <v-col :sm="12" :md="12" :lg="12" class="px-4">
      <v-card style="padding: 0">
        <BaseMap
          :record="record"
          height="400"
          style="padding: 0 -20px"
        ></BaseMap>

        <v-row class="shrinked-row pa-6">
          <v-col sm="6" md="6" lg="6">
            <DisplayField
              :options="{ text: $t('Work Area Recovered') }"
              :model="work_area_recovered"
            ></DisplayField>
          </v-col>

          <v-col sm="6" md="6" lg="6">
            <!-- <DisplayField
              :options="{ text: $t('Area') }"
              :model="area"
            ></DisplayField> -->

            <DisplayField
              :options="{
                text: $t('Area'),
                renderer: { type: 'locale', system: 'pt-PT' },
              }"
              :model="cartography.area"
            >
              <template v-slot:suffix>{{ areaSuffix }}</template>
            </DisplayField>
          </v-col>

          <!-- <v-col sm="6" md="6" lg="6">
            <DisplayField
              :options="{ text: $t('Perimeter') }"
              :model="perimeter"
            ></DisplayField>
          </v-col> -->
        </v-row>
      </v-card>
    </v-col>

    <v-col sm="12" md="12" lg="12">
      <SimpleDetails
        :title="$t('General Characteristics')"
        style="height: 100%"
      >
        <template v-slot:body>
          <v-row>
            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Cartography Type') }"
                :model="vectorial ? 'Vectorial' : 'Imagem'"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Product Version') }"
                :model="record.cartography.version"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Product Type') }"
                :model="product_type_description"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Georeference System') }"
                :model="epsg"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Data Type') }"
                :model="data_type"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Data Specification') }"
                :model="data_specification"
              ></DisplayField>
            </v-col>

            <v-col
              sm="6"
              md="6"
              lg="6"
              v-if="cartography.data_specification_version"
            >
              <DisplayField
                :options="{ text: $t('Data Specification Version') }"
                :model="data_specification_version"
              ></DisplayField>
            </v-col>

            <!-- Vectorail-->
            <v-col
              sm="6"
              md="6"
              lg="6"
              v-if="vectorial && product_type && product_type !== 1"
            >
              <DisplayField
                :options="{ text: $t('Data Structure') }"
                :model="data_structure"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="vectorial && record.request.flight_date">
              <DisplayField
                :options="{ text: $t('Image Acquisition Date') }"
                :model="record.request.flight_date"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{ text: $t('Flight Date') }"
                :model="record.request.flight_date_str"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="vectorial">
              <DisplayField
                :options="{ text: $t('Conclusion Date') }"
                :model="record.request.conclusion_date_str"
              ></DisplayField>
            </v-col>

            <!-- <v-col sm="6" md="6" lg="6" v-if="vectorial">
              <DisplayField
                :options="{ text: $t('Number of Sheets') }"
                :model="number_sheets"
                ><template v-slot:suffix>{{
                  number_sheets === 1 ? $t("sheet") : $t("sheets")
                }}</template></DisplayField
              >
            </v-col> -->
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <v-col sm="12" md="12" lg="12" v-if="!vectorial">
      <SimpleDetails :title="$t('Orthophotos Details')" style="height: 100%">
        <template v-slot:body>
          <v-row>
            <!-- Image -->

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{
                  text: $t(
                    'Spatial Resolution of Aerial Photography or Satellite Images'
                  ),
                }"
                :model="cartography.spatial_resolution"
                ><template v-slot:suffix>{{
                  $t("meters")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{ text: $t('Number of Spectral Bands') }"
                :model="cartography.bands_number"
                ><template v-slot:suffix>{{
                  cartography.bands_number === 1 ? $t("band") : $t("bands")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{ text: $t('Spatial Resolution of the Orthophotos') }"
                :model="cartography.orto_resolution"
                ><template v-slot:suffix>{{
                  $t("meters")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{
                  text: $t('Radiometric Composition of the Orthophotos'),
                }"
                :model="orto_radiometry"
              ></DisplayField>
            </v-col>

            <v-col
              sm="6"
              md="6"
              lg="6"
              v-if="!vectorial && cartography.orto_radiometric === 7"
            >
              <DisplayField
                :options="{ text: $t('Other Orthophotos Radiometry') }"
                :model="cartography.orto_radiometric_custom"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{
                  text: $t('Radiometric Resolution of the Orthophotos'),
                }"
                :model="cartography.orto_radiometric_resolution"
              >
                <template v-slot:suffix>{{
                  cartography.orto_radiometric_resolution === 1
                    ? $t("bit")
                    : $t("bits")
                }}</template>
              </DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{ text: $t('Number of Orthophotos') }"
                :model="cartography.orto_number"
              ></DisplayField>
            </v-col>

            <v-col
              :offset="!vectorial && cartography.orto_radiometric === 7 ? 0 : 0"
              sm="6"
              md="6"
              lg="6"
              v-if="!vectorial"
            >
              <DisplayField
                :options="{ text: $t('Dimension in M') }"
                :model="cartography.dimension_x"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6" v-if="!vectorial">
              <DisplayField
                :options="{ text: $t('Dimension in P') }"
                :model="cartography.dimension_y"
              ></DisplayField>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <!-- Digital MOdel -->
    <v-col sm="12" md="12" lg="12" v-if="!vectorial">
      <SimpleDetails :title="$t('Digital Model Details')" style="height: 100%">
        <template v-slot:body>
          <v-row>
            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Digital Model Type') }"
                :model="
                  cartography.is_digital_terrain ? 'Terreno' : 'Superfície'
                "
              ></DisplayField>
            </v-col>

            <!-- <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Is Digital Surface Model') }"
                :model="cartography.is_digital_surface ? 'Sim' : 'Não'"
              ></DisplayField>
            </v-col> -->

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Model Spatial Resolution') }"
                :model="cartography.model_resolution"
                ><template v-slot:suffix>{{
                  $t("meters")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{
                  text: $t('Surrounding Range for Model Generation'),
                }"
                :model="cartography.model_band"
                ><template v-slot:suffix>{{
                  $t("meters")
                }}</template></DisplayField
              >
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <!-- PLANIMETRIC -->
    <v-col sm="6" md="6" lg="6">
      <SimpleDetails :title="$t('Planimetric Accuracy')" style="height: 100%">
        <template v-slot:body>
          <v-row>
            <!-- Image + Vectorail-->

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{
                  text: $t('Medium Quadratic Error'),
                  renderer: { type: 'locale', system: 'pt-PT' },
                }"
                :model="cartography.planimetric_error"
              >
                <template v-slot:suffix>{{ $t("meters") }}</template>
              </DisplayField>
            </v-col>

            <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{
                  text: $t('Deviation per Point Percentage'),
                  renderer: { type: 'locale', system: 'pt-PT' },
                }"
                :model="cartography.planimetric_deviation"
              >
                <template v-slot:prefix>{{
                  $t("90% of points with deviation of less than")
                }}</template>
                <template v-slot:suffix>{{ $t("meters") }}</template>
              </DisplayField>
            </v-col>

            <!-- <v-col sm="12" md="12" lg="12">
              <DisplayField
                :options="{ text: $t('Deviation') }"
                :model="cartography.planimetric_deviantion"
              ></DisplayField>
            </v-col> -->
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <!-- ALTIMETRIC -->
    <v-col sm="6" md="6" lg="6">
      <SimpleDetails :title="$t('Altimetric Accuracy')" style="height: 100%">
        <template v-slot:body>
          <v-row>
            <!-- Image + Vectorail-->

            <v-col sm="12" md="12" lg="12" v-if="!vectorial">
              <DisplayField
                :options="{
                  text: $t('Altimetric Accuracy of the Model'),
                  renderer: { type: 'locale', system: 'pt-PT' },
                }"
                :model="cartography.altimetric_model_error"
                ><template v-slot:suffix>{{
                  $t("meters")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="12" md="12" lg="12" v-if="vectorial">
              <DisplayField
                :options="{
                  text: $t('Medium Quadratic Error'),
                  renderer: { type: 'locale', system: 'pt-PT' },
                }"
                :model="cartography.altimetric_error"
              >
                <template v-slot:suffix>{{
                  $t("meters")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="12" md="12" lg="12" v-if="vectorial">
              <DisplayField
                :options="{
                  text: $t('Deviation per Point Percentage'),
                  renderer: { type: 'locale', system: 'pt-PT' },
                }"
                :model="cartography.altimetric_deviation"
              >
                <template v-slot:prefix>{{
                  $t("90% of points with deviation of less than")
                }}</template>
                <template v-slot:suffix>{{ $t("meters") }}</template>
              </DisplayField>
            </v-col>

            <!-- <v-col sm="12" md="12" lg="12" v-if="vectorial">
              <DisplayField
                :options="{ text: $t('Deviation') }"
                :model="cartography.altimetric_point_percent"
              ></DisplayField>
            </v-col> -->
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <!-- Semantic -->
    <v-col sm="12" md="12" lg="12" v-if="vectorial">
      <SimpleDetails
        :title="$t('Semantic Data Compliance')"
        style="height: 100%"
      >
        <template v-slot:body>
          <v-row>
            <!-- Image + Vectorail-->

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{
                  text:
                    $t('Semantic Completude') +
                    ' ' +
                    $t('(% admissible errors of omission and commission)'),
                  renderer: { type: 'locale', system: 'pt-PT' },
                }"
                :model="cartography.semantic_completude"
              >
                <template v-slot:suffix>%</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{
                  text:
                    $t('Semantic Classification') +
                    ' ' +
                    $t('(% admissible classification errors)'),
                  renderer: { type: 'locale', system: 'pt-PT' },
                }"
                :model="cartography.semantic_classification"
                ><template v-slot:suffix>%</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{
                  text: $t(
                    'Maximum number of elements that do not respect the data structure in the evaluated area'
                  ),
                }"
                :model="cartography.max_semantic_incoherent"
                ><template v-slot:suffix>{{
                  cartography.max_semantic_incoherent
                    ? $t("element")
                    : $t("elements")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{
                  text: $t(
                    'Maximum number of duplicate elements in the evaluated area'
                  ),
                }"
                :model="cartography.max_semantic_duplicates"
                ><template v-slot:suffix>{{
                  cartography.max_semantic_duplicates === 1
                    ? $t("element")
                    : $t("elements")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Discontinuity Number') }"
                :model="cartography.max_discontinuity_number"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Discontinuity Sheets') }"
                :model="cartography.max_discontinuity_sheets"
              ></DisplayField>
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Pontual Elements') }"
                :model="cartography.pontual_elements"
                ><template v-slot:suffix>{{
                  cartography.pontual_elements === 1
                    ? $t("element")
                    : $t("elements")
                }}</template></DisplayField
              >
            </v-col>

            <v-col sm="6" md="6" lg="6">
              <DisplayField
                :options="{ text: $t('Linear Elements') }"
                :model="cartography.linear_elements"
              >
                <template v-slot:suffix>{{
                  cartography.linear_elements === 1
                    ? $t("element")
                    : $t("elements")
                }}</template>
              </DisplayField>
            </v-col>
          </v-row>
        </template>
      </SimpleDetails>
    </v-col>

    <!-- <v-col v-if="record.request.vectorial" sm="12" md="12" lg="12">
          <VectorialInfo :record="record"></VectorialInfo>
        </v-col>

        <v-col v-else sm="12" md="12" lg="12">
          <ImageInfo :record="record"></ImageInfo>
    </v-col>-->
  </v-row>
  <!-- </template>
  </SimpleCard>-->
</template>

<script>
// import VectorialInfo from "@/layouts/client/dgt/pdh/homologation/details/vectorial.vue";
// import ImageInfo from "@/layouts/client/dgt/pdh/homologation/details/image.vue";
import SimpleCard from "@/components/cards/simplecard.vue";
// import BaseMap from "@/layouts/client/dgt/pdh/homologation/details/map.vue";
import SimpleDetails from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";
import DisplayField from "@/components/forms/fields/display.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import BaseMap from "@/layouts/client/dgt/pdh/maps/map.vue";

export default {
  components: {
    // VectorialInfo,
    // ImageInfo,
    SimpleCard,
    BaseMap,
    SimpleDetails,
    DisplayField,
    FormSection,
  },
  props: {
    record: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },

  data() {
    return {
      epsgStore: null,
      dataSpecificationCartopTypes: null,
      dataSpecificationOthersTypes: null,
      dataSpecificationVersionTypes: null,
      dataVectorialTypes: null,
      dataImageryTypes: null,
      dataStructureTypes: null,
      ortoRadiometricTypes: null,
      productTypes: null,
    };
  },

  created: async function () {
    if (process.client) {
      try {
        const database = this.$store.$db();

        // and set the database namespace and model
        const productTypes = database.model("ProductTypes");
        const dataVectorialTypes = database.model("DataVectorialTypes");
        const dataImageryTypes = database.model("DataImageryTypes");
        const dataSpecificationCartopTypes = database.model(
          "DataSpecificationCartopTypes"
        );
        const dataSpecificationOthersTypes = database.model(
          "DataSpecificationOthersTypes"
        );
        const dataSpecificationVersionTypes = database.model(
          "DataSpecificationVersionTypes"
        );
        const dataStructureTypes = database.model("DataStructureTypes");
        const ortoRadiometricTypes = database.model("OrtoRadiometricTypes");
        // const acquisitionTypes = database.model("AcquisitionTypes");
        const epsgTypes = database.model("EpsgTypes");

        await productTypes.api().read({ once: true });
        await dataVectorialTypes.api().read({ once: true });
        await dataImageryTypes.api().read({ once: true });
        await dataSpecificationCartopTypes.api().read({ once: true });
        await dataSpecificationOthersTypes.api().read({ once: true });
        await dataSpecificationVersionTypes.api().read({ once: true });
        await dataStructureTypes.api().read({ once: true });
        await ortoRadiometricTypes.api().read({ once: true });
        // await acquisitionTypes.api().read();
        await epsgTypes.api().read({ once: true });

        this.productTypes = productTypes;
        this.dataVectorialTypes = dataVectorialTypes;
        this.dataImageryTypes = dataImageryTypes;
        this.dataSpecificationCartopTypes = dataSpecificationCartopTypes;
        this.dataSpecificationOthersTypes = dataSpecificationOthersTypes;
        this.dataSpecificationVersionTypes = dataSpecificationVersionTypes;
        this.dataStructureTypes = dataStructureTypes;
        this.epsgStore = epsgTypes;
        this.ortoRadiometricTypes = ortoRadiometricTypes;
      } catch (e) {
        console.log("Error gettings types: ");
      }
    }
  },

  computed: {
    vectorial: function () {
      return this.record.request.vectorial;
    },

    product_type: function () {
      return this.record.request.product_type;
    },

    cartography: function () {
      return this.record.cartography ? this.record.cartography : {};
    },

    areaSuffix: function () {
      const carto = this.cartography;

      return carto.area ? "ha" : "Por definir";
    },

    perimeter: function () {
      const carto = this.cartography;

      return carto.perimeter ? carto.perimeter + " km" : "Por definir";
    },

    epsg: function () {
      const store = this.epsgStore;

      const carto = this.cartography;

      if (!store) {
        return "";
      }

      const epsgCode = carto.espg;

      const records = store.query().where("code", carto.epsg).get();

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    data_specification: function () {
      const storeCartop = this.dataSpecificationCartopTypes;
      const storeOthers = this.dataSpecificationOthersTypes;

      const carto = this.cartography;
      const vectorial = !!this.record.request.vectorial;

      if (!storeCartop) {
        return "";
      }

      if (!storeOthers) {
        return "";
      }

      let records = storeCartop
        .query()
        .where("code", carto.data_specification)
        .get();

      if (!records.length) {
        records = storeOthers
          .query()
          .where("code", carto.data_specification)
          .get();
      }

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    data_specification_version: function () {
      const store = this.dataSpecificationVersionTypes;

      const carto = this.cartography;
      const version = carto.data_specification_version;

      if (!store) {
        return "";
      }

      let records = store.query().where("code", version).get();

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    data_type: function () {
      const store1 = this.dataVectorialTypes;
      const store2 = this.dataImageryTypes;

      const carto = this.cartography;

      if (!store1) {
        return "";
      }

      if (!store2) {
        return "";
      }

      let records = store1.query().where("code", carto.data_type).get();

      if (!records.length) {
        records = store2.query().where("code", carto.data_type).get();
      }

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    data_structure: function () {
      const store = this.dataStructureTypes;

      const carto = this.cartography;

      if (!store) {
        return "";
      }

      if (!this.vectorial) {
        return "";
      }

      const records = store.query().where("code", carto.data_structure).get();

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    product_type_description: function () {
      const store = this.productTypes;

      const type = this.record.request.product_type;

      if (!store) {
        return "";
      }

      if (!type) {
        return "";
      }

      const records = store.query().where("code", type).get();

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    orto_radiometry: function () {
      const store = this.ortoRadiometricTypes;

      const carto = this.cartography;

      if (!store) {
        return "";
      }

      if (this.vectorial) {
        return "";
      }

      const records = store.query().where("code", carto.orto_radiometric).get();

      const record = records.length ? records[0] : null;

      return record ? record.description : "";
    },

    number_sheets: function () {
      return this.cartography.number_sheets;
    },

    work_area_recovered: function () {
      return this.cartography.work_area_recovered
        ? this.$t("Sim")
        : this.$t("A recuperar...");
    },
  },
};
</script>