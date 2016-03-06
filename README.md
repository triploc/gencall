![Gentleman Caller](/package.jpg "Gentleman Caller")

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
        length: 10,
        tranform: "lowercase"
    }
}).process(function(req, res, next) {
    router.client(req.params.lang, function(err, src) {
        res.write(src);
        res.end();
    });
});
```

## Create Routers

Create a router with the same options that the `express.Router()` method takes.

```javascript
gencall.router({ 
    caseSensitive: false,
    mergeParams: false,
    strict: false
});
```

The router object is a direct extension of the ExpressJS `Router` object.  So all the regular stuff works as expected.

```javascript
router.all(route, handler)
router.METHOD(route, handler)
router.param(name, handler)
router.route(route)
router.use([route], middleware)
```

View [docs here](http://expressjs.com/en/api.html#router "ExpressJS Router Docs").

## Caller Interface

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

### .params([inputs])

Performs validation on submitted parameters.  Values are looked for first in `req.params`, then in `req.query`, then in `req.body`.  All values are then collected in `req.params`.

```javascript
call.params({
    phone: { type: "phone" },
    email: { type: "email" }
})
```

These transformation operations and validation checks are performed in order.  When validation checks fail, the issues are recorded in `req.errors`.  If the `abort` parameter is true and there are validation errors, an HTTP 400 Invalid Request error will be thrown and the request will not be processed.

__Tranformation Parameters__

> __sanitize__: *boolean* – use Google Caja algorithm to remove script tags and other dangerous XSS vectors.
>
> __strip__: *boolean, text, or array* – strip all HTML tags, or just tags specified.
>
> __compact__: *boolean* – compact whitespace into single spaces.
>
> __truncate__: *integer* – truncate input at a given number of characters.
>
> __words__: *integer* – truncate input at a given number of words.

__Validation Parameters__

> __required__: *boolean* – cannot be missing or empty
>
> __language__: *text* – ensures text belongs to a specific alphabet
> > Arabic, Cyrillic, Greek, Hangul, Han, Kanji, Hebrew, Hiragana, Kana, Katakana, Latin, Thai, Devanagari
>
> __transform__: *text* – transforms textual case
> > capitalize, titleize, uppercase, lowercase, dasherize, parameterize, humanize, underscore, spacify, camelcase, titlecase
>
> __type__: *text* – ensures data type
> > integer, number, date, json, boolean, email, url, phone, uuid, creditcard, base64, currency, ascii, alphanumeric, alpha, location
>
> __min__: *any* – a minimum value
>
> __max__: *any* – a maximum value
>
> __maxlength__: *integer* – a maximum length
>
> __minlength__: *integer* – a minimum length
>
> __match__: *regex* – a regular expression that must test true
>
> __custom__: *function* – a custom synchronous validation function

__Metadata Parameters__

> __description__: *text* – a description that can be used in generating documentation.
>
> __abort__: *boolean* – determines if an invalid request aborts execution.

### .METHOD(... url)

These methods will bind HTTP methods to the supplied URL route patterns.  Valid methods are:

* GET
* POST
* GETPOST (GET OR POST)
* PUT
* PATCH
* DELETE
* HEAD
* OPTIONS
* TRACE
* ALL

```javascript
call.get("/one", "/two", "/three")
```

### .process(cb)

If security and validation requirements are met, the execution logic behind the endpoint is invoked and the request is processed.

```javascript
call.process((req, res, next) => {
    // handle the call
})
```

## Custom Behavior

Validation behavior can be modified by overriding the `gencall.validated(req, res, next)` method.  By default, if validation fails for a request parameter and the `abort` flag is set, the response status is set to 400 and request processing is aborted.

Security behavior can be modified by overriding the `gencall.secure(req, res, next)` method.  The default implementation assumes that `req.session.user` exists for an authenticated user and that `req.session.user.privileges` exists for authorization.  A response status of 401 or 403 are set and request processing is aborted on failure.

## Metadata

All routers that are created with the `gencall.router` are available through the `gencall.routers` array.

Each router keeps track of all `Call` objects through a `router.calls` array.

Each `Call` object maintains a list of routes (i.e. [ 'get', '/app' ]) in an array called `call.routes`.

```javascript
gencall.routers[0].calls[0].inputs;
```

The parameter metadata passed to the `call.params` method is stored in `call.inputs`.  When `call.secure` is called, `call.authenticated` is set to true and anny privileges passed are stored in `call.privileges`.

```javascript
gencall.routers[0].calls[0].inputs;
gencall.routers[0].calls[0].authenticated;
gencall.routers[0].calls[0].privileges;
```

### .name(name) and .describe(desc)

Both `Router` and `Call` objects have `name` and `describe` methods which are used to generated documentation and client code.

```javascript
gencall
    .router()
    .name("app")
    .describe("Contains main app routes.")
    .call()
        .name("app")
        .describe("Main route.")
        .get("/app")
        .execute((req, res, next) => { });
```

### gencall.autoGenerate(template, options, cb)

Client code and documentation can be automatically generated from metadata and built-in templates.

> __template__: *text* – the desired output format 
> > html, jquery, angular, node, csharp, java
>
> __options__: *object* – a set of options specific to the template format

