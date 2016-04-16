![Gentleman Caller](/package.jpg "Gentleman Caller")

# Gentleman Caller

Express router extensions.

## Installation

    npm install gencall
    
Gentleman Caller is designed for use within Express apps.

## Applications

The simplest and most comprehensive way to use the module is with the `app` and `require` methods.

```javascript
gencall.app()
    .static("/static")
    .require("/app", __dirname + "/routes/app", { path: "/example" })
    .listen(80);
```

The `app` method returns an [Express]() app with `require` and `static` methods.  The `require` method uses the file system and javascript modules to define a route hierarchy.  Each javascript file that require processes is expected to be in the module form:

```javascript
module.exports = function(router, options) {
    // ...
};
```

* If `app.require` targets a ".js" file, only that file will be loaded.  
* If `app.require` targets a directory, it is recursively read; the path to the file (e.g. /app/routes.js) defines a url mount point (i.e. endpoints defined within route.js would be accessible at /app/route/*).  An index.js file will receive the folder-level router.

## Routers

Routers are where the magic happens.  An `app.require` call takes care of router generation and mounting behind the scenes, simply passing `router` objects into each module for wire-up.  Create a router manually with the `gencall.router` method using the same options that the `express.Router()` method takes.

```javascript
var gencall = require("gencall");

var router = gencall.router({ 
    caseSensitive: false,
    mergeParams: false,
    strict: false
});
```

A `gencall.router` is an `express.Router` will some extra stuff, mainly the `call` interface.  This is an API to make endpoing specification much more flexible.  Calls can handle embedded documentation, validation, and security directives.  The framework makes use of this endpoint metadata not just to generate interface enforcement mechanisms, but also to generate artifacts like documentation and client libraries.

It is necessary to maintain a strict `router` hierarchy to make proper use of interface metadata.  __IMPORTANT!__ Don't use `app.use` or `router.use` ([full explanation below](#metadata)).  Instead, use `router.mount(parent, paths)`, which is a bottom up assembly method.  This is taken care of automatically when using `app.require`.

```javascript
var app = express(),
    router = gencall.router(),
    sub = gencall.router();
    
router.mount(app, "/app");
sub.mount(router, "/sub");
```

## Calls

The `router.call` method returns a flexible interface for wiring up url handlers.  A `call` can register with one or more HTTP verbs and paths; it may specify an interface that carries out validation on parameters delivered though params, query, and body; it may expect `req.session` to be present pass certain security requirements.  Finally, it executes some logic, the result of which may be rendered to accomodate a preferred content format (e.g. json, xml, html).

```javascript
router.call()
    .name("Lang Call").
    .describe("Generates a client for this router.")
    .secure().get("api/:lang").params({
        lang: {
            type: "text",
            length: 10,
            tranform: "lowercase"
        }
    }).process(function(req, res, next) {
        router.generate(res.locals.lang, function(err, src) {
            res.write(src);
            res.end();
        });
    });
```

### call.secure([privileges]) <a id="call.secure"></a>

Requires that the request be made from an authenticated user.  If privileges are specified, the user must be authorized for those roles.  This directive may also be set at the router level (i.e. `router.secure([privileges])`).

```javascript
call.secure("admin", "superuser")
```

Gentleman Caller comes with a default security implementation that can be overridden.  It assumes that `req.session.authenticated` is set for an authenticated user and that `req.session.privileges` contains privileges for authorization.

```javascript
gencall.secure = function(req, res, next) { };
```

### call.params([inputs])

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
>
> __transform__: *text* – transforms textual case
> > capitalize, titleize, uppercase, lowercase, dasherize, parameterize, humanize, underscore, spacify, camelcase, titlecase

__Validation Parameters__

> __required__: *boolean* – cannot be missing or empty
>
> __language__: *text* – ensures text belongs to a specific alphabet
> > Arabic, Cyrillic, Greek, Hangul, Han, Kanji, Hebrew, Hiragana, Kana, Katakana, Latin, Thai, Devanagari
>
> __type__: *text* – ensures data type
> > integer, number, date, json, boolean, uuid, email, domain, url, ip, mac, phone, uuid, creditcard, base64, currency, ascii, alphanumeric, alpha, hexcolor, location, latitude, longitude
>
> __min__: *any* – a minimum value
>
> __max__: *any* – a maximum value
>
> __maxlength__: *integer* – a maximum length
>
> __minlength__: *integer* – a minimum length
>
> __hasNumber__: *boolean* – convenience flag to check if input has at least one digit
>
> __hasUppercase__: *boolean* – convenience flag to check if input has at least one uppercase character
>
> __hasLowercase__: *boolean* – convenience flag to check if input has at least one lowercase character
>
> __hasSymbol__: *boolean* – convenience flag to check if input has at least one symbol character
>
> __hasWhitespace__: *boolean* – convenience flag to check if input has whitespace
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

### call.METHOD(... url)

These methods will bind HTTP methods to the supplied URL route patterns.  In addition to standard Express methods, the `getpost` method will attach to both the GET and POST verbs.

```javascript
call.get("/one", "/two", "/three")
```

### call.process(... handlers)

If security and validation requirements are met, the execution logic behind the endpoint is invoked and the request is processed.

```javascript
call.process((req, res, next) => {
    next();
}, (req, res, next) => {
    // handle the call
})
```

Handlers can implement an `interface` property containing inputs to be passed to `params`.  In this way, handlers can be authored as reuseable components with execution logic tightly coupled to input validation directives.

```javascript
function handler(req, res, next) { next(); }

// This will accomplish the same thing...
call.params({ email: { type: "email" } }).process(handler);

// As this:
handler.interface = { email: { type: "email" } };
call.process(handler);
```

## Content Type Negotiation

Content type negotiation is supported through a few mechanisms.

### Override Middleware

The `gencall.contentTypeOverride` middleware looks for a file extension on the URL path and if found, overrides the `Accept` header with the mime type returned by [mime.lookup()](https://github.com/broofa/node-mime#mimelookuppath).  For example, url `http://localhost/some/path.json?q=xxx` will be rewritten as `http://localhost/some/path?q=xxx` and the `Accept: application/json;` header will be set.

```javascript
app.use(gencall.contentTypeOverride);
```

### Multi-Format Responses

A call may support multiple formats with the `call.formats(... formats)` directive and the `res.respond(data, template)` method.  The `call.defaultFormat(format)` directive can be used to specify a default format when no `Accept` header is present.  The `formats` and `defaultFormat` directives can also be set at the `router` level and will be inherited by sub-`router`'s and `calls` that do not override these directives explicitly.

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

## Create Artifacts <a id="artifacts"></a>

One of the most powerful features of Gentleman Caller is artifact creation.

### gencall.generate(template, options, cb)

Client code and documentation can be automatically generated from metadata and built-in templates.

> __template__: *text* – the desired output format 
> > docs, jquery, angular, node, csharp, java
>
> __options__: *object* – a set of options specific to the template format

### call.title(name) and call.describe(desc)

`Call` objects have `name` and `describe` methods which are used to generated documentation and client code.  `Router` objects have `title` and `describe` methods.  The discrepancy has to do with the way `express.Router` objects are constructed.

```javascript
gencall
    .router()
    .title("app")
    .describe("Contains main app routes.")
    .call()
        .title("app")
        .describe("Main route.")
        .get("/app")
        .execute((req, res, next) => { });
```

### Metadata <a id="metadata"></a>

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

# Method Documentation

### gencall.app()

The module exposes a top-level `app` method that returns a modified `express()` application object.  This instance has a `mount` method which invokes the top-level `mount` method, as well as a `static` method which is a convenience call for `app.use(express.static(root, options))`.

### gencall.mount(parent, filepath, options)

Constructs a route hierarchy from a file system hierarchy.  

__parent__ is a router or app.  
__filepath__ is either a file or directory of route modules.
__options__ are passed to constructed routers and route modules.

A route module (e.g. /routes/app/call.js) look like this:

```javascript
module.exports = function(router, options) {
    router.call().secure().get("/some-call").process(function(req, res, next) {
        res.respond({ data: "some data" });
    });
    
    // ...
};
```

The module is mounted at a url path that matches its file path.  For example, the above snippet would be hosted at `/example/routes/app/call/some-call`.  To mount endpoints at the parent-level, name a folder or file `index`.  For example, if the file above were named index.js, the call would be hosted at `/example/routes/app/some-call`.

## gencall.router([options])

The router object is a direct extension of the ExpressJS `Router` object.  So all the regular stuff works as expected.

```javascript
router.all(route, handler)
router.METHOD(route, handler)
router.param(name, handler)
router.route(route)
router.use([route], middleware)
```

View [docs here](http://expressjs.com/en/api.html#router "ExpressJS Router Docs").

### router.mount(parent, path)

A bottom up version of `use`.  "Mounting" rather than "using" allows routers to know their parents and establish `mountpath`'s all the way down the route hierarchy.  This approach supports [artifact generation](#artifacts).

### router.error(handler)

An error handler in the form of `function(err, req, res, next)` that will be appended to the end of all `call.process` handlers.

### router.secure([privileges])

Requires that the request be made from an authenticated user.  If privileges are specified, the user must be authorized for those roles.  See [call.secure](#call.secure) below for more info.

### router.paths()

An array of url paths where the `router` is mounted.  This is calculated by performing a cartesian combination of all `mountpath`'s up the route hierarchy.

### router.static(root, options)

A shortcut for `router.use(express.static(root, options))`.