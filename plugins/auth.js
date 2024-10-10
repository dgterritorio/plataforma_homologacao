export default function ({ $auth }) {

    // Wait for change fn
    function storageChange(event) {
        if (event.key === "logged_in") {
            window.location.reload();
        }
    }

    // Listen to storage changes (across browser tabs)
    function register() {
        window.addEventListener("storage", storageChange, false);

        // Listen to login changes on @nuxtjs/auth
        $auth.$storage.watchState('loggedIn', newValue => {
            loginChange();
        })
    }

    // Change storage logged_in accress tabs
    function loginChange() {
        const text = window.localStorage.getItem("logged_in");

        const refresh = JSON.parse(text);

        window.localStorage.setItem("logged_in", JSON.stringify(!refresh));
    }

    if (process.client) {
        register();
    }
}
