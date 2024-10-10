<script>
export default {
  methods: {
    async logout() {
      try {
        await this.$auth.logout();

        // Clear stores
        if (this.$store.$db().hasOwnProperty("entities")) {
          for (let i = 0; i < this.$store.$db().entities.length; i++) {
            let e = this.$store.$db().entities[i];
            await e.model.setAuthDirty();
          }
        }

        // Request new navigation tree
        await this.$store.dispatch("routes/updateUserId", {
          userid: null,
        });

        this.$root.$emit("auth-update");
        this.$router.push("/");
      } catch (e) {
        console.log("Logout error");
      }
    },
  },
  render() {
    this.logout();
  },
};
</script>
