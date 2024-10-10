<script>
import VCombobox from "vuetify/lib/components/VCombobox/VCombobox";

export default {
  // Extend the vuetify combobox
  extends: VCombobox,

  methods: {
    // Handler for tab key down
    onTabDown: function (e) {
      console.log("-- Tab down event supressed -- ", e);

      // Reset the search field
      this.internalSearch = null;

      // Hide menu
      this.isMenuActive = false;

      // Blur the component with the internalSearch = null
      this.blur(e);
    },
  },
};
</script>
