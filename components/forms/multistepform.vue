<template>
  <div>
    <v-row align="start">
      <!-- Title -->
      <!-- <v-col :sm="11" :md="11" :lg="11" style="padding-bottom: 0px"></v-col> -->

      <!-- Content -->
      <v-col cols="12" :sm="11" :md="11" :lg="11">
        <!-- <v-card>
          <v-toolbar flat color="grey lighten-4">
            <v-toolbar-title>
              <v-card-title class="unselectable">{{$t(title)}}</v-card-title>
            </v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>-->

        <BasePanel :title="$t(title)">
          <template v-slot:body>
            <v-stepper v-model="curStep" style="box-shadow: none !important">
              <v-stepper-header class="v-stepper_header hidden-stepper-header">
                <template v-for="n in steps">
                  <v-stepper-step
                    :step="n + 1"
                    :key="`${n}-step`"
                    :complete="curStep > steps.length"
                    :editable="editable[n]"
                    :rules="[() => initial[n] || validaty[n]]"
                  ></v-stepper-step>
                  <v-divider :key="`${n}-divider`"></v-divider>
                </template>
              </v-stepper-header>

              <v-stepper-items>
                <v-stepper-content
                  v-for="n in steps"
                  :key="n + '-content'"
                  :step="n + 1"
                  style="margin: 0; padding: 0"
                >
                  <!-- <component
              v-if="customCmps[n]"
              :is="customCmps[n]"
              ref="form"
              class="px-12"
              :style="`height:${height}px; max-height:${height}px; overflow:scroll;`"
              :record.sync="record"
              :model.sync="fields[n]"
              v-model="validaty[n]"
                  ></component>-->

                  <!-- <template v-else> -->
                  <BasicForm
                    ref="form"
                    :formId="n"
                    :style="`min-height:400px`"
                    pristineFromModel
                    :recreatePristine="false"
                    :record.sync="record"
                    :model.sync="fields[n]"
                    v-model="validaty[n]"
                  ></BasicForm>
                  <!-- </template> -->
                </v-stepper-content>
              </v-stepper-items>

              <v-row class="mt-4">
                <v-col sm="12" md="3" lg="3">
                  <v-btn
                    block
                    :min-width="btnWidth"
                    outlined
                    color="primary"
                    @click="onClear"
                  >
                    <v-icon left>{{ "mdi-eraser" }}</v-icon>

                    {{ $t("Clear") }}</v-btn
                  >
                </v-col>
                <v-col sm="12" md="3" lg="3"></v-col>

                <v-col sm="12" md="3" lg="3">
                  <v-btn
                    v-if="curStep > 1"
                    block
                    :min-width="btnWidth"
                    outlined
                    color="primary"
                    @click="onPrevious"
                  >
                    <v-icon left>{{ "mdi-arrow-left" }}</v-icon>
                    {{ $t("Previous") }}
                  </v-btn>
                </v-col>

                <v-col sm="12" md="3" lg="3" v-if="curStep < steps.length">
                  <v-btn
                    :dark="showWarning"
                    block
                    :min-width="btnWidth"
                    :color="showWarning ? 'red' : 'primary'"
                    @click="onNext"
                    @mouseenter="onHoverInNext"
                    @mouseleave="onHoverOutNext"
                  >
                    {{ $t("Next") }}
                    <v-icon right>{{
                      showWarning ? "mdi-alert" : "mdi-arrow-right"
                    }}</v-icon>
                  </v-btn>
                </v-col>

                <v-col sm="12" md="3" lg="3" v-else>
                  <v-btn
                    :dark="showWarning"
                    block
                    :min-width="btnWidth"
                    :color="showWarning ? 'red' : 'primary'"
                    @click="onFinish"
                    @mouseenter="onHoverInNext"
                    @mouseleave="onHoverOutNext"
                    >{{ $t("Finish") }}
                    <v-icon right>{{
                      showWarning ? "mdi-alert" : "mdi-check"
                    }}</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-stepper>
          </template>
        </BasePanel>

        <!-- </v-card> -->
      </v-col>

      <!-- Bullets-->
      <v-col
        :sm="1"
        :md="1"
        :lg="1"
        class="bullet-col d-flex justify-center mt-16"
      >
        <v-card
          class="d-flex flex-column justify-space-around align-center bullet-panel"
        >
          <template v-for="n in steps">
            <v-btn
              fab
              :key="n"
              icon
              small
              :disabled="n > curStep - 1 ? true : false"
              @click="onClickStep(n)"
            >
              <v-avatar
                size="25px"
                v-if="curStep - 1 <= n"
                :color="curStep - 1 === n ? 'primary' : 'grey'"
              >
                <span class="white--text subtitle-2">{{ n + 1 }}</span>
              </v-avatar>

              <v-avatar size="25px" color="primary" v-else-if="curStep - 1 > n">
                <v-icon size="20px" dark color="white">mdi-check</v-icon>
              </v-avatar>
            </v-btn>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import BasicForm from "~/components/forms/basic.vue";
