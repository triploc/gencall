# Gentleman Caller

Express router extension for RESTful API's.

```javascript

var gencall = require("gencall");
gencall.invalid = function(req, res, err) {

};

var router = gencall.router({ 
    caseSensitive: false,
    mergeParams: false,
    strict: false
});

router.all(req, res, next);
router.METHOD(req, res, next);
router.param(req, res, next);
router.route(req, res, next);
router.use(req, res, next);

/*
    VERB = [ "get", "post", "getpost", "put", "delete", "head", "options", "all" ];
*/
router.api.VERB(route, {
    name: {
        type: "alphanumeric",
        max: "30",
        required: false
    }
}, function(req, res, next) {
    // Everything I need
    req.params;
    req.errors;
    req.verb;
    req.route;
});

router.api.get("api/:lang", {
    lang: {
        type: "text",
        max: "10",
        tranform: "lowercase"
    }
}, function(req, res, next) {
    router.client(req.params.lang, function(err, src) {
        res.write(src);
        res.end();
    });
});


```