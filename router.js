import Vue from 'vue'
import Router from 'vue-router'
import Config from './server/server-config.json'

Vue.use(Router)

export function createRouter(ssrContext, createDefaultRouter, routerOptions) {
    const options = routerOptions ? routerOptions : createDefaultRouter(ssrContext).options

    return new Router({
        ...options,
        routes: fixRoutes(options.routes)
    });
}

function fixRoutes(defaultRoutes) {
    const auxDict = {};
    const clientRoutes = [];
    const resArr = [];

    defaultRoutes.forEach(route => {
        // TODO: Detetar qual o cliente ativo
        const isClientRoute = /^\/client\/[^\/]*/.test(route.path);

        // Se a rota for uma rota de cliente, prioridade!
        if (isClientRoute) {
            // Testar se rota pertence ao cliente atual
            // TODO: verificar include de server-config.json
            let mtc = route.path.match(/^\/client\/([^\/]*)/);
            if (mtc[1].toLowerCase() == Config.ServerConfig.client.toLowerCase()) {
                const path = route.path.replace(/^\/client\/[^\/]*/, '');

                route.path = path;

                clientRoutes.push(path);

                auxDict[route.path] = route;
            }
            // Se a rota não existir e não for uma rota de cliente
        } else if (!clientRoutes.includes(route.path)) {
            auxDict[route.path] = route;
        }
    });

    Object.keys(auxDict).forEach(rk => {
        resArr.push(auxDict[rk]);
    });

    return resArr;
}
