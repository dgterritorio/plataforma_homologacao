<template>
  <v-row class="my-4" justify="center" align="center">
    <client-only>
      <v-col :sm="12" :md="12" :lg="12" class="d-flex justify-center">
        <MultiStepForm
          ref="multiform"
          style="max-width: 800px"
          :title="$t('Registo para Requerente de Homologação')"
          :record="record"
          :headers="headers"
          :fields.sync="columns"
          @finish="onFinish"
        ></MultiStepForm>
      </v-col>
    </client-only>
  </v-row>
</template>

<script>
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

import MultiStepForm from "~/components/forms/multistepform.vue";
import Textfield from "@/components/forms/fields/text.vue";

export default {
  components: {
    MultiStepForm,
    Textfield,
  },

  data() {
    return {
      record: {
        name: null,
        email: null,
        password: null,

        address: null,
        locality: null,
        zipcode: null,
        vat: null,
        nic: null,
        gender: null,
        phone: null,
        telefone: null,
        obs: null,
        dicofre: null,
      },

      headers: [this.$t("Identificação"), this.$t("Contactos")],

      columns: [
        [
          {
            cmp: "title",
            text: this.$t("Identificação"),
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Nome"),
            explain: "new-applicant-1",
            value: "name",
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("NIF"),
            explain: "new-applicant-2",
            value: "vat",
            mask: "### ### ###",
            cols: 6,
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Email"),
            explain: "new-applicant-3",
            value: "email",
            validation: ["email"],
            required: true,
          },
          {
            cmp: Textfield,
            type: "password",
            explain: "new-applicant-4",
            text: this.$t("Password"),
            value: "password",
            validation: ["min6"],
            required: true,
          },
        ],
        [
          {
            cmp: "title",
            text: this.$t("Contact Information"),
            ignore: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Address"),
            explain: "new-applicant-5",
            value: "address",
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Localidade"),
            explain: "new-applicant-6",
            value: "locality",
            cols: 6,
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Zip Code"),
            explain: "new-applicant-7",
            value: "zipcode",
            mask: "####-###",
            cols: 6,
            required: true,
          },
          {
            cmp: Textfield,
            text: this.$t("Contacto Telefónico"),
            explain: "new-applicant-8",
            value: "phone",
            mask: "### ### ###",
            validation: ["phone"],
            required: true,
          },
        ],
      ],
    };
  },

  methods: {
    onFinish: async function () {
      const record = this.$refs.multiform.getRecord();

      // const dialog = this.$refs.dialog;

      const values = {
        ...record,
      };

      values["password"] = sha1(record.password).toString();

      values["vat"] = values["vat"].replace(/\s/g, "");
      values["phone"] = values["phone"].replace(/\s/g, "");

      try {
        const result = await this.$axios.post(
          "/api/applicant/register",
          values,
          { progress: true }
        );

        const data = result.data;

        // this.error = !!data.error;
        const error = result.error;

        this.$store.commit("SET_DIALOGMSG", {
          title: "Sucesso!",
          text: "<p>Utilizador criado.</p><p>Em breve será enviado um email de confirmação de registo na plataforma.</p>",
          icon: "mdi-check",
          color: "green",
          okText: "Confirmar",
          url: "/user/login",
        });
      } catch (e) {
        this.error = true;
      }
    },
  },
};
</script>