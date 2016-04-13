module.exports = function(router, options) {

    router
        .title("Route Name")
        .describe("Router Description")
        .secure("Role", "Role2")
        .formats("html", "json", "xml", "txt")
        .defaultFormat("json")
        .error((err, req, res, next) => { });

    router.paths();

    router.call()
        .name("Some Call")
        .describe("Some Description")
        .process();

};
