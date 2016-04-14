var gencall = require("../index");

module.exports = function(router, options) {

    router.use(function(req, res, next) {
        req.session = {
            authenticated: true
        };

        next();
    });

    router.secure()
        .formats("json", "xml")
        .defaultFormat("json")
        .error((err, req, res, next) => {
            res.respond({ error: "Error" });
        });

    var r1 = gencall.router(),
        r2 = gencall.router();

    r1.call().get("/sample").process(function(req, res, next) {
        res.respond("Hello");
    });

    r1.mount(router, "/r1");

    r2.call().get("/sample").process(function(req, res, next) {
        res.respond("Goodbye");
    });

    r2.mount(router, "/r2");

};
