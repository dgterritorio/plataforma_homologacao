<template>
  <v-row>
    <v-col>
      <FormSection :title="title" class="ma-3">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Deve submeter no nosso serviço de partilha de ficheiros, todos os ficheiros associados à cartografia que deseja
            homologar. A partilha de estes ficheiros é privada entre o requerente e a equipa da DGT.
          </div>

          <div class="ma-6 body-1 text-justify unselectable">
            <span class="font-weight-medium">Nota Importante</span>: No caso de submissão de ortofotomapas, deve também submeter
             o mapa de localização (ficheiro em formato <i>shapefile</i>) que represente a área cartografada.
          </div>

          <Textfield
            ref="clipboardTarget"
            :options="{text: $t('Upload Link'), readonly: true, allowCopy: true}"
            :model="cartography.upload_link"
          ></Textfield>

          <Textfield
            ref="clipboardTarget"
            :options="{text: $t('Upload Password'), readonly: true, allowCopy: true}"
            v-model="cartography.upload_password"
          ></Textfield>
        </template>
      </FormSection>

      <FormSection :title="$t('Detected Files')" class="ma-3">
        <template v-slot:body>
          <div class="ma-6 body-1 text-justify unselectable">
            Após finalizar o carregamento de ficheiros no nosso serviço, deve certificar que os dados foram
            reconhecidos pelo nosso sistema. Pressione "Refrescar Lista" para atualizar a lista de ficheiros.
          </div>

          <NextcloudMirror :items="folderItems" :loading="loading" @refresh="validate"></NextcloudMirror>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import Textfield from "@/components/forms/fields/text.vue";
import NextcloudMirror from "@/layouts/client/dgt/pdh/custom/nextcloudMirror.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import CartographyMixin from "@/layouts/client/dgt/pdh/mixins/cartography.js";

export default {
  name: "CartographyReview",

  components: {
    Textfield,
    NextcloudMirror,
    FormSection,
  },

  mixins: [ActionFormMixin, CartographyMixin],

  data() {
    return {
      cartography: {},
      folderItems: [
        {
          name: this.$t("Root"),
          children: [],
          isDirectory: true,
          loading: false,
          open: true,
        },
      ],
    };
  },

  created: async function () {
    const record = this.record;

    const result = await this.requestCartography(record);

    if (result && result.length) {
      this.cartography = result[0];

      await this.validate();
    }
  },

  methods: {
    validate: async function () {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      const root = this.folderItems[0];

      root.loading = true;

      root.children = [];

      let files = [];

      const result = await this.requestReaddir(record, cartography);

      if (result) {
        // TODO: Warn user no next cloud connection
        files = result.data;
        const count = result.total;

        this.count = count;

        root.children = files;

        root.loading = false;
      }

      const valid = files.length > 0;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.valid;

      if (valid) {
        return {
          action: this.$t("Uploaded cartography"),
          conclusion: this.$t("Cartography uploaded"),
          number: this.count,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Upload Cartography"),
          conclusion: this.$t("Cartography Missing"),
          number: this.count,
          advance: false,
        };
      }
    },
  },
};
</script>