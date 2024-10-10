<template>
  <v-row align="center">
    <v-col sm="6" md="6" lg="6">
      <Simplecard :title="$t('Register Cartography Producer by Mere Prior Communication')" style="min-height:400px">
        <template v-slot:body>
          <v-row class="shrinked-row">
            <div class="body-1 text-justify" style="min-height: 250px;padding: 10px">
              <!-- <v-btn outlined flat width="100" height="100" style="margin: 10px">
              <v-icon x-large>{{'mdi-map'}}</v-icon>
              </v-btn>-->
              <span>Este perfil destina-se ao registo oficial de uma entidade para produção de cartografia. Após o registo o utilizador pode:</span>

              <ul class="custom-ul my-4 ml-4" style="line-height: 25px">
                <li>consultar informação associada ao seu registo;</li>
                <li>cessar atividade de produção de cartografia</li>
              </ul>
            </div>
          </v-row>
          <v-row justify="end">
            <v-btn class="mx-6 my-4" to="register-producer">
              {{$t('Register New Producer')}}
              <v-icon class="ml-2">{{'mdi-arrow-right'}}</v-icon>
            </v-btn>
          </v-row>
        </template>
      </Simplecard>
    </v-col>

    <v-col sm="6" md="6" lg="6">
      <Simplecard :title="$t('Register Entity as Applicant for Homologation Processes')" style="min-height: 400px">
        <template v-slot:body>
          <v-row class="shrinked-row">
            <div class="body-1 text-justify" style="min-height: 250px; padding: 10px">
              Este perfil destina-se à criação de uma conta que permite a submissão de processos para
               Homologação de Cartografia. Após o registo o utilizador pode :
              <ul class="custom-ul my-4 ml-4" style="line-height: 25px">
                <li>efetuar pedidos de homologação de cartografia;</li>
                <li>consultar informação associada ao processo de tramitação dos seus pedidos de homologação;</li>
              </ul>
            </div>
          </v-row>
          <v-row justify="end">
            <v-btn class="mx-6 my-4" to="register-applicant">
              {{$t('Registar Requerente')}}
              <v-icon class="ml-2">{{'mdi-arrow-right'}}</v-icon>
            </v-btn>
          </v-row>
        </template>
      </Simplecard>
    </v-col>
  </v-row>
</template>

<script>
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

// import Simplecard from "@/components/cards/simplecard.vue";
import Simplecard from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  name: "RegisterPage",

  components: {
    Simplecard,
  },
};
</script>

<style scoped>
.card-ul > li {
  margin: 10px 0;
}

.card-ul >>> i {
  margin-right: 10px;
}

.custom-ul > li {
  margin: 10px 0;
}
</style>
