module.exports = function(router, options) {

    router
        .title("Route Name")
        .describe("Router Description")
        .secure("Role", "Role2")
        .formats("html", "json", "xml", "txt")
        .defaultFormat("json")
        .error((err, req, res, next) => {
            console.log(err);
        });

    router.paths();

};
