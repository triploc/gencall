module.exports = function(router, options) {

    router.call().getpost("/test").params({
        phone: { type: "phone", description: "mobile phone number" },
        email: { type: "email", description: "mail email address" }
    }).process((req, res, next) => {
        res.send("okay");
    });

};
