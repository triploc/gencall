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

These transformation operations and validation checks are performed in order.  When validation checks fail, the issues are recorded in `req.errors`.  If the `validate` parameter is true and there are validation errors, an HTTP 400 Invalid Request error will be thrown and the route the logic will not be executed.

__Tranformation Parameters__

> __sanitize__ *boolean*
> Use Google Caja algorithm to remove script tags and other dangerous XSS vectors.

> __strip__ *boolean, text, or array*
> Strip all HTML tags, or just tags specified.

> __compact__ *boolean*
> Compact whitespace into single spaces.

> __truncate__ *integer*
> Truncate input at a given number of characters.

> __words__ *integer*
> Truncate input at a given number of words.

__Validation Parameters__

> __required__ *boolean*
> Cannot be missing or empty

> __language__ *text*
> Ensures text belongs to a specific alphabet
> > Arabic, Cyrillic, Greek, Hangul, Han, Kanji, Hebrew, Hiragana, Kana, Katakana, Latin, Thai, Devanagari

> __transform__ *text*
> Transforms textual case
> > capitalize, titleize, uppercase, lowercase, dasherize, parameterize, humanize, underscore, spacify, camelcase, titlecase

> __type__ *text*
> Ensures data type
> > integer, number, date, json, boolean, email, url, phone, uuid, creditcard, base64, currency, ascii, alphanumeric, alpha, location

> __min__ *any*
> A minimum value

> __max__ *any*
> A maximum value

> __length__ *integer*
> A maximum length

> __minlength__ *integer*
> A minimum length

> __match__ *regex*
> A regular expression that must test true

> __custom__ *function*
> A custom synchronous validation function

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