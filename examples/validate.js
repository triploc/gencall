module.exports = function(router, options) {

    router.error((err, req, res, next) => {
        res.send(err.message);
    });

    // REQUIRED
    router.call().get("/required/true").params({
        value: { required: true }
    }).process((req, res, next) => {
        if (req.errors.length) {
            res.statusCode = 400;
            next(new Error("Required parameter missing."));
        }
        else res.send("Success");
    });

    router.call().get("/required/false").params({
        value: { }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // ABORT
    router.call().get("/abort/true").params({
        value: { required: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/abort/false").params({
        value: { required: true, abort: false }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // SOURCE
    router.call().get("/source/param/:value?").params({
        value: { source: "param", required: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/source/query").params({
        value: { source: "query", required: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().post("/source/nobody").params({
        value: { source: "body", required: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.use("/source/body", require("body-parser").urlencoded({ extended: false }));

    router.call().post("/source/body").params({
        value: { source: "body", required: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // DEFAULT
    router.call().get("/default/true").params({
        value: { type: "email", default: "a@a.com", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/default/false").params({
        value: { type: "email", default: "a", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // TRANSFORM
    router.call().get("/transform/sanitize").params({
        value: { sanitize: true }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/strip/all").params({
        value: { strip: true }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/strip/some").params({
        value: { strip: [ "b", "i" ] }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/compact").params({
        value: { compact: true }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/truncate").params({
        value: { truncate: 4 }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/words").params({
        value: { words: 8 }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/capitalize").params({
        value: { transform: "capitalize" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/titleize").params({
        value: { transform: "titleize" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/uppercase").params({
        value: { transform: "uppercase" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/lowercase").params({
        value: { transform: "lowercase" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/dasherize").params({
        value: { transform: "dasherize" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/parameterize").params({
        value: { transform: "parameterize" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/humanize").params({
        value: { transform: "humanize" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/underscore").params({
        value: { transform: "underscore" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/spacify").params({
        value: { transform: "spacify" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/camelcase").params({
        value: { transform: "camelcase" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/titlecase").params({
        value: { transform: "titlecase" }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    router.call().get("/transform/invalid").params({
        value: { transform: "invalid", abort: true }
    }).process((req, res, next) => {
        res.send(res.locals.value);
    });

    // LANGUAGE
    router.call().get("/language/arabic").params({
        value: { language: "Arabic", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/cyrillic").params({
        value: { language: "Cyrillic", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/greek").params({
        value: { language: "Greek", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/hangul").params({
        value: { language: "Hangul", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/han").params({
        value: { language: "Han", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/kanji").params({
        value: { language: "Kanji", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/hebrew").params({
        value: { language: "Hebrew", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/hiragana").params({
        value: { language: "Hiragana", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/kana").params({
        value: { language: "Kana", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/katakana").params({
        value: { language: "Katakana", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/latin").params({
        value: { language: "Latin", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/thai").params({
        value: { language: "Thai", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/language/devanagari").params({
        value: { language: "Devanagari", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // TYPES
    router.call().get("/types/text").params({
        value: { type: "text", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/integer").params({
        value: { type: "integer", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/number").params({
        value: { type: "number", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/date").params({
        value: { type: "date", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/json").params({
        value: { type: "json", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/boolean").params({
        value: { type: "boolean", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/uuid").params({
        value: { type: "uuid", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/email").params({
        value: { type: "email", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/domain").params({
        value: { type: "domain", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/url").params({
        value: { type: "url", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/ip").params({
        value: { type: "ip", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/mac").params({
        value: { type: "mac", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/phone").params({
        value: { type: "phone", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/creditcard").params({
        value: { type: "creditcard", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/base64").params({
        value: { type: "base64", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/hexidecimal").params({
        value: { type: "hexidecimal", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/currency").params({
        value: { type: "currency", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/ascii").params({
        value: { type: "ascii", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/alphanumeric").params({
        value: { type: "alphanumeric", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/alpha").params({
        value: { type: "alpha", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/hexcolor").params({
        value: { type: "hexcolor", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/latitude").params({
        value: { type: "latitude", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/longitude").params({
        value: { type: "longitude", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/types/location").params({
        value: { type: "location", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // MIN AND MAX
    router.call().get("/range").params({
        value: { type: "integer", min: 5, max: 10, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/length").params({
        value: { type: "text", minlength: 2, maxlength: 10, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // HAS*
    router.call().get("/has/number").params({
        value: { type: "text", hasNumber: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/has/uppercase").params({
        value: { type: "text", hasUppercase: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/has/lowercase").params({
        value: { type: "text", hasLowercase: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/has/symbol").params({
        value: { type: "text", hasSymbol: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/has/whitespace").params({
        value: { type: "text", hasWhitespace: true, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // MATCH
    router.call().get("/match/regexp").params({
        value: { type: "text", match: /[0-9][a-z]/, abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/match/selection").params({
        value: { type: "text", match: [ "option1", "option2" ], abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/match/value").params({
        value: { type: "text", match: "option", abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    router.call().get("/match/function").params({
        value: { type: "text", match: (value => value == "value"), abort: true }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // CUSTOM
    router.call().get("/custom").params({
        value: {
            type: "text",
            custom: (value, errors) => {
                if (value != "value") {
                    errors.push("This is bad.");
                }
            },
            abort: true
        }
    }).process((req, res, next) => {
        res.send("Success");
    });

    // PROPERTIES
    router.call().get("/properties").params({
        value: {
            type: "json",
            properties: {
                int: { type: "integer", min: 0, max: 20 },
                str: { type: "text", match: "okay" }
            },
            abort: true
        }
    }).process((req, res, next) => {
        res.send("Success");
    });


};
