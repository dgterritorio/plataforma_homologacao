<template>
  <v-row class="my-4" justify="center" align="center">
    <client-only>
      <v-col :sm="12" :md="12" :lg="12" class="d-flex justify-center">
        <MultiStepForm
          ref="multiform"
          :title="'Formulário de Registo por Mera Comunicação Prévia'"
          style="max-width: 800px"
          :record="record"
          :headers="headers"
          :fields.sync="columns"
          :customCmps="customForms"
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
              formato pdf. Guarde e assine digitalmente o documento de modo a
              validar o registo.
            </p>
            <p>
              No caso da impossibilidade de assinar digitalmente, imprima o
              formulário e assine o documento tal como no cartão de cidadão.
            </p>
          </v-card-text>

          <v-card-actions>
            <v-btn color="grey darken-1" text @click="onDialogClose()">{{
              $t("Back")
            }}</v-btn>

            <v-spacer></v-spacer>

            <input
              type="file"
              accept=".pdf"
              ref="file"
              style="display: none"
              v-on:change="handleUpload()"
            />
            <v-btn color="primary" text @click="$refs.file.click()">{{
              $t("Finalizar")
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- <v-dialog v-model="dialog2" persistent max-width="350">
        <v-card>
          <v-card-title v-if="error || !signed" class="headline">{{$t("Success")}}</v-card-title>
          <v-card-title v-else class="headline">{{$t("Success")}}</v-card-title>

          <v-card-text
            v-if="error"
          >{{$t("The pdf provided does not contain a valid signature. Please, correct the signature and repeat the process.")}}</v-card-text>
          <v-card-text v-else-if="signed">
            <p>{{$t('Document signed digitally by:')}}</p>
            <ul>
              <li>
                <b>{{signerName}}</b>
              </li>
            </ul>
            <br />
            <p>{{$t("The submitted files will be evaluated by our staff. You will receive an email with further instructions.")}}</p>
          </v-card-text>

          <v-card-text v-else>
            <p>{{$t('The uploaded document does not contain a valid digital signature.')}} {{$t("The submitted files will be evaluated by our staff. You will receive an email with further instructions.")}}</p>
          </v-card-text>

          <v-card-actions>
            <v-btn color="grey darken-1" text @click="onCloseDialog2">
              <div v-if="error">{{$t("Back")}}</div>
              <div v-else>{{$t("Finish")}}</div>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>-->
    </client-only>
  </v-row>
</template>

<script>
import StaffForm from "~/layouts/client/dgt/pdh/producers/entity/staffForm.vue";
import EquipmentForm from "~/layouts/client/dgt/pdh/producers/entity/equipmentsForm.vue";
import ActivitiesForm from "@/layouts/client/dgt/pdh/producers/entity/activitiesForm.vue";

import MultiStepForm from "~/components/forms/multistepform.vue";
import Textfield from "@/components/forms/fields/text.vue";
import Textareafield from "@/components/forms/fields/textarea.vue";
import Datefield from "@/components/forms/fields/date.vue";
import Selectfield from "@/components/forms/fields/select.vue";
import Filefield from "@/components/forms/fields/file.vue";
import Switchfield from "@/components/forms/fields/switch.vue";
import Completionfield from "@/components/forms/fields/completion.vue";
import Compositefield from "@/components/forms/fields/composite.vue";
import Searchfield from "@/components/forms/fields/search.vue";
import RemoteSelectfield from "@/components/forms/fields/remotecombobox.vue";
import Chipfield from "@/components/forms/fields/chip.vue";

import sha1 from "crypto-js/sha1";

export default {
  name: "RegisterProducer",

  components: {
    EquipmentForm,
    StaffForm,
    ActivitiesForm,

    MultiStepForm,
    Textfield,
    Textareafield,
    Datefield,
    Filefield,
    Selectfield,
    Completionfield,
    Compositefield,
    Searchfield,
    RemoteSelectfield,
    Chipfield,
  },

  data() {
    return {
      signerName: "",
      signed: false,
      error: false,
      alert: false,
      dialog: false,
      dialog2: false,

      record: {
        // part 1
        name: null,
        vat: null,
        is_comercial: false,
        is_collective: null,
        type: null,
        cpr_code: null,
        cae: null,

        // part 2
        doc1: null,
        doc2: null,
        doc3: null,
        doc4: null,

        // part 3
        address: null,
        locality: null,
        county: null,
        zipcode: null,
        phone: null,
        email: null,
        url: null,

        //part 4
        carto_vectorial: null,
        carto_imagery: null,
        carto_aerial: null,

        // part 5
        // topography: null,
        // photogrammetry: null,
        // act_vtc: null,
        // act_tic: null,
        // act_af: null,
        // act_sip: null,
        activities: [
          {
            name: this.$t("Topografia"),
            value: 0,
            active: false,
          },
          {
            name: this.$t("Fotogrametria"),
            value: 1,
            active: false,
          },
          {
            name: this.$t("Cartografia topográfica vetorial"),
            value: 2,
            active: false,
          },
          {
            name: this.$t("Cartografia topográfica imagem"),
            value: 3,
            active: false,
          },
          {
            name: this.$t("Coberturas aerofotogramétricas"),
            value: 4,
            active: false,
          },
          {
            name: this.$t("Processamento de imagens de satélite"),
            value: 5,
            active: false,
          },
        ],

        // part 6
        // director: null,
        // director_skills: null,
        techs: [],
        staff: [],

        // part 7
        equipments: [],

        // part 8
        password: null,

        // part 9
        observations: null,
      },

      headers: [
        this.$t("Identificação"),
        this.$t("Declarações"),
        this.$t("Contactos"),
        this.$t("Cartografia"),
        // this.$t("Actividades"),
        this.$t("Equipa"),
        this.$t("Equipamento"),
        this.$t("Password"),
        this.$t("Observações"),
      ],

      customForms: {
        5: StaffForm,
        6: EquipmentForm,
      },

      columns: [
        [
          {
            cmp: "title",
            text: this.$t("Identification"),
            explain: "new-producer-1",
            type: "title",
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Name"),
            explain: "new-producer-2",
            value: "name",
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("NIF"),
            explain: "new-producer-3",
            value: "vat",
            cols: 6,
            mask: "### ### ###",
            required: true,
          },
          {
            cmp: Selectfield,
            text: this.$t("Tipo de Entidade"),
            explain: "new-producer-5",
            value: "is_collective",
            required: true,
            cols: 6,
            items: [
              { text: this.$t("Singular"), value: false },
              { text: this.$t("Colectiva"), value: true },
            ],
          },
          {
            cmp: Selectfield,
            text: this.$t("Entidade Sujeita a Registo Comercial"),
            explain: "new-producer-4",
            value: "is_comercial",
            required: true,
            cols: 6,
            items: [
              { text: this.$t("Sim"), value: true },
              { text: this.$t("Não"), value: false },
            ],
            condition: {
              prop: "is_collective",
              value: true,
            },
          },
          {
            cmp: Textfield,
            text: this.$t(
              "Código do acesso online à Certidão Permanente do Registo"
            ),
            explain: "new-producer-6",
            value: "cpr_code",
            required: true,
            condition: {
              prop: "is_comercial",
              value: true,
            },
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Declarations"),
            type: "title",
            ignore: true,
          },
          {
            cmp: Filefield,
            text: this.$t(
              "Certidão de inserção no Registo Nacional de Pessoas Coletivas"
            ),
            explain: "new-producer-7",
            value: "doc1",
            required: true,
            type: "file",
            accept: ".pdf",
            counter: 1,
            condition: {
              prop: "is_comercial",
              value: false,
            },
            condition2: {
              prop: "is_collective",
              value: true,
            },
          },
          {
            cmp: Filefield,
            text: this.$t("Declaração de exercício de atividade"),
            explain: "new-producer-8",
            value: "doc2",
            required: true,
            type: "file",
            accept: ".pdf",
            counter: 1,
            condition: {
              prop: "is_collective",
              value: false,
            },
          },
          {
            cmp: Filefield,
            text: this.$t(
              "Declaração de cumprimento das normas e especificações técnicas"
            ),
            explain: "new-producer-9",
            value: "doc3",
            required: true,
            type: "file",
            accept: ".pdf",
            counter: 1,
          },
          {
            cmp: Filefield,
            text: this.$t(
              "Declaração para exercício da atividade de produção de cartografia de uma entidade oriunda de um Estado-Membro da União Europeia"
            ),
            explain: "new-producer-10",
            value: "doc4",
            type: "file",
            accept: ".pdf",
            counter: 1,
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Contact Information"),
            type: "title",
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Address"),
            explain: "new-producer-11",
            value: "address",
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Localidade"),
            explain: "new-producer-12",
            value: "locality",
            cols: 6,
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Zip Code"),
            explain: "new-producer-13",
            value: "zipcode",
            cols: 6,
            required: true,
            // mask: "####-###",
          },
          {
            cmp: Textfield,
            text: this.$t("Municipality"),
            explain: "new-producer-14",
            value: "county",
            required: true,
            // store: "CAOP",
            // storeGetter: "all",
            // itemText: "concelho",
            // itemValue: "concelho",
            // multiple: false,
            cols: 6,
          },
          {
            cmp: Textfield,
            text: this.$t("Telephone"),
            explain: "new-producer-16",
            value: "phone",
            mask: "### ### ###",
            required: true,
            cols: 6,
          },
          {
            cmp: Textfield,
            text: this.$t("Website"),
            explain: "new-producer-17",
            value: "url",
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Domínios de Produção"),
            type: "title",
            ignore: true,
          },
          {
            cmp: Switchfield,
            text: this.$t("Cartografia Topográfica Vetorial"),
            explain: "new-producer-18",
            value: "carto_vectorial",
            validation: [this.validateActivities],
            forceFormValidation: true,
            type: "switch",
            hint: "CAE: 71120 - Atividades de engenharia e técnicas afins",
            persistHint: true,
            values: [true, false],
          },
          {
            cmp: Switchfield,
            text: this.$t("Cartografia Topográfica de Imagem"),
            explain: "new-producer-19",
            value: "carto_imagery",
            validation: [this.validateActivities],
            forceFormValidation: true,
            type: "switch",
            hint: "CAE: 71120 - Atividades de engenharia e técnicas afins",
            persistHint: true,
            values: [true, false],
          },
          {
            cmp: Switchfield,
            text: this.$t("Execução de Coberturas Aerofotogramétricas"),
            explain: "new-producer-20",
            value: "carto_aerial",
            validation: [this.validateActivities],
            forceFormValidation: true,
            type: "switch",
            hint:
              "CAE: 71120 - Atividades de engenharia e técnicas afins | 74200 – Atividades fotográficas",
            persistHint: true,
            values: [true, false],
          },
        ],
        // [
        //   {
        //     cmp: "title",
        //     text: this.$t("Atividades no Âmbito dos Domínios de Produção"),
        //     explain: "new-producer-21",
        //     type: "title",
        //     ignore: true,
        //   },
        //   {
        //     cmp: ActivitiesForm,
        //     text: this.$t("Activity list"),
        //     explain: "new-producer-22",
        //     value: "activities",
        //   },
        // ],
        [
          {
            cmp: "title",
            text: this.$t("Team"),
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Nome do Diretor da Entidade"),
            explain: "new-producer-23",
            value: "diretor_name",
            required: true,
            cols: 6,
          },
          {
            cmp: Textfield,
            text: this.$t("Academic Qualifications"),
            explain: "new-producer-24",
            value: "diretor_skills",
            required: true,
            cols: 6,
          },

          {
            cmp: StaffForm,
            text: this.$t("Staff Members"),
            explain: "new-producer-25",
            value: "staff",
          },

          // {
          //   text: this.$t(
          //     "Diretor da entidade coletiva ou designação da entidade singular"
          //   ),
          //   value: "director",
          //   required: true,
          // },
          // {
          //   text: this.$t("Habilitações Académicas"),
          //   value: "director_skills",
          //   required: true,
          // },
          // {
          //   text: this.$t("Técnicos"),
          //   value: "techs",
          //   required: true,
          // },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Equipment"),
            explain: "new-producer-26",
            type: "title",
            ignore: true,
          },
          {
            cmp: EquipmentForm,
            text: this.$t("Equipment"),
            explain: "new-producer-27",
            value: "equipments",
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Account Creation"),
            type: "title",
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Email"),
            explain: "new-producer-15",
            value: "email",
            validation: ["email"],
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Password"),
            explain: "new-producer-28",
            value: "password",
            require: true,
            type: "password",
            validation: ["min6"],
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Comments"),
            type: "title",
            ignore: true,
          },
          {
            cmp: Textareafield,
            explain: "new-producer-29",
            hint: this.$t("Comments"),
            value: "observations",
          },
        ],
      ],
    };
  },

  created: function () {
    // this.record = {
    //   // part 1
    //   name: "Produtor",
    //   vat: "123123123",
    //   is_comercial: true,
    //   is_collective: false,
    //   cpr_code: null,
    //   cae: null,
    //   // part 2
    //   doc1: null,
    //   doc2: null,
    //   doc3: null,
    //   doc4: null,
    //   // part 3
    //   address: "Rua de teste",
    //   locality: "Localidade de Teste",
    //   county: "Concelho",
    //   zipcode: "4000-000",
    //   phone: "123123123",
    //   email: "nta@geomaster.pt",
    //   url: null,
    //   //part 4
    //   carto_vectorial: true,
    //   carto_imagery: true,
    //   carto_aerial: true,
    //   // part 5
    //   activities: [
    //     {
    //       name: this.$t("Topografia"),
    //       value: 0,
    //       active: false,
    //     },
    //     {
    //       name: this.$t("Fotogrametria"),
    //       value: 1,
    //       active: false,
    //     },
    //     {
    //       name: this.$t("Cartografia topográfica vetorial"),
    //       value: 2,
    //       active: false,
    //     },
    //     {
    //       name: this.$t("Cartografia topográfica imagem"),
    //       value: 3,
    //       active: false,
    //     },
    //     {
    //       name: this.$t("Coberturas aerofotogramétricas"),
    //       value: 4,
    //       active: false,
    //     },
    //     {
    //       name: this.$t("Processamento de imagens de satélite"),
    //       value: 5,
    //       active: false,
    //     },
    //   ],
    //   // part 6
    //   // director: "Diretor",
    //   // director_skills: "Skills Diretor",
    //   // techs: [],
    //   diretor_name: "Diretor 100",
    //   diretor_skills: "Skills 100",
    //   staff: [{ type: 1, name: "Tech 1100", skills: "Skills 1100" }],
    //   // part 7
    //   equipments: [{ name: "Equipment 1" }, { name: "Equipment 3" }],
    //   // part 8
    //   password: "hey",
    //   // part 8
    //   obs: "Observações finais",
    // };
  },

  methods: {
    validateActivities: function () {
      const { carto_vectorial, carto_imagery, carto_aerial } = this.record;

      const isValid = carto_vectorial || carto_imagery || carto_aerial;

      return isValid || this.$t("Select at least one activity");
    },

    onDialogClose: function () {
      this.dialog = false;
    },
    onCloseDialog2: function () {
      this.dialog2 = false;

      if (!this.error) {
        this.$router.push("/");
      } else {
        this.dialog = true;
      }
    },
    onDownload: function () {
      this.dialog = true;
    },

    handleUpload: async function (event) {
      const file = this.$refs.file.files[0];

      const extension = file.type;

      if (extension !== "application/pdf") {
        console.log("TODO: Warn not pdf type");
        return;
      }

      const forms = this.$refs.form;

      let values = this.$refs.multiform.getRecord();

      let formData = new FormData();

      // let activity = [];
      let staff = values.staff.concat([
        {
          type: 0,
          name: values.diretor_name,
          skills: values.diretor_skills,
        },
      ]);

      let equipments = values.equipments;
      let activities = values.activities
        .filter(function (row) {
          return row.active;
        })
        .map(function (row) {
          return row.value;
        });

      const keys = Object.keys(values);

      keys.forEach(function (key) {
        switch (key) {
          case "activity":
          case "staff":
          case "equipment":
            break;

          case "password":
            const encryptedPass = sha1(values[key]).toString();

            formData.append(key, encryptedPass);
            break;
          case "vat":
          case "phone":
            formData.append(key, values[key].replace(/\s+/g, ""));
            break;
          default:
            formData.append(key, values[key]);
            break;
        }
      });

      formData.append("form", file);

      formData.append("activity", JSON.stringify(activities));
      formData.append("staff", JSON.stringify(staff));
      formData.append("equipment", JSON.stringify(equipments));

      let result = {};

      try {
        // Request the end-point
        result = await this.$axios.post(
          "/api/producer/entity/register",
          formData,
          { progress: true }
        );

        if (result.error) {
          throw result.error;
        }

        this.dialog = false;

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          text:
            "<p>Registo por comunicação prévia criado com sucesso.</p><p>Em breve será notificado com a confirmação do registo através do contacto: <ul><li>" +
            values.email +
            "</li></ul></p>" +
            "<p>A documentação enviada será avaliada pela DGT de modo a oficializar o registo.</p>",
          icon: "mdi-check",
          color: "green",
          okText: "Confirmar",
          url: "/user/login",
        });
      } catch (e) {
        this.dialog = false;

        result.error = e;
      }

      // finally {
      //   if (!result.error) {
      //     const data = result.data;

      //     this.signerName = data.length ? data[0] : "";
      //     this.signed = !!data.length;
      //   } else {
      //     this.signerName = "";
      //     this.signed = false;
      //   }

      //   this.dialog = false;

      //   this.dialog2 = true;
      //   this.error = !!result.error;
      // }
    },

    onFinish: async function () {
      const record = this.record;

      const recordCopy = {
        ...record,

        activities: record.activities.filter((a) => a.active),
        is_comercial: record.is_comercial ? "Sim" : "Não",
        is_collective: record.is_collective ? "Coletiva" : "Singular",
        carto_vectorial: record.carto_vectorial ? "Sim" : "Não",
        carto_imagery: record.carto_imagery ? "Sim" : "Não",
        carto_aerial: record.carto_aerial ? "Sim" : "Não",
      };

      try {
        const result = await this.$axios.post(
          "/api/templates/download",
          {
            template: "new-producer",
            record: recordCopy,
          },
          {
            progress: true,
          }
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
    "record.is_collective": {
      handler: function (val, old) {
        // Limpar declaração se for coletiva
        if (val) {
          this.record.doc2 = null;
        } else {
          this.record.is_comercial = false;
        }
      },
    },

    "record.is_comercial": {
      handler: function (val, old) {
        if (val) {
          // Clear declaration
          this.record.doc1 = null;
        } else {
          // Clear codigo de acesso online
          this.record.cpr_code = "";
        }
      },
    },
  },
};
</script>