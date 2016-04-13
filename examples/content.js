var gencall = require("../index");

module.exports = function(router, options) {

    router.use(gencall.contentTypeOverride);

    router.call().get("/sample")
        .formats("json", "txt", "xml", "html")
        //.defaultFormat("json")
        .process((req, res, next) => {
            res.respond({
                field: "Hello",
                array: [ 1, 2, 3 ],
                object: {
                    sub: "Hello",
                    sub2: "Goodbye"
                }
            });
        });

};
