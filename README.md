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

## Express compatible

The router object is compatible the Express Router object.  

```javascript
router.all(route, handler)
router.METHOD(route, handler)
router.param(name, handler)
router.route(route)
router.use([route], middleware)
```

## Caller interface

The `router.call()` method returns the main Gentleman Caller interface.

### .secure([privileges])

Requires that the request be made from an authenticated user.  If privileges are specified, the user must be authorized for those roles.

```javascript
call.secure("admin", "superuser")
```

Gentleman Caller comes with a default security implementation that can be overridden.  It assumes that `req.session.user` exists for an authenticated user and that `req.session.user.privileges` exists for authorization.

```javascript
gencall.secure = function(req, res, next) { };
```

### .params([interface])

Performs validation on submitted parameters.  Values are looked for first in `req.params`, then in `req.query`, then in `req.body`.  All values are then collected in the `req.params`.

```javascript
call.params({
    phone: { type: "phone" },
    email: { type: "email" }
})
```

__Validation and Tranformation Parameters__

required
> cannot be missing or empty

### .METHOD(... url)

These methods will bind HTTP methods to the supplied URL route patterns.  Valid methods are:

* get
* post
* getpost
* put
* patch
* delete
* head
* options
* trace
* all

```javascript
call.get("/one", "/two", "/three")
```

### .execute(cb)

If security and validation requirements are met, the execution logic behind the endpoint is invoked.

```javascript
call.execute((req, res, next) => {
    // handle the call
})
```