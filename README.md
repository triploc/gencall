![Gentleman Caller](/gc.jpg "Gentleman Caller")

# Gentleman Caller

Express router extension for RESTful API's.

```javascript

var gencall = require("gencall");

var router = gencall.router({ 
    caseSensitive: false,
    mergeParams: false,
    strict: false
});

router.secure().get("api/:lang").params({
    lang: {
        type: "text",
        max: "10",
        tranform: "lowercase"
    }
}).execute(function(req, res, next) {
    router.client(req.params.lang, function(err, src) {
        res.write(src);
        res.end();
    });
});

```