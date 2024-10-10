export default function ({ isHMR, app, store, route, req, params, error, redirect}) {
    // If middleware is called from hot module replacement, ignore it
    if (isHMR) return;

    // Server-side only for now
    if (process.server) {
        const session_locale = req && req.session && req.session.lang ? req.session.lang : null;

        let locale = '';

        if (store.state.locales.indexOf(session_locale) === -1) {
            locale = app.i18n.fallbackLocale;
        } else {
            locale = session_locale;
        }

        //Mutate the store's locale once we understand which locale is being requested prior to each page render
        store.commit('SET_LANG', locale)
        // Set locale from the query string '?lang='**''
        app.i18n.locale = store.state.locale;
    }
    

    // const defaultLocale = req.session && req.session.lang ? req.session.lang : app.i18n.fallbackLocale;
    // If middleware is called from hot module replacement, ignore it
    // if (isHMR) return
    // const locale = route.query.lang || defaultLocale
    // if (store.state.locales.indexOf(locale) === -1) {
    //     return error({ message: 'This page could not be found.', statusCode: 404 })
    // }
    //Mutate the store's locale once we understand which locale is being requested prior to each page render
    // store.commit('SET_LANG', locale)
    // Set locale from the query string '?lang='**''
    // app.i18n.locale = store.state.locale;

    //     // If route is /<defaultLocale>/... -> redirect to /...
    //     if (locale === defaultLocale && route.fullPath.indexOf('/' + defaultLocale) === 0) {
    //         const toReplace = '^/' + defaultLocale + (route.fullPath.indexOf('/' + defaultLocale + '/') === 0 ? '/' : '')
    //         const re = new RegExp(toReplace)
    //         return redirect(
    //           route.fullPath.replace(re, '/')
    //         )
    //   }
}