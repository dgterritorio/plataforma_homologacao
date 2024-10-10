<!--<template>
  <tr>
    <template v-for="(header, i) in headers">
      <td :key="`cell-${i}-${row[rowId]}`">
        <TemplatedCell
          v-if="vis[i]"
          :class="header.divider ? 'vst-divider' : ''"
          :style="`${header.rowstyle}`"
          :header="header"
          :item="row"
          :timeout="active ? 5 : 200"
          @rendered="onUpdate(i)"
        />
      </td>
    </template>
  </tr>
</template>-->
<script>
// import TemplatedCell from "./cell";

export default {
  // components: {
  //   TemplatedCell,
  // },

  props: {
    active: {
      type: Boolean,
      default: false,
    },

    index: {
      type: Number,
      default: 0,
    },

    row: {
      type: Object,
      default() {
        return {};
      },
    },

    rowId: {
      type: String,
      default: "$id",
    },

    headers: {
      type: Array,
      default() {
        return [];
      },
    },

    emitEvent: {
      type: Function,
      default() {
        return function () {};
      },
    },
  },

  // data() {
  //   return {
  //     vis: new Array(this.headers.length)
  //       .fill(false)
  //       .reduce((acc, curr, idx) => {
  //         acc[idx] = curr;
  //         return acc;
  //       }, {}),
  //   };
  // },

  // mounted: function () {
  //   console.log("Mounted: ", this);
  //   console.log(this.vis);
  //   this.vis[0] = true;
  // },

  methods: {
    onUpdate: function (index) {
      // console.log("EMITED", index);
      // if (index === this.vis.length) {
      //   this.$emit("rendered");
      //   return;
      // }
      // this.$refs.td[index + 1].shouldRender = true;
      // this.vis[index + 1] = true;
      // this.vis = {
      //   ...this.vis,
      // };
      // this.vis = [].concat(this.vis);
    },
  },

  render: function (h, context) {
    const { row, rowId } = this;

    const children = this.headers.map((header, idx) => {
      if (header.renderer.type === "simple") {
        let value = row[header.value];

        if (header.renderer && header.renderer.fn) {
          const { value: rendererValue, fn } = header.renderer;

          value = fn(row[rendererValue]);
        }

        return h("td", {
          key: `cell-${idx}-${row[rowId]}`,
          style: header.rowstyle,
          class: [
            header.divider ? "vst-divider" : "",
            header.align ? header.align : "",
          ],
          domProps: {
            innerHTML: value,
          },
        });
      } else {
        return h(header.renderer.cmp, {
          key: `cell-${idx}-${row[rowId]}`,
          style: header.rowstyle,
          class: [
            header.divider ? "vst-divivder" : "",
            header.align ? header.align : "",
          ],
          props: {
            header: header,
            item: row,
          },
        });
      }
    });

    return h("tr", {}, children);
  },
};
</script>
<style>
.vst-divider {
  /* border-right: thin solid rgba(0, 0, 0, 0.12); */
  box-shadow: inset -1px -1px 0 rgba(0, 0, 0, 0.12) !important;
}
</style>