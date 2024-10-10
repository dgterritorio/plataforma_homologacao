<template>
  <v-dialog v-model="show_" scrollable persistent max-width="700">
    <v-card>
      <v-card-title class="unselectable"
        >{{ $t("Chart Colors Configuration") }} <v-spacer />
        <v-btn icon @click="onClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" onSubmit="return false;">
          <v-row>
            <v-col v-if="!!series.length" cols="12" md="12" lg="12">
              <table style="table-layout: fixed; width: 100%">
                <thead>
                  <th>{{ $t("Measure") }}</th>
                  <th style="text-align: center; padding: 0 8px">
                    {{ $t("Color") }}
                  </th>
                  <th style="text-align: center; padding: 0 8px">
                    {{ $t("Opacity") }}
                  </th>
                </thead>
                <tbody>
                  <template v-for="(item, i) in series">
                    <SeriesColorPicker
                      :key="`color-picker-${i}`"
                      :title="item.title"
                      :value="record[item.key]"
                      v-model="record[item.key]"
                    />
                  </template>
                </tbody>
              </table>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Form actions -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="onClose">{{ $t("Cancel") }}</v-btn>
        <v-btn text color="primary" @click="onSave">{{ $t("Save") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import SeriesColorPicker from "./series-color-picker.vue";

export default {
  components: {
    SeriesColorPicker,
  },

  props: {
    series: {
      type: Array,
      default: function () {
        return [];
      },
    },

    record: {
      type: Object,
      default: function () {
        return {};
      },
    },

    show: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      show_: this.show,
    };
  },

  model: {
    prop: "show_",
    event: "show",
  },

  methods: {
    onClose: function () {
      // this.show_ = false;

      this.$emit("show", false);
    },

    onSave: function () {
      this.$emit("save", this.record);

      this.onClose();
    },
  },

  watch: {
    show: {
      handler: function (value) {
        this.show_ = value;
      },
    },
  },
};
</script>