<template>
  <v-alert
    type="error"
    v-model="alert"
    border="left"
    dismissible
  >
    {{errorMsg}}
  </v-alert>
</template>

<script>
    export default {
        name: "basicAlert",

        data() {
            return {

                alert: false,
                alertTimeout: null,
                errorMsg: ''
            }
        },
        methods: {
            displayError: function (error) {
                if (this.alertTimeout) {
                    clearTimeout(this.alertTimeout);
                }

                const self = this;

                this.alert = true;

                this.errorMsg = error.message;

                this.alertTimeout = setTimeout(function () {
                    self.alert = false;
                }, 3000);
            }
        }
    }
</script>

<style scoped>

</style>
