<template>
  <v-row class="my-8" justify="center" align="center">
    <client-only>
      <v-col :sm="12" :md="12" :lg="12" class="d-flex justify-center">
        <MultiStepForm
          ref="multiform"
          :title="$t('Requerimento para Homologação de Cartografia')"
          style="max-width: 800px"
          :record="record"
          :headers="headers"
          :fields.sync="columns"
          @finish="onFinish"
        ></MultiStepForm>
      </v-col>

      <v-dialog v-model="dialog" persistent max-width="350">
        <v-card>
          <v-card-title class="headline">{{
            $t("Finish Registration")
          }}</v-card-title>

          <v-card-text class="body-1">
            <p>
              Dentro de segundos será iniciado o download do formulário em
              formato pdf. Guarde e assine digitalmente este documento pois será
              essencial para a validação do requerimento.
            </p>
            <p>
              No caso da impossibilidade de assinar digitalmente, imprima o
              formulário e assine o documento tal como no cartão de cidadão.
            </p>
            <p>
              Ao terminar o registo, será redirecionado para a página de perfil
              do requerimento onde poderá submeter o formulário assinado.
            </p>
          </v-card-text>

          <v-card-actions>
            <v-btn color="grey darken-1" text @click="onDialogClose()">{{
              $t("Back")
            }}</v-btn>

            <v-spacer></v-spacer>

            <!-- <input
              type="file"
              accept=".pdf"
              ref="file"
              style="display: none"
              v-on:change="handleUpload()"
            /> -->
            <v-btn color="primary" text @click="onSubmitForm">{{
              $t("Finish")
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog2" persistent max-width="350">
        <v-card>
          <v-card-title v-if="error || !signed" class="headline">{{
            $t("Success")
          }}</v-card-title>
          <v-card-title v-else class="headline">{{
            $t("Success")
          }}</v-card-title>

          <v-card-text v-if="error">{{
            $t(
              "The pdf provided does not contain a valid signature. Please, correct the signature and repeat the process."
            )
          }}</v-card-text>
          <v-card-text v-else-if="signed">
            <p>{{ $t("Document signed digitally by:") }}</p>
            <ul>
              <li>
                <b>{{ signerName }}</b>
              </li>
            </ul>
            <br />
            <p>
              {{
                $t(
                  "The submitted files will be evaluated by our staff. You will receive an email with further instructions."
                )
              }}
            </p>
          </v-card-text>

          <v-card-text v-else>
            <p>
              {{
                $t(
                  "The uploaded document does not contain a valid digital signature."
                )
              }}
              {{
                $t(
                  "The submitted files will be evaluated by our staff. You will receive an email with further instructions."
                )
              }}
            </p>
          </v-card-text>

          <v-card-actions>
            <v-btn color="grey darken-1" text @click="onCloseDialog2">
              <div v-if="error">{{ $t("Back") }}</div>
              <div v-else>{{ $t("Finish") }}</div>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </client-only>
  </v-row>
</template>

<script>
import MultiStepForm from "~/components/forms/multistepform.vue";
import Textfield from "@/components/forms/fields/text.vue";
import Numberfield from "@/components/forms/fields/number.vue";
import Chipfield from "@/components/forms/fields/chip.vue";
import Textareafield from "@/components/forms/fields/textarea.vue";
import Datefield from "@/components/forms/fields/date.vue";
import Selectfield from "@/components/forms/fields/select.vue";
import Filefield from "@/components/forms/fields/file.vue";
import Switchfield from "@/components/forms/fields/switch.vue";
import Completionfield from "@/components/forms/fields/completion.vue";
import Compositefield from "@/components/forms/fields/composite.vue";
import Arrayfield from "@/layouts/client/dgt/pdh/custom/arrayfield.vue";
import Searchfield from "@/components/forms/fields/search.vue";
import RemoteSelectfield from "@/components/forms/fields/remotecombobox.vue";

export default {
  name: "RequestHomologation",

  components: {
    MultiStepForm,
    Textfield,
    Numberfield,
    Chipfield,
    Textareafield,
    Datefield,
    Filefield,
    Selectfield,
    Completionfield,
    Compositefield,
    Arrayfield,
    Searchfield,
    RemoteSelectfield,
  },

  props: {
    producers: {
      type: Array,
      default: function () {
        return [
          // { id: 201, name: "Produtor Teste" }
        ];
      },
    },
  },

  data() {
    return {
      stores: {},
      signerName: "",
      signed: false,

      error: false,
      alert: false,
      dialog: false,
      dialog2: false,

      record: {
        name: null,
        county: [],
        vectorial: true,
        product_type: null,
        has_themes: false,
        purpose: null,
        is_collective: false,
        tech_name: null,
        producers: this.producers,
        supervisor_entity: null,
        supervisor_name: null,
        supervisor_order: null,
        supervisor_certificate: null,
        supervisor_validaty: null,
        acquisition_type: null,
        acquisition_type_custom: null,
        epsg: 1,
        data_type: null,
        data_type_custom: null,
        data_specification: null,
        data_specification_custom: null,
        data_structure: null,
        number_sheets: 0,
        spatial_resolution: null,
        bands_number: null,
        orto_resolution: null,
        orto_radiometric: null,
        orto_radiometric_custom: null,
        orto_radiometric_resolution: null,
        orto_number: null,
        dimension_x: null,
        dimension_y: null,
        flight_date: null,
        conclusion_date: null,
        supervisory_date: null,
        accepted_date: null,
        planimetric_error: 1.5,
        planimetric_percent: {
          planimetric_point_percent: 90,
          planimetric_deviation: 2.3,
        },
        // planimetric_point_percent: 90,
        // planimetric_deviation: 2.3,
        altimetric_error: 1.7,
        altimetric_percent: {
          altimetric_point_percent: 90,
          altimetric_deviation: 2.75,
        },
        // altimetric_point_percent: 90,
        // altimetric_deviation: 2.75,
        semantic_completude: 5,
        semantic_classification: 5,
        max_semantic_incoherent: 0,
        max_semantic_duplicates: 0,
        max_discontinuity_number: 0,
        max_discontinuity_sheets: 0,
        pontual_elements: 0,
        linear_elements: 0,
        is_digital_terrain: true,
        is_digital_surface: false,
        model_resolution: 10.0,
        altimetric_model_error: 3.0,
        model_band: 1000.0,
        observations: null,
        applicant_is_owner: true,
      },

      defaultPlanimetric: {
        planimetric_error: 1.5,
        // planimetric_point_percent: 90,
        planimetric_deviation: 2.3,
      },

      defaultAltimetric: {
        altimetric_error: 1.7,
        // altimetric_point_percent: 90,
        altimetric_deviation: 2.75,
      },

      defaultCompletude: 5,

      headers: [
        this.$t("Identificação"),
        this.$t("Entidades"),
        this.$t("Owner"),
        this.$t("Caracterização"),
        this.$t("Caracterização (2)"),
        this.$t("Exatidão"),
        this.$t("Observações"),
      ],

      columns: [
        [
          {
            cmp: "title",
            text: this.$t("Elementos Identificadores"),
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Designação da Cartografia a Homologar"),
            // hint: this.$t("Nome"),
            explain: "new-homologation-1",
            value: "name",
            required: true,
          },
          {
            cmp: Chipfield,
            text: this.$t(
              "Concelho ou Concelhos que Incluem a Área Cartografada"
            ),
            label: "Digite o nome de um ou mais concelhos (mín. 4 caracteres)",
            explain: "new-homologation-2",
            value: "county",
            required: true,
            store: "CAOP",
            storeGetter: "all",
            itemText: "concelho",
            itemValue: "concelho",
          },
          {
            cmp: Selectfield,
            text: this.$t("Tipo de Cartografia"),
            explain: "new-homologation-3",
            value: "vectorial",
            required: true,
            items: [
              { text: this.$t("Vectorial"), value: true },
              { text: this.$t("Imagem"), value: false },
            ],
            cols: 6,
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Tipo do Produto"),
            explain: "new-homologation-4",
            value: "product_type",
            required: true,
            store: "ProductTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: true,
            },
            cols: 6,
          },

          {
            cmp: Selectfield,
            text: this.$t("Temas Específicos"),
            explain: "new-homologation-77",
            value: "has_themes",
            required: true,
            items: [
              { text: "Sim", value: true },
              { text: "Não", value: false },
            ],
            itemText: "text",
            itemValue: "value",
            condition: {
              prop: "vectorial",
              value: true,
            },
            cols: 6,
          },

          {
            cmp: RemoteSelectfield,
            text: this.$t("Finalidade"),
            explain: "new-homologation-5",
            value: "purpose",
            required: true,
            store: "PurposeVectorialTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            cols: 6,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Finalidade"),
            explain: "new-homologation-6",
            value: "purpose",
            required: true,
            store: "PurposeImageryTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            cols: 6,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Searchfield,
            text: this.$t("Nº do Processo Anteriormente Não-Homologado"),
            explain: "new-homologation-7",
            label: this.$t(
              "Digite a designação da cartografia anteriormente não-homologada"
            ),
            value: "related_with",
            itemText: "name",
            itemValue: "id",
            store: "DiscountRequests",
            storeRead: "read",
            storeGetter: "all",
            outlined: true,
            dense: true,
            hideDetails: true,
            returnObject: false,
            keepOnBlur: true,
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Entidades Envolvidas"),
            ignore: true,
          },
          {
            cmp: Switchfield,
            text: this.$t("Consortium"),
            explain: "new-homologation-8",
            value: "is_collective",
            values: [true, false],
          },
          {
            cmp: Textfield,
            text: this.$t("Name"),
            explain: "new-homologation-9",
            value: "collective_name",
            required: true,
            defaultValue: false,
            condition: {
              prop: "is_collective",
              value: true,
            },
          },
          {
            cmp: Searchfield,
            text: this.$t("Produtor"),
            label: "Digite o nome do produtor (mín. 4 caracteres)",
            noDataText: "Produtor não encontrado",
            explain: "new-homologation-10",
            value: "producers",
            required: true,
            itemText: "name",
            itemValue: "id",
            store: "OfficialProducers",
            storeRead: "read",
            storeGetter: "all",
            outlined: true,
            dense: true,
            hideDetails: true,
            asArray: true,
            condition: {
              prop: "is_collective",
              value: false,
            },
          },
          {
            cmp: Arrayfield,
            text: this.$t("Lista de Entidades Produtoras"),
            explain: "new-homologation-11",
            value: "producers",
            required: true,
            emit: "producerid",
            headers: [
              {
                text: "Name",
                value: "name",
              },
              {
                text: "Remover",
                renderer: {
                  type: "action",
                  icon: "mdi-minus",
                  event: "remove",
                },
              },
            ],
            condition: {
              prop: "is_collective",
              value: true,
            },
          },
          {
            cmp: "title",
            text: this.$t("Detalhes do Técnico Responsável"),
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Nome do técnico responsável pela produção"),
            explain: "new-homologation-12",
            value: "tech_name",
            required: true,
          },
          // {
          //   cmp: Selectfield,
          //   text: this.$t("Entidade à qual pertence"),
          //   explain: "new-homologation-13",
          //   value: "tech_entity",
          //   required: true,
          //   items: this.producers,
          //   itemText: "name",
          //   itemValue: "id",
          // },
          {
            cmp: Selectfield,
            text: this.$t("Ordem profissional do técnico responsável"),
            explain: "new-homologation-14",
            value: "tech_professional_order",
            required: true,
            items: [
              { description: "Ordem dos Engenheiros" },
              { description: "Ordem dos Engenheiros Técnicos" },
            ],
            itemText: "description",
            itemValue: "description",
          },
          {
            cmp: Textfield,
            text: this.$t("Número da cédula profissional do responsável"),
            explain: "new-homologation-15",
            value: "tech_certificate",
            validation: ["integer"],
            required: true,
            cols: 6,
          },
          {
            cmp: Datefield,
            text: this.$t("Validade da cédula profissional do responsável"),
            explain: "new-homologation-16",
            value: "tech_certificate_validaty",
            required: true,
            cols: 6,
            noIndent: true,
          },
          {
            text: this.$t("Detalhes da Fiscalização (se ocorreu)"),
            cmp: "title",
            ignore: true,
          },
          {
            cmp: Chipfield,
            text: this.$t("Nome da entidade responsável"),
            label:
              "Digite o nome da entidade, se aplicável (mín. 4 caracteres)",
            explain: "new-homologation-17",
            value: "supervisor_entity",
            clearable: true,
            class: "mb-6",
            itemText: "name",
            itemValue: "id",
            store: "OfficialSupervisors",
            storeRead: "read",
            storeGetter: "all",
            outlined: true,
            asArray: false,
            multiple: false,
            returnObject: true,
            validation: [this.validateSupervisor],
          },
          // {
          //   cmp: Selectfield,
          //   text: this.$t("Nome da entidade responsável"),
          //   explain: "new-homologation-17",
          //   value: "supervisor_entity",
          //   clearable: true,
          //   items: this.producers,
          //   itemText: "name",
          //   itemValue: "id",
          // },
          {
            cmp: Textfield,
            text: this.$t("Nome do Responsável de Fiscalização"),
            explain: "new-homologation-18",
            value: "supervisor_name",
            required: true,
            condition: {
              exists: "supervisor_entity",
            },
          },
          {
            cmp: Selectfield,
            text: this.$t("Ordem Profissional do Responsável"),
            explain: "new-homologation-19",
            value: "supervisor_order",
            required: true,
            condition: {
              exists: "supervisor_entity",
            },
            items: [
              { description: "Ordem dos Engenheiros" },
              { description: "Ordem dos Engenheiros Técnicos" },
            ],
            itemText: "description",
            itemValue: "description",
          },
          {
            cmp: Textfield,
            text: this.$t("Número da Cédula Profissional do Responsável"),
            explain: "new-homologation-20",
            value: "supervisor_certificate",
            validation: ["integer"],
            required: true,
            condition: {
              exists: "supervisor_entity",
            },
            cols: 6,
          },
          {
            cmp: Datefield,
            text: this.$t("Validade da Cédula Profissional do Responsável"),
            explain: "new-homologation-21",
            value: "supervisor_validaty",
            required: true,
            condition: {
              exists: "supervisor_entity",
            },
            cols: 6,
          },
          {
            cmp: Datefield,
            text: this.$t("Data de aceitação pela fiscalização (se ocorreu)"),
            explain: "new-homologation-22",
            value: "supervisory_date",
            max: new Date().toISOString(),
            condition: {
              exists: "supervisor_entity",
            },
            cols: 6,
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Identificação do Proprietário"),
            ignore: true,
          },
          {
            cmp: Selectfield,
            text: this.$t("Requerente é o Proprietário da Cartografia?"),
            explain: "new-homologation-69",
            value: "applicant_is_owner",
            required: true,
            items: [
              { text: this.$t("Yes"), value: true },
              { text: this.$t("No"), value: false },
            ],
          },
          {
            cmp: Textfield,
            text: this.$t("Owner Name"),
            explain: "new-homologation-70",
            value: "owner_name",
            required: true,
            condition: {
              prop: "applicant_is_owner",
              value: false,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("Email"),
            explain: "new-homologation-71",
            value: "owner_email",
            validation: ["email"],
            required: true,
            condition: {
              prop: "applicant_is_owner",
              value: false,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("Phone"),
            explain: "new-homologation-72",
            value: "owner_phone",
            mask: "#########",
            required: true,
            condition: {
              prop: "applicant_is_owner",
              value: false,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("VAT"),
            explain: "new-homologation-73",
            value: "owner_vat",
            mask: "#########",
            required: true,
            condition: {
              prop: "applicant_is_owner",
              value: false,
            },
            cols: 6,
          },
          {
            cmp: Textfield,
            text: this.$t("Address"),
            explain: "new-homologation-74",
            value: "owner_address",
            required: true,
            condition: {
              prop: "applicant_is_owner",
              value: false,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("Locality"),
            explain: "new-homologation-75",
            value: "owner_locality",
            required: true,
            condition: {
              prop: "applicant_is_owner",
              value: false,
            },
            cols: 6,
          },
          {
            cmp: Textfield,
            text: this.$t("Zip Code"),
            explain: "new-homologation-76",
            value: "owner_zipcode",
            mask: "####-###",
            required: true,
            condition: {
              prop: "applicant_is_owner",
              value: false,
            },
            cols: 6,
          },
        ],
        [
          {
            text: this.$t("Caracterização do Produto"),
            cmp: "title",
            ignore: true,
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Tipo de Levantamento"),
            explain: "new-homologation-23",
            value: "acquisition_type",
            required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
            store: "AcquisitionTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
          },
          {
            cmp: Textfield,
            text: this.$t("Tipo de Levantamento (Outro)"),
            explain: "new-homologation-24",
            value: "acquisition_type_custom",
            required: true,
            condition: {
              prop: "acquisition_type",
              value: 4,
            },
          },

          {
            cmp: RemoteSelectfield,
            text: this.$t("Georeference System"),
            explain: "new-homologation-25",
            value: "epsg",
            required: true,
            store: "EpsgTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
          },

          {
            cmp: RemoteSelectfield,
            text: this.$t("Formato Dados/Versão"),
            explain: "new-homologation-26",
            value: "data_type",
            required: true,
            store: "DataVectorialTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Formato Dados/Versão"),
            explain: "new-homologation-27",
            value: "data_type",
            required: true,
            store: "DataImageryTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("Formato Dados/Versão (Outro)"),
            explain: "new-homologation-28",
            value: "data_type_custom",
            required: true,
            condition: {
              prop: "data_type",
              value: 10, // CartTop
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Especificação Técnica"),
            explain: "new-homologation-29",
            value: "data_specification",
            required: true,
            store: "DataSpecificationCartopTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: true,
            },
            condition2: {
              prop: "product_type",
              value: 1,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Especificação Técnica"),
            explain: "new-homologation-30",
            value: "data_specification",
            required: true,
            store: "DataSpecificationOthersTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: true,
            },
            condition2: {
              prop: "product_type",
              noteq: true,
              value: 1,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Especificação Técnica"),
            explain: "new-homologation-30",
            value: "data_specification",
            required: true,
            store: "DataSpecificationTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("Especificação Técnica (Outro)"),
            explain: "new-homologation-31",
            value: "data_specification_custom",
            required: true,
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: false,
            },
            condition2: {
              prop: "data_specification",
              value: 7,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Versão da Especificação Técnica"),
            explain: "new-homologation-78",
            value: "data_specification_version",
            required: true,
            store: "DataSpecificationVersionTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: true,
            },
            condition2: {
              prop: "product_type",
              value: 1,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Versão da Especificação Técnica"),
            explain: "new-homologation-78",
            value: "data_specification_version",
            required: true,
            store: "DataSpecificationVersionTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: false,
            },
            condition2: {
              prop: "data_specification",
              value: 1,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Versão da Especificação Técnica"),
            explain: "new-homologation-78",
            value: "data_specification_version",
            required: true,
            store: "DataSpecificationVersionTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: false,
            },
            condition2: {
              prop: "data_specification",
              value: 2,
            },
          },
          {
            cmp: RemoteSelectfield,
            text: this.$t("Estrutura de dados"),
            explain: "new-homologation-32",
            value: "data_structure",
            store: "DataStructureTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",
            condition: {
              prop: "vectorial",
              value: true,
            },
            condition2: {
              prop: "product_type",
              noteq: true,
              value: 1,
            },
          },

          {
            cmp: Completionfield,
            explain: "new-homologation-33",
            prefix: this.$t(
              "Resolução espacial da fotografia aérea ou das imagens de satélite:"
            ),
            suffix: this.$t("metros"),
            valueType: "integer",
            validation: ["float"],
            isNumber: true,
            system: "pt-PT",
            value: "spatial_resolution",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-34",
            prefix: this.$t("Número de bandas espectrais"),
            suffix: this.$t(""),
            valueType: "integer",
            validation: ["integer"],
            value: "bands_number",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
        ],

        [
          {
            text: this.$t("Detalhes dos Ortofotos"),
            cmp: "title",
            ignore: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          // {
          //   text: this.$t("Número de folhas"),
          //   value: "number_sheets",
          //   valueType: "integer",
          //   condition: {
          //     prop: "vectorial",
          //     value: false
          //   }
          // },
          {
            cmp: Completionfield,
            explain: "new-homologation-35",
            prefix: this.$t("Número de ortofotos"),
            suffix: this.$t(""),
            validation: ["integer"],
            value: "orto_number",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },

          {
            cmp: RemoteSelectfield,
            text: this.$t("Composição espectral dos ortofotos"),
            explain: "new-homologation-36",
            value: "orto_radiometric",
            required: true,
            store: "OrtoRadiometricTypes",
            storeGetter: "all",
            itemText: "description",
            itemValue: "code",

            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("Composição espectral dos ortofotos (Outra)"),
            explain: "new-homologation-36",
            value: "orto_radiometric_custom",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
            condition2: {
              prop: "orto_radiometric",
              value: 4,
            },
          },
          {
            cmp: Completionfield,
            prefix: this.$t("Resolução radiométrica:"),
            suffix: this.$t("bits"),
            value: "orto_radiometric_resolution",
            validation: ["number"],
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-37",
            prefix: this.$t("Resolução espacial dos ortofotos:"),
            suffix: this.$t("meters"),
            validation: ["float"],
            isNumber: true,
            system: "pt-PT",
            value: "orto_resolution",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },

          // {
          //   cmp: Compositefield,
          //   suffixes: ["", ""],
          //   prefixes: [
          //     this.$t("Dimensão linear no terreno de cada ortofoto em M"),
          //     " e em P ",
          //   ],
          //   values: ["dimension_x", "dimension_y"],
          //   value: "dimension_x",
          //   valueType: "float",
          //   required: true,
          //   condition: {
          //     prop: "vectorial",
          //     value: false,
          //   },
          // },
          {
            cmp: Textfield,
            text: this.$t("Dimensão linear no terreno de cada ortofoto em M"),
            explain: "new-homologation-38",
            value: "dimension_x",
            valueType: "integer",
            validation: ["number"],
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
            cols: 6,
          },
          {
            cmp: Textfield,
            text: this.$t("Dimensão linear no terreno de cada ortofoto em P"),
            explain: "new-homologation-39",
            value: "dimension_y",
            validation: ["number"],
            valueType: "integer",
            required: true,
            // ignore: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
            cols: 6,
          },
          {
            text: this.$t("Datas Relevantes"),
            cmp: "title",
            ignore: true,
          },
          {
            cmp: Datefield,
            text: this.$t("Data de aquisição das imagens"),
            explain: "new-homologation-40",
            value: "flight_date",
            max: new Date().toISOString(),
            required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
            condition2: {
              prop: "acquisition_type",
              value: 2,
            },
          },
          {
            cmp: Datefield,
            text: this.$t("Data de aquisição das imagens"),
            explain: "new-homologation-40",
            value: "flight_date",
            max: new Date().toISOString(),
            condition: {
              prop: "vectorial",
              value: true,
            },
            condition2: {
              prop: "acquisition_type",
              value: 4,
            },
          },
          {
            cmp: Datefield,
            text: this.$t("Data de voo"),
            explain: "new-homologation-40",
            value: "flight_date",
            max: new Date().toISOString(),
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Datefield,
            text: this.$t("Data de conclusão dos trabalhos de campo"),
            explain: "new-homologation-41",
            value: "conclusion_date",
            max: new Date().toISOString(),
            required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Datefield,
            text: this.$t(
              "Data de aceitação definitiva pela entidade proprietária (se ocorreu)"
            ),
            explain: "new-homologation-42",
            value: "accepted_date",
            max: new Date().toISOString(),
          },
        ],
        [
          {
            text: this.$t("Exatidão Planimétrica"),
            cmp: "title",
            ignore: true,
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-43",
            prefix: this.$t("Erro médio quadrático"),
            suffix: this.$t("metros"),
            isNumber: true,
            system: "pt-PT",
            valueType: "float",
            validation: ["float", this.validatePlanimetricEMQ],
            value: "planimetric_error",
            required: true,
          },
          {
            cmp: Compositefield,
            explain: "new-homologation-44",
            prefixes: [this.$t("90% dos pontos com desvio menor do que")],
            suffixes: ["metros"],
            valueType: "float",
            isNumber: true,
            system: "pt-PT",
            validation: ["float", this.validatePlanimetric],
            value: "planimetric_percent",
            values: ["planimetric_deviation"],
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("com desvio menor do que"),
            explain: "new-homologation-45",
            value: "planimetric_deviation",
            valueType: "float",
            required: true,
            ignore: true,
          },
          // ---------------
          {
            text: this.$t("Exatidão Altimétrica"),
            cmp: "title",
            explain: "new-homologation-46",
            ignore: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-47",
            prefix: this.$t("Erro médio quadrático"),
            suffix: this.$t("metros"),
            value: "altimetric_error",
            valueType: "float",
            validation: ["float", this.validateAltimetricEMQ],
            isNumber: true,
            system: "pt-PT",
            required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Compositefield,
            explain: "new-homologation-48",
            prefixes: [this.$t("90% dos pontos com desvio menor do que")],
            suffixes: ["metros"],
            value: "altimetric_percent",
            values: ["altimetric_deviation"],
            valueType: "float",
            isNumber: true,
            system: "pt-PT",
            validation: ["float", this.validateAltimetric],
            required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Textfield,
            text: this.$t("com desvio menor do que"),
            explain: "new-homologation-49",
            value: "altimetric_deviation",
            valueType: "float",
            required: true,
            ignore: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          // ---------------

          {
            text: this.$t("Completude/Exatidão Temática"),
            explain: "new-homologation-50",
            cmp: "title",
            ignore: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-51",
            prefix: this.$t(
              "Completude (% admissível de erros de omissão e comissão)"
            ),
            suffix: "%",
            value: "semantic_completude",
            valueType: "float",
            validation: ["float", this.validateCompletude],
            isNumber: true,
            system: "pt-PT",
            required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-52",
            prefix: this.$t(
              "Classificação (% admissível de erros de classificação)"
            ),
            suffix: "%",
            value: "semantic_classification",
            valueType: "float",
            validation: ["float", this.validateCompletude],
            isNumber: true,
            system: "pt-PT",
            required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-53",
            prefix: this.$t(
              "Nº máximo de elementos que não respeitam a estrutura de dados na área avaliada corresponde a 0"
            ),
            hideValue: true,
            value: "max_semantic_incoherent",
            valueType: "float",
            validation: ["integer"],
            // required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-54",
            prefix: this.$t(
              "Nº máximo de elementos duplicados na área avaliada corresponde a 0"
            ),
            hideValue: true,
            value: "max_semantic_duplicates",
            valueType: "float",
            validation: ["integer"],
            // required: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },

          // ---------------
          {
            text: this.$t("Descontinuidades Lineares"),
            explain: "new-homologation-55",
            cmp: "title",
            ignore: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-56",
            prefix: this.$t("Nº máximo de descontinuidades corresponde a 0"),
            hideValue: true,
            value: "max_discontinuity_number",
            valueType: "float",
            validation: ["integer"],
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-57",
            prefix: this.$t(
              "Nº máximo de descontinuidades entre folhas (se aplicável) corresponde a 0"
            ),
            hideValue: true,
            validation: ["integer"],
            valueType: "float",
            value: "max_discontinuity_sheets",
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          // ------------
          {
            text: this.$t("Incoerências 3D"),
            explain: "new-homologation-58",
            cmp: "title",
            ignore: true,
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-59",
            prefix: this.$t("Nº de elementos pontuais corresponde a 0"),
            hideValue: true,
            valueType: "float",
            value: "pontual_elements",
            validation: ["integer"],
            condition: {
              prop: "vectorial",
              value: true,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-60",
            prefix: this.$t("Nº de elementos lineares corresponde a 0"),
            hideValue: true,
            valueType: "float",
            value: "linear_elements",
            validation: ["integer"],
            condition: {
              prop: "vectorial",
              value: true,
            },
          },

          // IMAGERY -------------------
          {
            text: this.$t("Dados Altimétricos"),
            explain: "new-homologation-61",
            cmp: "title",
            ignore: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Selectfield,
            text: this.$t("Modelo Digital"),
            explain: "new-homologation-62",
            value: "is_digital_terrain",
            // type: "switch",
            // values: [true, false],
            items: [
              { text: this.$t("Terrain"), value: true },
              { text: this.$t("Surface"), value: false },
            ],
            condition: {
              prop: "vectorial",
              value: false,
            },
            cols: 6,
          },
          // {
          //   cmp: Switchfield,
          //   explain: "new-homologation-63",
          //   text: this.$t("Modelo digital de superfície"),
          //   value: "is_digital_surface",
          //   values: [true, false],

          //   condition: {
          //     prop: "vectorial",
          //     value: false,
          //   },
          // },
          {
            cmp: Completionfield,
            explain: "new-homologation-64",
            prefix: this.$t("Resolução espacial do modelo"),
            value: "model_resolution",
            suffix: this.$t("meters"),
            // valueType: "float",
            // validation:['number'],
            validation: ["float"],
            isNumber: true,
            system: "pt-PT",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-65",
            prefix: this.$t("Exatidão altimétrica do modelo (EMQ)"),
            suffix: this.$t("meters"),
            value: "altimetric_model_error",
            validation: ["float"],
            isNumber: true,
            system: "pt-PT",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
          {
            cmp: Completionfield,
            explain: "new-homologation-66",
            prefix: this.$t("Faixa envolvente para geração do modelo"),
            suffix: this.$t("meters"),
            valueType: "float",
            validation: ["float"],
            isNumber: true,
            system: "pt-PT",
            value: "model_band",
            required: true,
            condition: {
              prop: "vectorial",
              value: false,
            },
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Observações"),
            ignore: true,
          },
          {
            cmp: Textareafield,
            text: "Observações relevantes para o requerimento de homologação",
            isObservationsField: true,
            required: false,
            validation: [],
            // hint: this.$t("Observações"),
            explain: "new-homologation-62",
            value: "observations",
            limit: 1000,
          },
        ],
      ],
    };
  },

  created: async function () {
    // this.record = {
    //   name: "Cartografia de Teste",
    //   county: ["Guarda"],
    //   vectorial: true,
    //   is_collective: false,
    //   product_type: 1,
    //   purpose: 1,
    //   has_themes: true,
    //   producers: this.producers,
    //   tech_name: "Técnico Teste",
    //   tech_entity: 201,
    //   tech_certificate: "12121212",
    //   tech_certificate_validaty: "21-05-2031",
    //   tech_professional_order: "Ordem dos Engenheiros",
    //   supervisor_entity: null,
    //   supervisor_name: null,
    //   supervisor_order: null,
    //   supervisor_certificate: null,
    //   supervisor_validaty: null,
    //   acquisition_type: 1,
    //   acquisition_type_custom: null,
    //   epsg: 1,
    //   data_type: 1,
    //   data_type_custom: null,
    //   data_specification: 1,
    //   data_specification_custom: null,
    //   data_specification_version: 2,
    //   data_structure: 1,
    //   number_sheets: 1,
    //   spatial_resolution: 2,
    //   bands_number: 3,
    //   orto_resolution: 4,
    //   orto_radiometric: 5,
    //   orto_radiometric_custom: null,
    //   orto_number: 3,
    //   dimension_x: 2,
    //   dimension_y: 2,
    //   flight_date: "21-05-211",
    //   conclusion_date: null,
    //   supervisory_date: null,
    //   accepted_date: null,
    //   planimetric_error: 1.5,
    //   planimetric_percent: {
    //     planimetric_point_percent: 90,
    //     planimetric_deviation: 2.3,
    //   },
    //   // planimetric_point_percent: 90,
    //   // planimetric_deviation: 2.3,
    //   altimetric_error: 1.7,
    //   altimetric_percent: {
    //     altimetric_point_percent: 90,
    //     altimetric_deviation: 2.75,
    //   },
    //   // altimetric_point_percent: 90,
    //   // altimetric_deviation: 2.75,
    //   semantic_completude: 5,
    //   semantic_classification: 5,
    //   max_semantic_incoherent: 0,
    //   max_semantic_duplicates: 0,
    //   max_discontinuity_number: 0,
    //   max_discontinuity_sheets: 0,
    //   pontual_elements: 0,
    //   linear_elements: 0,
    //   is_digital_terrain: false,
    //   is_digital_surface: false,
    //   model_resolution: 10.0,
    //   altimetric_model_error: "EMQ 1.80; Desvio 3.0",
    //   model_band: 1000.0,
    //   observations: null,
    //   conclusion_date: "2020-3-4",
    //   applicant_is_owner: true,
    // };

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
        const dataSpecificationTypes = database.model("DataSpecificationTypes");
        const dataStructureTypes = database.model("DataStructureTypes");
        const purposeVectorialTypes = database.model("PurposeVectorialTypes");
        const purposeImageryTypes = database.model("PurposeImageryTypes");
        const ortoRadiometricTypes = database.model("OrtoRadiometricTypes");
        const acquisitionTypes = database.model("AcquisitionTypes");
        const epsgTypes = database.model("EpsgTypes");
        const discountRequests = database.model("DiscountRequests");

        await productTypes.api().read();
        await dataVectorialTypes.api().read();
        await dataImageryTypes.api().read();
        await dataSpecificationCartopTypes.api().read();
        await dataSpecificationOthersTypes.api().read();
        await dataSpecificationTypes.api().read();
        await dataSpecificationVersionTypes.api().read();
        await dataStructureTypes.api().read();
        await purposeVectorialTypes.api().read();
        await purposeImageryTypes.api().read();
        await ortoRadiometricTypes.api().read();
        await acquisitionTypes.api().read();
        await epsgTypes.api().read();

        this.stores = {
          productTypes: productTypes,
          dataVectorialTypes: dataVectorialTypes,
          dataImageryTypes: dataImageryTypes,
          dataSpecificationCartopTypes: dataSpecificationCartopTypes,
          dataSpecificationOthersTypes: dataSpecificationOthersTypes,
          dataSpecificationTypes: dataSpecificationTypes,
          dataSpecificationVersionTypes: dataSpecificationVersionTypes,
          dataStructureTypes: dataStructureTypes,
          purposeVectorialTypes: purposeVectorialTypes,
          purposeImageryTypes: purposeImageryTypes,
          ortoRadiometricTypes: ortoRadiometricTypes,
          acquisitionTypes: acquisitionTypes,
          epsgTypes: epsgTypes,
          discountRequests: discountRequests,
        };
      } catch (e) {
        console.log("Error gettings types: ");
      }
    }
  },

  methods: {
    validatePlanimetric: function (value) {
      const limit = this.defaultPlanimetric.planimetric_deviation;

      if (!limit) {
        return true;
      }

      if (typeof value === "string") {
        value = Number(value.replace(",", "."));
      }

      return (
        (value >= 0 && value <= limit) ||
        "Não são permitidos valores acima dos valores por defeito ou abaixo de 0"
      );
    },

    validatePlanimetricEMQ: function (value) {
      const limit = this.defaultPlanimetric.planimetric_error;

      if (!limit) {
        return true;
      }

      if (typeof value === "string") {
        value = Number(value.replace(",", "."));
      }

      return (
        (value >= 0 && value <= limit) ||
        "Não são permitidos valores acima dos valores por defeito ou abaixo de 0"
      );
    },

    validateAltimetric: function (value) {
      const limit = this.defaultAltimetric.altimetric_deviation;

      if (!limit) {
        return true;
      }

      if (typeof value === "string") {
        value = Number(value.replace(",", "."));
      }

      return (
        (value >= 0 && value <= limit) ||
        "Não são permitidos valores acima dos valores por defeito ou abaixo de 0"
      );
    },

    validateAltimetricEMQ: function (value) {
      const limit = this.defaultAltimetric.altimetric_error;

      if (!limit) {
        return true;
      }

      if (typeof value === "string") {
        value = Number(value.replace(",", "."));
      }

      return (
        (value >= 0 && value <= limit) ||
        "Não são permitidos valores acima dos valores por defeito ou abaixo de 0"
      );
    },

    validateCompletude: function (value) {
      const limit = this.defaultCompletude;

      if (!limit) {
        return true;
      }

      if (typeof value === "string") {
        value = Number(value.replace(",", "."));
      }

      return (
        (value <= limit && value >= 0) ||
        "Não são permitidos valores acima dos valores por defeito ou abaixo de 0"
      );
    },

    validateSupervisor: function (value) {
      if (!value) {
        return true;
      }

      const record = this.record;

      const producers = record.producers;

      const found = producers.find(function (producer) {
        return producer.id === value.id;
      });

      return (
        !found ||
        "Não é permitido selecionar uma entidade que tenha sido indicada como produtor"
      );
    },

    validateThemes: function (value, a, b) {
      const record = this.record;

      const hasThemes = record.has_themes;
      const hasObservations = !!value && value.length > 0;

      if (hasThemes) {
        return hasObservations || "Indique a designação dos temas específicos";
      } else {
        return true;
      }
    },

    isFloat: function (value) {
      return /^[0-9]+(\.[0-9]+)?$/.test(value);
    },

    toPtFloat: function (value) {
      const str = "" + value;

      return str.replace(".", ",");
    },

    resetFieldSuffixes: function () {
      // Form idx
      const idx = 5;

      // Fields
      const planimetricEMQ = this.columns[idx][1];
      const planimetricDev = this.columns[idx][2];

      const altimetricEMQ = this.columns[idx][5];
      const altimetricDev = this.columns[idx][6];

      const sematic = this.columns[idx][9];
      const classification = this.columns[idx][10];

      // Default values
      const defaultPlanimetric = this.defaultPlanimetric;
      const defaultAltimetric = this.defaultAltimetric;
      const defaultCompletude = this.defaultCompletude;

      // Reset the suffixes
      planimetricEMQ.suffix =
        "metros" +
        (defaultPlanimetric.planimetric_error
          ? " (max: " +
            this.toPtFloat(defaultPlanimetric.planimetric_error) +
            ")"
          : "");
      planimetricDev.suffixes[0] =
        "metros" +
        (defaultPlanimetric.planimetric_deviation
          ? " (max: " +
            this.toPtFloat(defaultPlanimetric.planimetric_deviation) +
            ")"
          : "");

      altimetricEMQ.suffix =
        "metros" +
        (defaultAltimetric.altimetric_error
          ? " (max: " + this.toPtFloat(defaultAltimetric.altimetric_error) + ")"
          : "");
      altimetricDev.suffixes[0] =
        "metros" +
        (defaultAltimetric.altimetric_deviation
          ? " (max: " +
            this.toPtFloat(defaultAltimetric.altimetric_deviation) +
            ")"
          : "");

      sematic.suffix =
        "%" +
        (defaultCompletude
          ? " (max: " + this.toPtFloat(defaultCompletude) + ")"
          : "");
      classification.suffix =
        "%" +
        (defaultCompletude
          ? " (max: " + this.toPtFloat(defaultCompletude) + ")"
          : "");
    },

    onDialogClose: function () {
      this.dialog = false;
    },

    onCloseDialog2: function () {
      this.dialog2 = false;

      if (!this.error) {
        this.$router.push("/homologation/list");
      } else {
        this.dialog = true;
      }
    },

    onSubmitForm: async function (event) {
      try {
        // const file = this.$refs.file.files[0];

        // const extension = file.type;

        // if (extension !== "application/pdf") {
        //   return;
        // }

        let record = this.$refs.multiform.getRecord();

        // const columns = this.columns.reduce(function (acc, val) {
        //   return acc.concat(val);
        // }, []);

        let formData = {}; //new FormData();

        const members = [];

        Object.keys(record).forEach(function (key) {
          if (record[key] !== undefined) {
            switch (key) {
              case "is_digital_surface":
                formData["is_digital_surface"] = !record.is_digital_terrain;
                break;

              case "supervisor_name":
              case "supervisor_order":
              case "supervisor_certificate":
              case "supervisor_validaty":
                break;
              case "supervisor_entity":
                if (record[key] && typeof record[key] === "object") {
                  const {
                    supervisor_name,
                    supervisor_order,
                    supervisor_certificate,
                    supervisor_validaty,
                    supervisor_entity,
                  } = record;

                  members.push({
                    supervisor: true,
                    producer_id: supervisor_entity.id,
                    name: supervisor_name,
                    certificate: supervisor_certificate,
                    certificate_validaty: supervisor_validaty,
                    professional_order: supervisor_order,
                  });
                }
                break;

              case "tech_entity":
              case "tech_certificate":
              case "tech_certificate_validaty":
              case "tech_professional_order":
                break;
              case "tech_name":
                const {
                  tech_name,
                  // tech_entity,
                  tech_certificate,
                  tech_certificate_validaty,
                  tech_professional_order,
                } = record;

                members.push({
                  supervisor: false,
                  producer_id: null, //tech_entity,
                  name: tech_name,
                  certificate: tech_certificate,
                  certificate_validaty: tech_certificate_validaty,
                  professional_order: tech_professional_order,
                });

                break;

              case "owner_email":
              case "owner_phone":
              case "owner_vat":
              case "owner_address":
              case "owner_locality":
              case "owner_zipcode":
                break;
              case "owner_name":
                const {
                  owner_name,
                  owner_email,
                  owner_phone,
                  owner_vat,
                  owner_address,
                  owner_locality,
                  owner_zipcode,
                } = record;

                formData["owner"] = {
                  name: owner_name,
                  email: owner_email,
                  phone: owner_phone,
                  vat: owner_vat,
                  address: owner_address,
                  locality: owner_locality,
                  zipcode: owner_zipcode,
                };
                break;

              case "producers":
                const producersArr = record[key];
                const supervisorEntity = record.supervisor_entity;

                const producers = producersArr.map(function (p) {
                  return { producer_id: p.id, supervisor: false };
                });

                // if (supervisorEntity) {
                //   const supIdx = producers.findIndex(function (r) {
                //     return r.producer_id === supervisorEntity.id;
                //   });

                //   if (supIdx === -1) {
                //     producers.push({ producer_id: supervisorEntity.id, supervisor: true });
                //   }
                // }

                formData["producers"] = JSON.stringify(producers); //.append("producers", JSON.stringify(producers));
                break;
              case "planimetric_percent":
                const planiPercent = record.planimetric_percent;

                formData["planimetric_point_percent"] =
                  planiPercent.planimetric_point_percent;
                formData["planimetric_deviation"] =
                  planiPercent.planimetric_deviation;
                break;

              case "altimetric_percent":
                const altiPercent = record.altimetric_percent;

                formData["altimetric_point_percent"] =
                  altiPercent.altimetric_point_percent;
                formData["altimetric_deviation"] =
                  altiPercent.altimetric_deviation;
                break;

              case "county":
                formData["county"] =
                  record.county && record.county.length
                    ? record.county.join(", ")
                    : "";
                break;

              default:
                formData[key] = record[key]; //.append(key, record[key]);
                break;
            }
          }
        });

        // formData.append("producerMembers", JSON.stringify(members));
        formData["producerMembers"] = JSON.stringify(members);

        // formData.append("form", file);

        // Request the end-point
        let res = await this.$axios.post(
          "/api/homologation/request/new",
          formData,
          { progress: true }
        );

        if (res.error) {
          throw res.error;
        }

        const data = res.data;

        const id = data[0].id;
        const email = data[0].email;

        this.dialog = false;

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          text:
            "<p>Requerimento de homologação de cartografia iniciado.</p><p>Em breve será notificado com a confirmação através do contacto: <ul><li>" +
            email +
            "</li></ul></p>" +
            "<p>Aceda ao perfil do requerimento para submeter o formulário assinado, a cartografia a homologar e completar dados essenciais à tramitação.</p>",
          icon: "mdi-check",
          color: "green",
          okText: "Sair",
          url: "/homologation/request-p/" + id,
        });
      } catch (e) {
        return;
      }
    },

    onDownload: function () {
      this.dialog = true;
    },

    onFinish: async function () {
      const record = this.record;

      const stores = this.stores;

      const producers = this.producers;

      const espgRecord = stores.epsgTypes.find(record.epsg);
      const related_with = stores.discountRequests.find(record.related_with);

      let supervisor_entity; //, tech_entity;

      /*tech_entity = producers.find(function (p) {
        return p.id === record.tech_entity;
      });*/

      if (record.supervisor_entity) {
        supervisor_entity = record.supervisor_entity;
        // = producers.find(function (p) {
        //   return p.id === record.supervisor_entity;
        // });
      }

      const planiPercent = record.planimetric_percent;
      const altiPercent = record.altimetric_percent;

      const recordCopy = {
        ...record,

        has_themes: record.has_themes ? "Sim" : "Não",

        county:
          record.county && record.county.length ? record.county.join(", ") : "",

        planimetric_point_percent: planiPercent.planimetric_point_percent,
        planimetric_deviation: planiPercent.planimetric_deviation,

        altimetric_point_percent: altiPercent.altimetric_point_percent,
        altimetric_deviation: altiPercent.altimetric_deviation,

        supervisor_entity: supervisor_entity ? supervisor_entity.name : null,
        // tech_entity: tech_entity ? tech_entity.name : null,

        digital_model: record.is_digital_terrain ? "Terreno" : "Superfície",
        // is_digital_terrain: record.is_digital_terrain ? "Sim" : "Não",
        related_with: related_with ? related_with.name : null,
        is_collective: record.is_collective ? "Sim" : "Não",
        epsg: espgRecord ? espgRecord.description : "",
      };

      const vectorial = !!record.vectorial;
      let dataSpecificationVersionRecord;

      if (vectorial) {
        const productTypeRecord = stores.productTypes.find(record.product_type);
        const dataTypeRecord = stores.dataVectorialTypes.find(record.data_type);
        let dataSpecRecord = stores.dataSpecificationCartopTypes.find(
          record.data_specification
        );

        if (!dataSpecRecord) {
          dataSpecRecord = stores.dataSpecificationOthersTypes.find(
            record.data_specification
          );
        }

        if (record.data_specification_version) {
          dataSpecificationVersionRecord = stores.dataSpecificationVersionTypes.find(
            record.data_specification_version
          );
        }

        const dataStructureRecord = stores.dataStructureTypes.find(
          record.data_structure
        );
        const purposeRecord = stores.purposeVectorialTypes.find(record.purpose);
        const acquisitionRecord = stores.acquisitionTypes.find(
          record.acquisition_type
        );

        recordCopy["product_type"] = productTypeRecord
          ? productTypeRecord.description
          : "";
        recordCopy["data_type"] = dataTypeRecord
          ? dataTypeRecord.description
          : "";
        recordCopy["data_specification"] = dataSpecRecord
          ? dataSpecRecord.description
          : "";
        recordCopy["data_structure"] = dataStructureRecord
          ? dataStructureRecord.description
          : "";
        recordCopy["purpose"] = purposeRecord ? purposeRecord.description : "";
        recordCopy["acquisition_type"] = acquisitionRecord
          ? acquisitionRecord.description
          : "";

        recordCopy[
          "data_specification_version"
        ] = dataSpecificationVersionRecord
          ? dataSpecificationVersionRecord.description
          : null;
      } else {
        const dataTypeRecord = stores.dataImageryTypes.find(record.data_type);
        const purposeRecord = stores.purposeImageryTypes.find(record.purpose);
        const ortoRadiometricRecord = stores.ortoRadiometricTypes.find(
          record.orto_radiometric
        );
        const dataSpecRecord = stores.dataSpecificationTypes.find(
          record.data_specification
        );

        if (record.data_specification_version) {
          dataSpecificationVersionRecord = stores.dataSpecificationVersionTypes.find(
            record.data_specification_version
          );
        }

        recordCopy["data_type"] = dataTypeRecord
          ? dataTypeRecord.description
          : "";
        recordCopy["purpose"] = purposeRecord ? purposeRecord.description : "";
        recordCopy["orto_radiometric"] = ortoRadiometricRecord
          ? ortoRadiometricRecord.description
          : "";
        recordCopy["data_specification"] = dataSpecRecord
          ? dataSpecRecord.description
          : "";

        recordCopy[
          "data_specification_version"
        ] = dataSpecificationVersionRecord
          ? dataSpecificationVersionRecord.description
          : null;
      }

      // Replace all floats by portuguese
      for (let recKey in recordCopy) {
        const recValue = recordCopy[recKey];

        if (this.isFloat(recValue)) {
          recordCopy[recKey] = recValue.toString().replace(".", ",");
        }
      }

      try {
        const result = await this.$axios.post(
          "/api/templates/download",
          {
            template: vectorial
              ? "new-vectorial-homologation"
              : "new-imagery-homologation",
            record: recordCopy,
          },
          { progress: true }
        );

        const file = result.data[0];

        const { stream, name } = file;

        const a = document.createElement("a");
        a.href = "data:application/pdf;base64," + escape(stream);
        a.download = name ? name : "document.pdf";
        a.click();
      } catch (e) {
        console.log("Error while downloading template");
      }

      this.onDownload();
    },
  },

  watch: {
    "record.data_specification": {
      handler: function (val, old) {
        let newVals = {
          // Imagem
          model_resolution: 4.0,
          altimetric_model_error: 0.75,
          model_band: 200.0,

          // Vector
          semantic_completude: 5,
          semantic_classification: 5,
          max_semantic_incoherent: 0,
          max_semantic_duplicates: 0,
          max_discontinuity_number: 0,
          max_discontinuity_sheets: 0,
          pontual_elements: 0,
          linear_elements: 0,
          planimetric_percent: {
            planimetric_point_percent: 90,
            planimetric_deviation: 0.45,
          },
          altimetric_percent: {
            altimetric_point_percent: 90,
            altimetric_deviation: 0.65,
          },
        };

        switch (val) {
          case 1:
            // ndd1
            newVals = {
              ...newVals,

              model_resolution: 4.0,
              altimetric_model_error: 0.75,
              model_band: 200.0,

              planimetric_error: 0.3,
              planimetric_percent: {
                planimetric_point_percent: 90,
                planimetric_deviation: 0.45,
              },
              altimetric_error: 0.4,
              altimetric_percent: {
                altimetric_point_percent: 90,
                altimetric_deviation: 0.65,
              },
            };
            break;
          case 2:
            // ndd2
            newVals = {
              ...newVals,

              model_resolution: 10.0,
              altimetric_model_error: 3.0,
              model_band: 1000.0,

              planimetric_error: 1.5,
              planimetric_percent: {
                planimetric_point_percent: 90,
                planimetric_deviation: 2.3,
              },
              altimetric_error: 1.7,
              altimetric_percent: {
                altimetric_point_percent: 90,
                altimetric_deviation: 2.75,
              },
            };
            break;
          case 3:
            // 1:1000
            newVals = {
              ...newVals,

              model_resolution: 2.0,
              altimetric_model_error: 0.4,
              model_band: 100.0,

              planimetric_error: 0.18,
              planimetric_percent: {
                planimetric_point_percent: 90,
                planimetric_deviation: 0.27,
              },
              altimetric_error: 0.25,
              altimetric_percent: {
                altimetric_point_percent: 90,
                altimetric_deviation: 0.41,
              },
            };
            break;
          case 4:
            // 1:2000
            newVals = {
              ...newVals,

              model_resolution: 4.0,
              altimetric_model_error: 0.75,
              model_band: 200.0,

              planimetric_error: 0.3,
              planimetric_percent: {
                planimetric_point_percent: 90,
                planimetric_deviation: 0.45,
              },
              altimetric_error: 0.4,
              altimetric_percent: {
                altimetric_point_percent: 90,
                altimetric_deviation: 0.65,
              },
            };
            break;
          case 5:
            // 1:5000
            newVals = {
              ...newVals,

              model_resolution: 7.5,
              altimetric_model_error: 1.8,
              model_band: 500.0,

              planimetric_error: 0.75,
              planimetric_percent: {
                planimetric_point_percent: 90,
                planimetric_deviation: 1.25,
              },
              altimetric_error: 1,
              altimetric_percent: {
                altimetric_point_percent: 90,
                altimetric_deviation: 1.65,
              },
            };
            break;
          case 6:
            // 1:10000
            newVals = {
              ...newVals,

              model_resolution: 10.0,
              altimetric_model_error: 3.0,
              model_band: 1000.0,

              planimetric_error: 1.5,
              planimetric_percent: {
                planimetric_point_percent: 90,
                planimetric_deviation: 2.3,
              },
              altimetric_error: 1.7,
              altimetric_percent: {
                altimetric_point_percent: 90,
                altimetric_deviation: 2.75,
              },
            };
            break;
          default:
            // Outro
            newVals = {
              model_resolution: null,
              altimetric_model_error: null,
              model_band: null,

              planimetric_error: null,
              planimetric_percent: {
                planimetric_point_percent: 90,
                planimetric_deviation: null,
              },
              altimetric_error: null,
              altimetric_percent: {
                altimetric_point_percent: 90,
                altimetric_deviation: null,
              },
              semantic_completude: null,
              semantic_classification: null,
              max_semantic_incoherent: 0,
              max_semantic_duplicates: 0,
              max_discontinuity_number: 0,
              max_discontinuity_sheets: 0,
              pontual_elements: 0,
              linear_elements: 0,
            };
            break;
        }

        this.defaultPlanimetric.planimetric_error = newVals.planimetric_error;
        this.defaultPlanimetric.planimetric_deviation =
          newVals.planimetric_percent.planimetric_deviation;

        this.defaultAltimetric.altimetric_error = newVals.altimetric_error;
        this.defaultAltimetric.altimetric_deviation =
          newVals.altimetric_percent.altimetric_deviation;

        const keys = Object.keys(newVals);

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];

          this.record[key] = newVals[key];
        }

        // Safety reset
        this.record.data_specification_version = null;

        this.resetFieldSuffixes();
      },
    },

    "record.product_type": {
      handler: async function (val, old) {
        const record = this.record;

        if (!this.stores.dataVectorialTypes) {
          return;
        }

        if (val === 1) {
          await this.stores.dataVectorialTypes.api().read({
            filters: [
              {
                property: "code",
                operator: "eq",
                value: 1,
              },
            ],
            forceReload: true,
          });
        } else {
          await this.stores.dataVectorialTypes.api().read({
            filters: [
              {
                property: "code",
                operator: "noteq",
                value: 1,
              },
            ],
            forceReload: true,
          });
        }

        this.record.data_specification_version = null;
      },
    },

    "record.is_collective": {
      handler: function (val) {
        const producers = this.record.producers;

        producers.splice(0, producers.length);
      },
    },

    "record.vectorial": {
      handler: function (val) {
        this.record.data_specification_version = null;

        if (!val) {
          this.record.product_type = 1;
          this.record.has_themes = false;
        }
      },
    },

    "record.has_themes": {
      handler: function (val) {
        const columns = this.columns;

        // Lets be super careful here
        // This is not a mandatory feature
        if (columns.length < 7) {
          return;
        }

        // If has specific themes
        const lastPage = this.columns[6];

        // has two items at least
        if (lastPage.length < 2) {
          return;
        }

        const field = lastPage[1];

        // Again, super carefull. We are changing the inline field declaration
        if (!!field.isObservationsField) {
          // field.required = !!val;
          field.validation = !!val ? [this.validateThemes] : [];
        }
      },
    },
  },
};
</script>
