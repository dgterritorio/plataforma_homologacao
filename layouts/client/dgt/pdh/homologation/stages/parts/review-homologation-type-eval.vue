<template>
  <v-row class="mx-1">
    <v-col :sm="12" :md="12" :lg="12">
      <FormSection :title="$t('Select Homologation Type')">
        <template v-slot:body>
          <div
            class="ma-6 body-1 text-justify unselectable"
          >Deve assinalar o tipo de homologação consoante a grandeza do produto a homologar.</div>

          <v-row align="stretch" class="shrinked-row">
            <v-col :sm="6" :md="6" :lg="6" align-self="stretch">
              <div class="mx-6 body-1 font-weight-bold unselectable">Homologação do Tipo A:</div>
              <v-divider class="my-3 mx-5" style="padding: 0; margin: 0"></v-divider>

              <ul class="custom-ul">
                <li class="ml-10 ma-4 body-1 text-justify unselectable">
                  cartografia do nível de detalhe 2 (NdD2), ou equivalente nas escalas 1:5 000 e 1:10 000, que
                  abrange a totalidade de um município ou que compreende na íntegra uma comunidade
                  intermunicipal ou associação de municípios;
                </li>

                <li class="ml-10 ma-4 body-1 text-justify unselectable">
                  cartografia do nível de detalhe 1 (NdD1), ou equivalente nas escalas 1:1 000 e 1: 2 000, que
                  abrange a totalidade de um município ou que compreende na íntegra uma comunidade
                  intermunicipal ou associação de municípios;
                </li>

                <li class="ml-10 ma-4 body-1 text-justify unselectable">
                  outra cartografia do nível de detalhe 1 ou nível de detalhe 2 que não abrange a totalidade de
                  um município ou de uma comunidade intermunicipal ou associação de municípios, mas que em
                  conjunto com outra cartografia, e de forma complementar, contribui para a representação
                  integral destas áreas.
                </li>
              </ul>

              <!-- <v-card flat height="100%">
                <v-card-title>Homologação do Tipo A</v-card-title>
                <v-card-text class="body-1" style="text-align: justify;">
                  <ul>
                    <li>
                      cartografia do nível de detalhe 2 (NdD2), ou equivalente nas escalas 1:5 000 e 1:10 000, que
                      abrange a totalidade de um município ou que compreende na íntegra uma comunidade
                      intermunicipal ou associação de municípios;
                    </li>
                    <li>
                      A cartografia do nível de detalhe 1 (NdD1), ou equivalente nas escalas 1:1 000 e 1: 2 000, que
                      abrange a totalidade de um município ou que compreende na íntegra uma comunidade
                      intermunicipal ou associação de municípios;
                    </li>
                    <li>
                      Outra cartografia do nível de detalhe 1 ou nível de detalhe 2 que não abrange a totalidade de
                      um município ou de uma comunidade intermunicipal ou associação de municípios, mas que em
                      conjunto com outra cartografia, e de forma complementar, contribui para a representação
                      integral destas áreas.
                    </li>
                  </ul>
                </v-card-text>
              </v-card>-->
            </v-col>
            <v-col :sm="6" :md="6" :lg="6" align-self="stretch">
              <div class="mx-6 body-1 font-weight-bold unselectable">Homologação do Tipo B:</div>
              <v-divider class="my-3 mx-5" style="padding: 0; margin: 0"></v-divider>

              <ul class="custom-ul">
                <li class="ml-10 ma-4 body-1 text-justify unselectable">
                  cartografia do nível de detalhe 2, ou equivalente nas escalas 1:5 000 e 1: 10 000, que não
                  abrange a totalidade de um município e que não compreende na íntegra uma comunidade
                  intermunicipal ou associação de municípios (e.g. cartografia de corredores habitualmente
                  produzida para os Mapas de Ruído);
                </li>

                <li class="ml-10 ma-4 body-1 text-justify unselectable">
                  cartografia do nível de detalhe 1 ou nível de detalhe 2 que não tenha sido adquirida de forma
                  complementar, com outra cartografia, e que em conjunto não contribuem de forma relevante e
                  significativa para a representação integral de um município, de uma comunidade intermunicipal
                  ou de uma associação de municípios (e.g. cartografias produzidas para os Planos de Pormenor);
                </li>
              </ul>
            </v-col>
            <v-col :sm="6" :md="6" :lg="6" class="px-4">
              <v-btn
                :color="type === 2 ? 'primary' : ''"
                outlined
                block
                @click="onChangeValid(2)"
              >{{$t('Select Type A')}}</v-btn>
            </v-col>
            <v-col :sm="6" :md="6" :lg="6" class="px-4">
              <v-btn
                :color="type === 3 ? 'primary' : ''"
                outlined
                block
                @click="onChangeValid(3)"
              >{{$t('Select Type B')}}</v-btn>
            </v-col>
          </v-row>
        </template>
      </FormSection>
    </v-col>
  </v-row>
</template>
<script>
import ActionFormMixin from "@/layouts/client/dgt/pdh/mixins/actionform.js";
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";

export default {
  name: "CartographyReview",

  mixins: [ActionFormMixin],

  components: {
    FormSection,
  },

  data() {
    return {
      userValid: false,
      type: null,
    };
  },

  created: async function () {
    const record = this.record;

    this.type = record.homologation_type;

    await this.validate();
  },

  methods: {
    validate: async function () {
      const record = this.record;
      const cartography = this.cartography;

      this.$emit("validating", true);

      const valid = this.type > 1;

      this.$emit("updatevalid", valid);

      this.$emit("validating", false);
    },

    getReport: function () {
      const valid = this.valid;

      if (valid) {
        return {
          action: this.$t("Set Homologation Type"),
          conclusion: this.$t("Type set: ") + (this.type === 2 ? "A" : "B"),
          number: 1,
          advance: true,
        };
      } else {
        return {
          action: this.$t("Set Homologation Type"),
          conclusion: this.$t("Type not set"),
          number: 1,
          advance: false,
        };
      }
    },

    updateHomologationType: async function (requestId, type) {
      try {
        const result = await this.$axios.post(
          "/api/homologation/request/settype",
          {
            requestId: requestId,
            type: type,
          }
        );

        if (result.error) {
          throw error;
        }

        return result;
      } catch (e) {
        console.log("Error updating homologation type");
        return null;
      }
    },

    save: async function () {
      const type = this.type;
      const requestId = this.record.id;

      const result = await this.updateHomologationType(requestId, type);

      if (result && !result.error) {
        this.record.homologation_type = type;

        this.record.$save();

        this.validate();

        return true;
      } else {
        this.type = this.record.homologation_type;

        return false;
      }
    },

    onChangeValid: async function (value) {
      this.type = value;
    },
  },
};
</script>
<style>
.custom-ul {
  list-style: initial;
}
</style>