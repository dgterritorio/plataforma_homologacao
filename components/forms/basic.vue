<template>
  <v-form ref="form" v-model="valid__" onSubmit="return false;">
    <v-container style="padding: 0">
      <h3 ref="title" class="headline" v-if="!!title">{{ title }}</h3>

      <v-row align="end" justify="space-between" class="mt-1 mb-5 mr-6">
        <template v-for="(entry, n) in model">
          <v-col
            cols="12"
            :sm="12"
            :md="entry.cols ? entry.cols : 12"
            :lg="entry.cols ? entry.cols : 12"
            :key="n"
            style="padding: 0"
            v-if="
              !(entry.hasOwnProperty('ignore') && entry.cmp !== 'title') &&
              !entry.ignoreField &&
              (!entry.hasOwnProperty('condition') ||
                (entry.hasOwnProperty('condition2') &&
                  ((entry.condition2.hasOwnProperty('noteq') &&
                    record[entry.condition.prop] === entry.condition.value &&
                    record[entry.condition2.prop] !== entry.condition2.value) ||
                    (!entry.condition2.hasOwnProperty('noteq') &&
                      record[entry.condition.prop] === entry.condition.value &&
                      record[entry.condition2.prop] ===
                        entry.condition2.value))) ||
                (!entry.hasOwnProperty('condition2') &&
                  ((!entry.condition['noteq'] &&
                    entry.condition.hasOwnProperty('prop') &&
                    record[entry.condition.prop] === entry.condition.value) ||
                    (entry.condition['noteq'] &&
                      entry.condition.hasOwnProperty('prop') &&
                      record[entry.condition.prop] !== entry.condition.value) ||
                    (entry.condition.hasOwnProperty('exists') &&
                      !!record[entry.condition.exists]))))
            "
          >
            <v-container
              v-if="entry.cmp === 'title'"
              :key="'field-' + n"
              style="font-size: 1.2rem !important"
              :class="
                'subtitle font-weight-bold unselectable ml-4' +
                (n > 0 ? ' mt-8' : '')
              "
            >
              {{ $t(entry.text) }}
              <v-divider class="my-2 mb-4"></v-divider>
            </v-container>

            <component
              v-else
              :is="entry.cmp"
              :ref="'field-' + entry.value"
              :key="'field-' + n"
              :options="entry"
              :explain="
                entry.hasOwnProperty('explain')
                  ? explainKeys[entry.explain]
                  : null
              "
              class="ml-12"
              userClass="ml-12"
              :style="
                entry.cmp && entry.cmp.name === 'Textareafield'
                  ? 'min-width: 500px'
                  : ''
              "
              v-model="record[entry.value]"
              @change="onFieldChange($event, entry.emit)"
              @revalidate="validate"
            ></component>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  name: "BasicForm",

  props: {
    title: {
      type: String,
      default: null,
    },

    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    model: {
      type: Array,
    },

    valid: {
      type: Boolean,
      default: false,
    },

    dirty: {
      type: Boolean,
      default: false,
    },

    formId: {
      type: Number,
      default: 0,
    },
    editable: {
      type: Boolean,
      default: true,
    },

    pristineFromModel: {
      type: Boolean,
      default: false,
    },

    recreatePristine: {
      type: Boolean,
      default: true,
    },

    localExplain: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  model: {
    prop: "valid",
    event: "validation",
  },

  data() {
    return {
      visibles: {},

      valid__: false,

      dirty__: false,
      pristine: null,
      pristineCreated: false,
      dirtyFields: {},

      // Explains for fields
      explainKeys: {},
    };
  },

  created: function () {
    if (this.record && this.model) {
      this.initEval();

      this.load(this.record);
    }

    if (this.model) {
      this.fetchExplain(this.model);
    }
  },

  methods: {
    createPristine: function () {
      const model = this.model;
      let pristineRecord = {};
      const record = this.record ? this.record : {};

      if (model !== null && this.pristineFromModel) {
        // Create custom model
        model.forEach(function (entry) {
          const key = entry.value;

          if (key) {
            pristineRecord[key] = this.deepCopy(record[key]);
          }
        }, this);
      } else {
        pristineRecord = this.deepCopy(record);
      }

      this.pristine = pristineRecord;

      // If this is not the first instance, we reset validation
      const form = this.$refs.form;

      if (form) {
        this.$refs.form.resetValidation();
      }
    },

    createFromModel: function () {
      let record = {};

      if (this.model) {
        this.model.forEach(function (entry) {
          const key = entry.key;

          record[key] = null;
        });
      }

      this.pristine = pristineRecord;

      return record;
    },

    load: function (record) {
      this.dirtyFields = [];

      // If pristine not created
      if (!this.pristineCreated) {
        this.pristine = {};

        // Created either from form definition of model
        if (record) {
          this.createPristine();
        } else {
          this.createFromModel();
        }

        this.pristineCreated = true;

        // If we allow recreating pristine on record change
      } else if (this.recreatePristine) {
        this.pristine = {};

        // Created either from form definition of model
        if (record) {
          this.createPristine();
        } else {
          this.createFromModel();
        }

        this.pristineCreated = true;
      }

      this.editing = record && Object.keys(record).length > 0;

      this.updateDirty(false);
    },

    clean: function () {
      this.pristine = {};

      this.updateDirty(false);
    },

    reset: function () {
      const keys = Object.keys(this.pristine);
      const record = this.record;

      keys.forEach(function (key) {
        record[key] = this.deepCopy(this.pristine[key]);
      }, this);

      this.updateDirty(false);

      const form = this.$refs.form;

      if (form) {
        this.$refs.form.resetValidation();
      }
    },

    deepCopy: function (original) {
      let copied;

      if (typeof original !== "object") {
        return original;
      }

      try {
        copied = JSON.parse(JSON.stringify(original));
      } catch (e) {
        console.log("> Error parsing value");
      }

      return copied;
    },

    validate: function () {
      this.$refs.form.validate();

      return this.valid__;
    },

    getRecord: function () {
      return this.record;
    },

    getPristine: function () {
      return this.pristine;
    },

    getDirty: function () {
      const pristine = this.getPristine();

      const record = this.getRecord();

      const keys = Object.keys(record);

      const dirty = {};

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        const value = record[key];

        if (!pristine.hasOwnProperty(key) || pristine[key] !== value) {
          dirty[key] = value;
        }
      }

      return dirty;
    },

    updateDirty: function (dirty) {
      if (this.dirty__ !== dirty) {
        this.dirty__ = dirty;

        this.$emit("dirty", dirty);
      }
    },

    initEval: function () {
      this.visibles = {};

      this.model.forEach(function (entry, idx) {
        this.visibles[idx] = true;
      }, this);
    },

    evalCondition: function (condition) {
      const record = this.record;
      let show = false;

      if (condition.hasOwnProperty("exists")) {
        show = !!record[condition.exists];
      } else if (condition.hasOwnProperty("noteq")) {
        show = record[condition.prop] !== condition.value;
      } else {
        show = record[condition.prop] === condition.value;
      }

      return show;
    },

    reEval: function () {
      const model = this.model;
      const visibles = this.visibles;

      model.forEach(function (entry, idx) {
        const value = entry.value;
        const conditions = entry.condition;

        if (!conditions) {
          visibles[idx] = true;

          return;
        }

        if (Array.isArray(conditions)) {
          let valid = true;
          for (let i = 0; i < conditions.length; i++) {
            if (!this.evalCondition(conditions[i])) {
              valid = false;

              break;
            }
          }

          visibles[idx] = valid;
          return;
        } else {
          visibles[idx] = this.evalCondition(conditions);
        }

        //     || (entry.hasOwnProperty('condition2') && entry.condition2.hasOwnProperty('noteq') && record[entry.condition.prop] === entry.condition.value && record[entry.condition2.prop] !== entry.condition2.value)
        //     || (entry.hasOwnProperty('condition2') && !entry.condition2.hasOwnProperty('noteq') && record[entry.condition.prop] === entry.condition.value && record[entry.condition2.prop] === entry.condition2.value)
        //     || (!entry.condition['noteq'] && entry.condition.hasOwnProperty('prop') && record[entry.condition.prop] === entry.condition.value)
        //     || (entry.condition['noteq'] && entry.condition.hasOwnProperty('prop') && record[entry.condition.prop] !== entry.condition.value)
        //     || (entry.condition.hasOwnProperty('exists') && !!record[entry.condition.exists])
        // -->
      }, this);
    },

    fetchExplain: async function (fields) {
      const explain = fields
        .filter((field) => field.hasOwnProperty("explain"))
        .map((field) => field.explain);

      if (explain.length) {
        try {
          const result = await this.$axios.post("/api/explain/getall", {
            fields: explain,
          });

          if (result.error) {
            throw result.error;
          }

          const data = result.data;

          const keyVal = {};

          data.forEach(function (row) {
            keyVal[row.field_key] = row.body;
          });

          if (Object.keys(this.localExplain).length > 0) {
            this.explainKeys = Object.assign(this.localExplain, keyVal);
          } else {
            this.explainKeys = keyVal;
          }
        } catch (e) {
          // console.log(e);
        }
      }
    },

    updateExplain: function (key, value) {
      this.explainKeys[key] = value;
    },

    onFieldChange: function (value, emit) {
      this.updateDirty(true);

      if (emit) {
        this.$emit(emit, value);
      }
    },
  },

  watch: {
    record: {
      handler: function (newRecord, oldRecord) {
        // if (!oldRecord) {
        this.load(newRecord);
        // }
      },
    },

    valid__: {
      handler: function (val) {
        this.$emit("validation", val);

        return val;
      },
    },
  },
};
</script>

<style>
.indent-field {
  margin: 0 0 0 30px;
}
</style>
