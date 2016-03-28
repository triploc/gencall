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
    router.client(res.locals.lang, function(err, src) {
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

__IMPORTANT!__ Don't use `app.use` or `router.use` ([full explanation below](#metadata)).  Instead, use `router.mount(parent, paths)`, which is a bottom up assembly method.

```javascript
var app = express(),
    router = gencall.router(),
    sub = gencall.router();
    
router.mount(app, "/app");
sub.mount(router, "/sub");
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

Gentleman Caller comes with a default security implementation that can be overridden.  It assumes that `req.session.authenticated` is set for an authenticated user and that `req.session.privileges` contains privileges for authorization.

```javascript
gencall.secure = function(req, res, next) { };
```

### .params([inputs])

Performs validation on submitted parameters.  Values are looked for first in `req.params`, then in `req.query`, then in `req.body`.  All values are then collected in `res.locals`.

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
> > integer, number, date, json, boolean, uuid, email, domain, url, ip, mac, phone, uuid, creditcard, base64, currency, ascii, alphanumeric, alpha, hexcolor, location
>
> __min__: *any* – a minimum value
>
> __max__: *any* – a maximum value
>
> __maxlength__: *integer* – a maximum length
>
> __minlength__: *integer* – a minimum length
>
> __match__: *regex* – an exact value match, array of candidate values, or regular expression that must test true
>
> __custom__: *function* – a custom synchronous validation function

__Metadata Parameters__

> __source__: *string or array* – the source of the parameter (params, body, or query)
>
> __default__: *any* – a default value to assign when the parameter is missing or empty
>
> __locale__: *text* – a locale that effects the way `alpha`, `alphanumeric`, and `phone` data types are interpreted
>
> __description__: *text* – a description that can be used in generating documentation
>
> __abort__: *boolean* – determines if an invalid request aborts execution
>
> __error__: *text* – custom error message on failed validation

__Recursive Processing__

> __properties__: *object* – transformation and validation can be performed recursively on properties of an input

### .METHOD(... url)

These methods will bind HTTP methods to the supplied URL route patterns.  In addition to standard Express methods, the `getpost` method will attach to both the GET and POST verbs.

```javascript
call.get("/one", "/two", "/three")
```

### .process(... handlers)

If security and validation requirements are met, the execution logic behind the endpoint is invoked and the request is processed.

```javascript
call.process((req, res, next) => {
    next();
}, (req, res, next) => {
    // handle the call
})
```

## Content Type Negotiation

Content type negotiation is supported through a few mechanisms.

### Override Middleware

The `contentTypeOverride` middleware looks for a file extension on the URL path and if found, overrides the `Accept` header with the mime type returned by [mime.lookup()](https://github.com/broofa/node-mime#mimelookuppath).  For example, url `http://localhost/some/path.json?q=xxx` will be rewritten as `http://localhost/some/path?q=xxx` and the `Accept: application/json;` header will be set.

```javascript
app.use(gencall.contentTypeOverride);
```

### Multi-Format Responses

A call may support multiple formats with the `call.formats(... formats)` directive and the `res.respond(data, template)` method.  The `call.defaultFormat(format)` directive can be used to specify a default format when no `Accept` header is present.  The `formats` and `defaultFormat` directives can also be set at the `router` level and will be inherited by `calls` that do not override these directives explicitly.

```javascript
call.formats("json", "xml", "html")
    .process((req, res, next) => {
        res.respond({ field: "data" }, "template.ejs");
    });
```

The `respond` method will choose the first acceptable content type listed in the `formats` directive.  If the selected format is `html`, the template parameter is used in the `res.render` call.  Supported formats are: `html`, `json`, `xml`, and `text`.  If the `Accept` types specified cannot be accomodated, a HTTP 406 response is generated.

## Custom Behavior

Validation behavior can be modified by overriding the `gencall.validated(req, res, next)` method.  By default, if validation fails for a request parameter and the `abort` flag is set, the response status is set to 400 and request processing is aborted.

Security behavior can be modified by overriding the `gencall.secure(req, res, next)` method.  The default implementation assumes `req.session.authenticated` is set for an authenticated user and that `req.session.privileges` contains privileges for authorization.  A response status of 401 or 403 are set and request processing is aborted on failure.

## Create Artifacts

One of the most powerful features of Gentleman Caller is artifact creation.

### gencall.generate(template, options, cb)

Client code and documentation can be automatically generated from metadata and built-in templates.

> __template__: *text* – the desired output format 
> > docs, jquery, angular, node, csharp, java
>
> __options__: *object* – a set of options specific to the template format

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

### <a name="metadata">Metadata</a>

Artifact creation is facilitates through a structural comprehension of the application.  Gentleman Caller tracks the assembly of routing logic and utilizes validation requirements to gain this insight.

The major challenge is that `express.Router` has no sense of its place within an Express application.  It does not know how it is `use`'d, so we do not know how to formulate a full URL path to reach an endpoint.  To get around this, Gentleman Caller implements a `router.mount` method, which links a router to a `parent` and stores the `mountpath`.  This allows a `gencall.router` to implement a `router.paths()` method that traverses up the router's ancestry and returns an array of antecedent URL paths.

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