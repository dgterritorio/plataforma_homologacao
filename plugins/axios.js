export default function ({ $axios, redirect, store, app }) {

    // Set default timeout to 2 min
    $axios.defaults.timeout = 120000;

    const appBase = app.router.options.base;
    const urlPrefix = appBase ? appBase.slice(0, -1) : '';
    const apiPrefix = '/api';

    $axios.onRequest(config => {
        if (urlPrefix && config.url.charAt(0) === '/') {
            config.url = urlPrefix + config.url;
        }

        // If we are in a critical error state, refuse all requests
        if (store.getters['crashed']) {
            return Promise.reject("Inconsistent state");
        }

        // Show progress overlay
        const showProgess = config.progress;

        if (showProgess) {
            store.commit('SET_LOADING', true);
        }
    });

    $axios.onResponse(payload => {
        const response = payload.data,
            config = payload.config,
            url = config.url;
        const showProgess = config.progress;

        // Hide progress overlay
        if (showProgess) {
            store.commit('SET_LOADING', false);
        }

        // If the access point was an api access then we parse accordingly
        if (url.startsWith(urlPrefix + apiPrefix)) {
            return { data: response.data, error: response.error, total: response.total };
        } else {
            return payload;
        }
    });

    $axios.onError(payload => {
        try {
            const response = payload.response;
            const config = payload.config;
            const showProgess = config.progress;

            // Hide progress overlay
            if (showProgess) {
                store.commit('SET_LOADING', false);
            }

            // TODO: This should be onResponseError rather than onError
            if (response) {
                const code = parseInt(response && response.status)
                const data = response.data;
                const error = data.error;
                let msg;

                if (code === 400) {
                    redirect('/400');
                }

                if (code === 404) {
                    if (process.server) {
                        console.info(" -- erro no axios do lado do servidor -- ");
                        // console.info(response);
                        return;
                    }

                    msg = 'Não foi possível contactar o servidor'
                } else if (code > 400 && code < 500) {
                    msg = error && error.hasOwnProperty('msg') ? error.msg : 'Erro inesperado'; // TODO: Default message

                } else if (code === 500) {
                    msg = 'Erro inesperado'
                    // store.commit("SET_CRASHERROR", { status: code, msg: msg });
                }

                store.commit('SET_SYSTEMMSG', {
                    text: msg,
                    color: 'red',
                    icon: 'mdi-alert'
                });
            } else {
                // TODO: Process errors for unresolved requests
                // store.commit("SET_CRASHERROR", { status: 500, msg: 'The application is in an inconsistent state. We advise refreshing the page or pressing the refresh button.' });
            }
        } catch (e) {
            console.log("> Error: parsing response error");
        }
    });

    // $axios.onRequestError(function (error) {
    //     console.log(error);
    // });

    $axios.onResponseError(function (error) {
        console.log("Response error");

        // If the request exceeded the axios timeout
        if (error && error.code === 'ECONNABORTED') {
            store.commit('SET_SYSTEMMSG', {
                text: 'Não foi possível obter a resposta do servidor',
                color: 'red',
                icon: 'mdi-alert'
            });
        }
    });
}
