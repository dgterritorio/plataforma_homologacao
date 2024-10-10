export default ({ app }, inject) => {
    inject('p', (url) => {
        if (url.charAt(0) === '/') {
            return app.router.options.base + url.substr(1);
        }
        return url;
    });
}