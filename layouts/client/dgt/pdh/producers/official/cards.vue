<template>
  <div class="px-12 pt-6" style="height: 100%; width: 100%">
    <v-card flat height="100%">
      <v-card-title>
        <div>
          {{
            $t(
              "Produtores de cartografia registados através da mera comunicação prévia prevista no artigo 8º do Decreto-Lei n.º 130/2019, de 30 de agosto"
            )
          }}
        </div>
      </v-card-title>

      <v-card-text class="py-0" v-if="!inMaintenance">
        <v-text-field
          :label="$t('Pesquisar por nome do produtor')"
          :loading="loading"
          clearable
          outlined
          dense
          hideDetails
          v-model="value"
        ></v-text-field>
      </v-card-text>

      <v-card-text>
        <v-row align="stretch" v-if="!inMaintenance">
          <v-col
            sm="12"
            md="6"
            lg="4"
            v-for="producer in producers"
            :key="producer.name"
          >
            <FormSection
              :title="producer.name"
              :flat="false"
              style="height: 100%"
            >
              <template v-slot:body>
                <v-row style="margin: 0">
                  <v-col :sm="12" :md="12" :lg="12">
                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>Cartografia Topográfica Vetorial:</b>
                      {{ $t(producer.produces_vectorial) }}
                    </v-card-subtitle>
                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>Cartografia Topográfica de Imagem:</b>
                      {{ $t(producer.produces_imagery) }}
                    </v-card-subtitle>
                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>Execução de Coberturas Aerofotogramétricas:</b>
                      {{ $t(producer.produces_aerial) }}
                    </v-card-subtitle>

                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>{{ $t("Email") }}:</b>
                      {{ producer.email }}
                    </v-card-subtitle>
                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>{{ $t("Phone") }}:</b>
                      {{ producer.phone }}
                    </v-card-subtitle>

                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>{{ $t("Address") }}:</b>
                      {{ producer.address }}
                    </v-card-subtitle>

                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>{{ $t("Locality") }}:</b>
                      {{ producer.locality }}
                    </v-card-subtitle>
                    <v-card-subtitle class="body-1" style="padding-top: 0px">
                      <b>{{ $t("Zip Code") }}:</b>
                      {{ producer.zipcode }}
                    </v-card-subtitle>
                  </v-col>
                </v-row>
              </template>
            </FormSection>
          </v-col>
        </v-row>
        <v-row style="height: 70%" v-if="!inMaintenance">
          <v-col
            v-if="!producers.length"
            sm="12"
            md="12"
            lg="12"
            align-self="center"
          >
            <div
              class="unselectable text-center text--secondary text-wieght-bold title text-h4"
            >
              Sem resultados.
            </div>
          </v-col>
        </v-row>

        <v-row style="height: 70%" v-else>
          <v-col
            sm="12"
            md="12"
            lg="12"
            align-self="center"
          >
            <div
              class="unselectable text-center text--secondary text-wieght-bold title text-h4 my-8"
            >
              Em manutenção.
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>


<script>
import FormSection from "@/layouts/client/dgt/pdh/custom/action-form-section.vue";
import Search from "@/components/comboboxes/search.vue";

export default {
  components: {
    FormSection,
    Search,
  },

  data() {
    return {
      store: null,
      value: null,

      timer: null,
      timeout: 400,

      loading: false,

      inMaintenance: false
    };
  },

  created: async function () {
    this.store = this.$store.$db().model("ActiveProducers");

    if (process.client && !this.inMaintenance) {
      this.store.api().read();
    }
  },

  methods: {
    search: async function (value) {
      this.loading = true;

      const payload = {
        clear: true,
      };

      if (value && value.length) {
        payload["filters"] = [
          {
            operator: "like",
            property: "name",
            value: value,
          },
        ];
      }

      await this.store.api().read(payload);

      this.loading = false;
    },
  },

  computed: {
    producers: function () {
      if (!this.store) {
        return [];
      }

      return this.store.orderBy("name", true).get();
    },
  },

  watch: {
    value: {
      handler: function (value) {
        if (this.timer) {
          clearTimeout(this.timer);
        }

        const self = this;

        this.timer = setTimeout(async function () {
          await self.search(value);
        }, this.timeout);
      },
    },
  },
};
</script>