import BasePanel from "@/layouts/client/dgt/pdh/custom/simpledetails.vue";

export default {
  name: "multistepForm",

  components: {
    BasicForm,
    BasePanel,
  },

  props: {
    title: {
      type: String,
      default: null,
    },

    headers: {
      type: Array,
    },

    fields: {
      type: Array,
    },

    customCmps: {
      type: Object,
      default: function () {
        return {};
      },
    },

    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    height: {
      type: Number,
      default: 450,
    },
  },

  data() {
    return {
      curStep: 1,
      steps: [],
      validaty: [],
      initial: [],
      btnWidth: 160,
      showWarning: false,
    };
  },

  created: function () {
    this.initialize();
  },

  methods: {
    initialize: function () {
      const keystr = Object.keys(this.headers);

      const keys = keystr.map((k) => parseInt(k));

      this.steps = keys;

      this.validaty = new Array(keys.length).fill(false);
      this.initial = new Array(keys.length).fill(true);
      this.editable = new Array(keys.length).fill(false);
    },

    load: function (record) {},

    getRecord: function () {
      return this.record;
    },

    onNext: function () {
      const step = this.curStep - 1;

      const forms = this.$refs.form;

      const form = forms[step];

      const valid = form.validate();

      this.validaty[step] = valid;

      if (valid) {
        this.editable[this.curStep - 1] = true;
        this.curStep += 1;
      }

      if (this.initial[step]) {
        this.initial[step] = false;
      }
    },

    onClickStep: function (n) {
      this.curStep = n + 1;
    },

    onPrevious: function () {
      const step = this.curStep - 1;

      this.editable[step] = false;

      this.curStep -= 1;
    },

    onFinish: function () {
      const step = this.curStep - 1;

      const forms = this.$refs.form;

      const form = forms[step];

      const valid = form.validate();

      this.validaty[step] = valid;

      if (valid) {
        this.$emit("finish", this.record);
      }
    },

    onClear: function () {
      const forms = this.$refs.form;

      const step = this.curStep - 1;

      forms[step].reset();
    },

    onHoverInNext: function () {
      const step = this.curStep - 1;

      this.showWarning = !this.validaty[step];
    },

    onHoverOutNext: function () {
      this.showWarning = false;
    },

    // downloadPDF: async function (name, title) {
    //   const pdfName = name ? name : "document";

    //   const doc = new jsPDF("portrait");

    //   let values = this.getRecord();

    //   const headerStart = [];
    //   const headers = this.headers;

    //   const model = this.fields.reduce(function (acc, val) {
    //     headerStart.push(acc.length);

    //     return acc.concat(val);
    //   }, []);

    //   const img = await getImageFromUrl("/imgs/dgt-logo.png");

    //   doc.addImage(img, "JPEG", 130, 20, 50, 18, "dgt-logo"); // Cache the image using the alias 'monkey'

    //   doc.setFontSize(22);

    //   let idx = 60;
    //   doc.setFontType("bold");
    //   doc.text(this.$t(title) + "\n", 100, idx, "center"); // Cache the image using the alias 'monkey'
    //   doc.setFontType("");
    //   doc.setFontSize(16);

    //   idx += 10;

    //   let firstPage = true;
    //   let count = 0;
    //   let currentHeader = "";
    //   let currentHeaderIdx = 0;

    //   const me = this;
    //   model.forEach(function (col, index) {
    //     const text = col.text;

    //     if (col.ignore || col.type === "file") {
    //       return;
    //     }

    //     if (count === 9) {
    //       doc.addPage();
    //       firstPage = false;
    //       count = 0;
    //       idx = 60;
    //     }

    //     if (headerStart[currentHeaderIdx] === index) {
    //       const subtitle = headers[currentHeaderIdx];

    //       idx += 16;

    //       currentHeaderIdx++;
    //       doc.setFontSize(18);
    //       doc.setFontType("bold");
    //       doc.text(me.$t(subtitle) + "\n", 35, idx, "left"); // Cache the image using the alias 'monkey'
    //       doc.setFontType("");
    //       doc.setFontSize(16);
    //     }

    //     let val;

    //     if (col.ignore) {
    //       return;
    //     }

    //     if (values[col.value]) {
    //       val = col.replace ? col.replace : values[col.value];
    //     }

    //     if (!values[col.value] && col.vueType === "v-switch") {
    //       val = me.$t("No");
    //     }

    //     if (col.type === "compositetpl") {
    //       const suffixes = col.suffixes;
    //       const prefixes = col.prefixes;
    //       const tplvalues = col.values;

    //       let str = "";

    //       tplvalues.forEach(function (tplv, i) {
    //         if (prefixes[i].length) {
    //           str += prefixes[i] + " ";
    //         }
    //         if (values[tplv]) {
    //           str += values[tplv] + " ";
    //         }
    //         if (suffixes[i].length) {
    //           str += suffixes[i] + " ";
    //         }
    //       });

    //       idx += 12;

    //       // doc.setFontType("bold");
    //       doc.text(me.$t(str), 35, idx);
    //       doc.setFontType("");
    //     } else if (col.type === "texttpl") {
    //       const suffix = col.suffix;
    //       const prefix = col.prefix;
    //       const tplvalue = col.value;

    //       let str = "";

    //       if (prefix && prefix.length) {
    //         str += prefix + " ";
    //       }
    //       if (values[tplvalue]) {
    //         str += values[tplvalue] + " ";
    //       }
    //       if (suffix && suffix.length) {
    //         str += suffix + " ";
    //       }

    //       idx += 12;

    //       // doc.setFontType("bold");
    //       doc.text(me.$t(str), 35, idx);
    //       doc.setFontType("");
    //     } else if (Array.isArray(val)) {
    //       let num = 0;
    //       val.forEach(function (v) {
    //         idx += 12;

    //         // doc.setFontType("bold");
    //         doc.text(me.$t(text) + " " + num + ": ", 35, idx);
    //         idx += 10;
    //         doc.setFontType("");
    //         doc.text(v.name, 45, idx);

    //         num++;
    //       });
    //     } else if (val) {
    //       idx += 12;

    //       // doc.setFontType("bold");
    //       doc.text(me.$t(text) + ": ", 35, idx);
    //       idx += 10;
    //       doc.setFontType("");
    //       doc.text("" + val, 45, idx);
    //     }

    //     count++;
    //   });

    //   doc.save(pdfName + ".pdf");
    // },
  },

  watch: {
    record: function (newRecord) {
      this.load(newRecord);
    },
  },
};
</script>

<style>
.hidden-stepper-header {
  visibility: hidden;
  height: 0;
}

.bullet-panel {
  padding: 30px 0;
  height: 100%;
  min-width: 70px;
  max-height: 60%;
  position: fixed;
}

.bullet-col {
  padding-left: 0;
  padding-right: 0;
}

/* .v-stepper_header {
  overflow: hidden;
  display: flex;
  flex-wrap: no-wrap;
  justify-content: left;
} */
</style>
