module.exports = function(router, options) {

    router.use("/auth", (req, res, next) => {
        req.session = {
            authenticated: true,
            privileges: [ "role" ]
        };

        next();
    });

    router.error((err, req, res, next) => {
        res.send("Fail");
    });

    router.call().secure("role").get("/auth/200/priv").process((req, res, next) => {
        res.send("Ok");
    });

    router.call().secure().get("/auth/200").process((req, res, next) => {
        res.send("Ok");
    });

    router.call().secure().get("/401").process((req, res, next) => {
        res.send("Ok");
    });

    router.call().secure("other").get("/auth/403").process((req, res, next) => {
        res.send("Ok");
    });

};
