
/********************************
 *        DEPRECATED            *
 *                              *
 *   There is an axios plugin   *
 *   that parses the response   *
 *   for /api routes            *
 ********************************/
export default function ({ $axios, redirect }, inject) {
    // Create a custom get/post axios

    async function get(url) {
        console.log("[WARN] Deprecated api");

        return await $axios.get(url);
    }

    async function post(url, params) {
        console.log("[WARN] Deprecated api");

        return await $axios.post(url, params);
    }

    // Inject to context
    inject('api', {
        get: get,
        post: post
    });
}
