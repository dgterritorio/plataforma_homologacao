<template>
  <v-container class="margin: 0">
    <FormSection :title="$t('Review Uploaded Cartography')">
      <template v-slot:body>
        <div class="ma-6 body-1 text-justify unselectable">
          Deve verificar se a cartografia submetida pelo requerente de homologação se
          encontra corretamente submetida. Efetue o login da plataforma de partilha de dados
          e aceda à pasta seguinte.
        </div>

        <Textfield
          ref="clipboardTarget"
          :options="{text: $t('Upload Folder'), readonly: true, allowCopy: true}"
          v-model="cartography.upload_folder"
        ></Textfield>
      </template>
    </FormSection>

    <FormSection :title="$t('Detected Files')">
      <template v-slot:body>
        <div class="ma-6 body-1 text-justify unselectable">
          O quadro seguinte deve listar a cartografia carregada pelo requerente. No caso de nenhum
          ficheiro ser detetado, pressione "Refrescar Lista".
        </div>

        <NextcloudMirror class="ma-6" :items="folderItems" :loading="loading" @refresh="validate"></NextcloudMirror>
      </template>
    </FormSection>

    <FormSection :title="$t('Confirm Files')">
      <template v-slot:body>
        <div
          class="ma-6 body-1 text-justify unselectable"
        >Para finalizar esta tarefa, deve assinalar uma das opções seguintes:</div>

        <ModernSwitch :config="switchCfg" :model="isValid" @change="onChangeValid($event)"></ModernSwitch>
      </template>
    </FormSection>
  </v-container>
  <!-- </v-col>
  </v-row>-->
</template>
<script>
import Textfield from "@/components/forms/fields/text.vue";
import NextcloudMirror from "@/layouts/client/dgt/pdh/custom/nextcloudMirror.vue";
import ModernSwitch from "@/layouts/client/dgt/pdh/custom/modern-switch.vue";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import CartographyMixin from "@/layouts/client/dgt/pdh/mixins/cartography.js";

export default {
  name: "CartographyReview",

  components: {
    Textfield,
    NextcloudMirror,
    ModernSwitch,
    FormSection,
  },

  mixins: [ActionFormMixin, CartographyMixin],

  data() {
    return {
      switchCfg: {
        valid: {
          color: "primary",
          value: true,
          label: this.$t('Files accordingly'),
          icon: "mdi-check",
        },
        invalid: {
          color: "red",
          value: false,
          label: this.$t('Files missing'),
          icon: "mdi-close",
        },
      },
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

      const isInvalid = true;//!!this.cartography.invalid;

      await this.validate(isInvalid);
    }
  },

  methods: {
    validate: async function (force) {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      const root = this.folderItems[0];

      root.loading = true;

      root.children = [];

      let files = [];

      const result = await this.requestReaddir(record, cartography);

      if (result) {
        files = result.data;
        const count = result.total;

        this.count = count;

        root.children = files;

        root.loading = false;
      }

      const valid = force ? false : true;//files.length > 0; // && !this.cartography.invalid;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = !this.cartography.invalid;

      if (valid) {
        return {
          action: this.$t("Review Cartography"),
          conclusion: this.$t("Cartography accordingly"),
          number: this.count,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Review Cartography"),
          conclusion: this.$t("Cartography not Accordingly"),
          number: this.count,
          advance: false,
        };
      }
    },

    updateValidaty: async function (invalid) {
      const vectorial = this.record.vectorial;
      const cartography = this.cartography;

      try {
        const result = await this.$axios.post(
          "/api/homologation/cartography/setinvalid",
          {
            cartographyId: cartography.id,
            vectorial: vectorial,
            invalid: invalid,
          }
        );

        if (result.error) {
          throw result.error;
        }

        return true;
      } catch (e) {
        console.log("Error");

        return false;
      }
    },

    save: async function () {
      const flag = this.cartography.invalid;

      const result = await this.updateValidaty(flag);

      if (!result) {
        return false;
      }

      this.validate();

      return true;
    },

    onChangeValid: async function (flag) {
      this.cartography.invalid = !flag;
    },
  },

  computed: {
    isValid: function () {
      return this.cartography.invalid !== undefined
        ? !this.cartography.invalid
        : false;
    },
  },
};
</script>