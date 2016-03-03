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

router.call().secure().get("api/:lang").params({
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

The router object is compatible the Express Router object.  The `router.call()` method returns the main Gentleman Caller interface.

### .secure([privileges])

Requires that the request be made from an authenticated user.  If privileges are specified, the user must be authorized for those roles.

Gentleman Caller comes with a default security implementation that can be overridden.  It assumes that `req.session.user` exists for an authenticated user and that `req.session.user.privileges` exists for authorization.

```javascript
gencall.secure = function(req, res, next) { };
```

### .params([interface])

```javascript
call.params({
    phone: { type: "phone" }
})
```

### .METHOD(... url)

```javascript
call.get("/one", "/two", "/three")
```

### .execute(cb)

```javascript
call.execute((req, res, next) => {
    // handle the call
})
```