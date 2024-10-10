<template>
  <v-row style="padding: 10px 0">
    <v-col :sm="10" :md="10" :lg="10" style="padding: 0">
      <v-row>
        <template v-for="(compositeValue, compositeIndex) in options.values">
          <div
            :key="'composite-prefix-' + compositeIndex"
            class="subtitle-1 font-weight-medium text--secondary ml-3"
          >
            {{ options.prefixes ? options.prefixes[compositeIndex] : "" }}
          </div>
          <Numberfield
            :key="'composite-field-' + compositeIndex"
            class="centered-input dense-input mx-3"
            :options="{
              validation: options.validation,
              system: 'pt-PT',
              hideIcons: true,
              hideDetails: true
            }"
            v-model="value[compositeValue]"
            style="max-width: 60px; height: 20px"
          ></Numberfield>
          <div
            :key="'composite-suffix-' + compositeIndex"
            class="subtitle-1 font-weight-medium text--secondary"
          >
            {{ options.suffixes ? options.suffixes[compositeIndex] : "" }}
          </div>
        </template>
      </v-row>
    </v-col>

    <v-col :sm="2" :md="2" :lg="2" style="padding: 0">
      <Icons :options="options" :explain="explain" class="mx-3"></Icons>
    </v-col>
  </v-row>
</template>

<script>
import Icons from "@/components/forms/fields/icons.vue";
import Numberfield from "@/components/forms/fields/number.vue";

export default {
  components: {
    Icons,
    Numberfield
  },
  props: {
    options: {
      type: Object,
      default: function () {
        return {};
      },
    },

    explain: {
      type: String,
      default: null,
    },

    model: null,
  },

  data() {
    return {
      value: null,

      error: null,

      rules: {
        required: (value) => {
          return !!value || this.$t("Required field");
        },
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
        integer: (value) => {
          return /^[0-9]+$/.test(value) || this.$t("Invalid Integer Number");
        },
        float: (value) => {
          return (
            /^[0-9]+(\.[0-9]+)?$/.test(value) || this.$t("Invalid Float Number")
          );
        },
      },
    };
  },

  created: function () {
    this.value = this.model;
  },

  model: {
    prop: "model",
    event: "change",
  },

  methods: {
    setRules: function (entry) {
      const rules = [];

      if (entry.required) {
        rules.push(this.rules.required);
      }

      if (entry.hasOwnProperty("validation")) {
        const validation = entry.validation;

        validation.forEach(function (key) {
          if (typeof key === "function") {
            rules.push(key);
          } else {
            switch (key) {
              case "email":
                rules.push(this.rules.email);
                break;
              case "number":
              case "int":
              case "integer":
                rules.push(this.rules.integer);
                break;

              case "float":
                rules.push(this.rules.float);
                break;
              default:
                break;
            }
          }
        }, this);
      }

      return rules;
    },
  },

  computed: {
    warningColor: function () {
      return this.error ? "red" : "warning";
    },
  },

  watch: {
    value: {
      handler: function (value) {
        this.$emit("change", value);
      },
    },

    model: {
      handler: function (value) {
        this.value = value;
      },
    },
  },
};
</script>
<style scoped>
.centered-input >>> input {
  text-align: center;
}

.dense-input >>> .v-input__slot {
  top: -5px;
}
</style>