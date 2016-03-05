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

## ExpressJS Compatible

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