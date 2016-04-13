module.exports = function(router, options) {

    router.error((err, req, res, next) => {
        res.send("Error");
    });

    var component = function(req, res, next) {
        res.send("Ok");
    };

    component.interface = {
        email: { type: "email", required: true }
    };

    router.call().get("/sample").process(component);

};
