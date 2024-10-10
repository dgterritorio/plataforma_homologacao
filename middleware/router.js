/**
 * Route protection middleware
 */
export default async function ({ store, redirect, req, next, route, from }) {
    let path = '';
    let loggedIn = false;
    let userInfo = null;

    if (process.server) {
        path = req.url;
        loggedIn = (req && req.session && req.session.userid);
        userInfo = req.session;
    } else if (process.client) {
        path = route.path;
        loggedIn = store.state.auth.loggedIn;
        userInfo = store.state.auth.user;
    }

    const routes = store.getters["routes/paths"];

    // Fail safe for infinite redirections
    if (from && from.path === path) {
        console.log("[Error] Infinite redirection...");

        return;
    }

    switch (path) {
        case '/':
            let rediUrl = (process.client && route &&
                route.query && route.query.redirect) ? route.query.redirect : '';
            if (rediUrl) {
                return redirect(rediUrl);
            }
        case '/error':
            // Available to everyone
            break;

        case '/user/logout':
        case '/user/confirmation':
        case '/user/change':
            // Ignore because this is handled by the auth module
            break;

        case '/user/login':
        case '/user/pwdchange':
        case '/user/pwdreset':
        case '/user/register':
            if (loggedIn) {
                return redirect('/user/profile');
            }

            break;
        default:
            if (!routes.includes(path)) {
                const parameterizedRoute = path.substring(0, path.lastIndexOf('/'));

                // If parameterized route not found
                if (!routes.includes(parameterizedRoute)) {

                    // if user is logged in --> block
                    if (loggedIn) {
                        return redirect('/error');
                    }

                    let routeExists = false;

                    // Check full route list
                    store.$router.options.routes.forEach(r => {
                        if (r.path.substring(0, r.path.lastIndexOf('/')) == parameterizedRoute) {
                            routeExists = true;
                        }
                    });

                    // If the route is not found --> block
                    if (!routeExists) {
                        return redirect('/error');
                    }

                    // else we give it a try by letting user log in
                    return redirect({
                        path: '/user/login/',
                        query: { redirect: path }
                    });
                }
            }

            break;
    }

    // do nothing here if we reach this
}
