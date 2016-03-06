require("sugar");

var express = require("express"),
    validator = require("validator"),
    sanitize = require('google-caja').sanitize,
    ejs = require("ejs"),
    fs = require("fs");

exports.routers = [ ];

exports.router = function(options) {
    var r = express.Router(options);
    
    r.name = function(name) {
        r.namespace = name;
        return r;
    };
    
    r.describe = function(desc) {
        r.description = desc;
        return r;
    };
    
    r.secure = function() { 
        r.authenticated = true;
        r.privileges = Array.create(arguments).compact(true);
        return me;
    };
    
    r.attachTo = function(parent, path) {
        r.path = path;
        parent.use(path, r);
    };
    
    r.calls = [ ];
    
    r.call = function() {
        var call = new Call(r);
        call.router = r;
        r.calls.push(call);
        return call;
    };
    
    exports.routers.push(r);
    return r;
};

exports.secure = function(req, res, next) {
    if (req.authenticated && !req.session.user) {
        res.statusCode = 401;
        next(new Error("Unauthenticated"));
        return;
    }
    
    if (req.privileges && req.privileges.length) {
        if (req.session.user.privileges) {
            if (req.privileges.intersect(req.session.user.privileges).length > 0) {
                next();
            }
        }
    }
    
    res.statusCode = 403;
    next(new Error("Unauthorized"));
};

exports.validated = function(req, res, next) {
    if (abort) {
        res.statusCode = 400;
        next(new Error("Invalid request"));
    }
    else {
        next();
    }
};

function Call(router) {
    
    var me = this;
    
    this.routes = [ ];
    
    this.name = function(name) {
        me.title = name;
        return name;
    };
    
    this.describe = function(desc) {
        me.description = desc;
        return name;
    };
    
    this.secure = function() { 
        me.authenticated = true;
        me.privileges = Array.create(arguments).compact(true);
        return me;
    };
    
    this.params = function(params) {
        me.inputs = params;
        return me;
    };
    
    this.all = this.ALL = function() {
        me.routes.add([ "all" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.get = this.GET = function() {
        me.routes.add([ "get" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.getpost = this.GETPOST = function() {
        me.routes.add([ "get", "post" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.post = this.POST = function() {
        me.routes.add([ "post" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.put = this.PUT = function() {
        me.routes.add([ "put" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.patch = this.PATCH = function() {
        me.routes.add([ "patch" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.delete = this.DELETE = function() {
        me.routes.add([ "delete" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.head = this.HEAD = function() {
        me.routes.add([ "head" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.options = this.OPTIONS = function() {
        me.routes.add([ "options" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.trace = this.TRACE = function() {
        me.routes.add([ "trace" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.process = function(cb) {
        me.routes.forEach(function(route) {
            router[route.first()](
                route.last(), 
                function(req, res, next) {
                    req.authenticated = me.authenticated || me.router.authenticated;
                    req.privileges = me.router.privileges ? me.router.privileges.union(me.privileges).compact(true) : me.privileges;
                    req.verb = route.first();
                    req.route = route.last();
                    req.inputs = me.inputs;
                    next();
                }, 
                exports.secure,
                validateRequest,
                exports.validated,
                cb
            );
        });
    }
    
}

function validateRequest(req, res, next) {
    var inputs = req.inputs, 
        output = { }, 
        errors = [ ],
        abort = false;
    
    Object.keys(inputs).forEach(function(key) {
        var value = null, 
            input = inputs[key], 
            err = [ ];
        
        if (req.params && req.params[key]) value = req.params[key];
        else if (req.query && req.query[key]) value = req.query[key];
        else if (req.body && req.body[key]) value = req.body[key];
        output[key] = value;
        
        validateInput(key, input, value, err);
        
        if (err.length) {
            errors.push({ key: key, value: value, errors: err });
            if (input.abort) abort = true;
        }
    });
    
    req.errors = errors;
    req.params = output;
    req.abort = abort;
    
    next();
}

function validateInput(key, input, value, errors) {
    if (input.sanitize && value) {
        value = sanitize(value);
    }

    if (input.strip && value) {
        if (Object.isBoolean(input.strip)) value = value.stripTags();
        else value = value.stripTags(input.strip);
    }

    if (input.compact && value) {
        value = value.compact();
    }

    if (input.truncate) {
        value = value.truncate(input.truncate);
    }

    if (input.words) {
        value = value.truncateOnWord(input.words);
    }

    if (input.required && (!value || value.trim() == "")) {
        errors.push(`${key} cannot be missing.`);
    }
    else if (!input.required && !value) {
        value = "";
    }

    if (input.language && value) {
        var languages = [
            "Arabic", "Cyrillic", "Greek", "Hangul", "Han",
            "Kanji", "Hebrew", "Hiragana", "Kana", "Katakana",
            "Latin", "Thai", "Devanagari"
        ];

        input.language = input.language.trim().capitalize();
        if (languages.indexOf(input.language) >= 0) {
            if (value["is" + input.language]()) {
                error.push(`${key} is not ${input.language}.`);
            }
        }
    }

    if (input.transform && value) {
        input.transform = input.transform.toLowerCase();
        if (input.transform == "capitalize") value = value.capitalize();
        else if (input.transform == "titleize") value = value.titleize();
        else if (input.transform == "uppercase") value = value.toUpperCase();
        else if (input.transform == "lowercase") value = value.toLowerCase();
        else if (input.transform == "dasherize") value = value.dasherize();
        else if (input.transform == "parameterize") value = value.parameterize();
        else if (input.transform == "humanize") value = value.humanize();
        else if (input.transform == "underscore") value = value.underscore();
        else if (input.transform == "spacify") value = value.spacify();
        else if (input.transform == "camelcase") value = value.toCamelCase(true);
        else if (input.transform == "titlecase") value = value.toCamelCase();
    }

    if (input.type) {
        var type = input.type.toLowerCase();
        if (value && type == "text") value = value.toString();
        else if (value && type == "integer") {
            try {
                value = parseInt(value);
            }
            catch (ex) {
                errors.push(`${key} is not an integer.`);
            }
        }
        else if (value && type == "number") {
            try {
                value = parseFloat(value);
            }
            catch (ex) {
                errors.push(`${key} is not a number.`);
            }
        }
        else if (value && type == "date") {
            try {
                value = Date.create(value);    
            }
            catch (ex) {
                errors.push(`${key} is not a date.`);
            }
        }
        else if (value && type == "json") {
            try {
                value = JSON.parse(value);    
            }
            catch (ex) {
                errors.push(`${key} is not an object.`);
            }
        }
        else if (value && type == "boolean") {
            value = (value.toLowerCase() == "true");
        }
        else if (value && type == "uuid") {
            if (!validator.isUUID(value)) {
                errors.push(`${key} is not a UUID.`);
            }
        }
        else if (value && type == "email") {
            if (!validator.isEmail(value)) {
                errors.push(`${key} is not an email address.`);
            }
        }
        else if (value && type == "domain") {
            if (!validator.isFQDN(value)) {
                errors.push(`${key} is not a domain.`);
            }
        }
        else if (value && type == "url") {
            if (!validator.isURL(value)) {
                errors.push(`${key} is not a URL.`);
            }
        }
        else if (value && type == "ip") {
            if (!validator.isIP(value)) {
                errors.push(`${key} is not an IP address.`);
            }
        }
        else if (value && type == "mac") {
            if (!validator.isMACAddress(value)) {
                errors.push(`${key} is not a MAC address.`);
            }
        }
        else if (value && type == "phone") {
            if (!validator.isMobileNumber(value, input.locale)) {
                errors.push(`${key} is not a phone.`);
            }
        }
        else if (value && type == "uuid") {
            if (!validator.isUUID(value)) {
                errors.push(`${key} is not a unique identifier.`);
            }
        }
        else if (value && type == "creditcard") {
            if (!validator.isCreditCard(value)) {
                errors.push(`${key} is not a valid credit card number.`);
            }
        }
        else if (value && type == "base64") {
            if (!validator.isBase64(value)) {
                errors.push(`${key} is not a base-64 string.`);
            }
        }
        else if (value && type == "currency") {
            if (!validator.isCurrency(value)) {
                errors.push(`${key} is not a currency.`);
            }
        }
        else if (value && type == "ascii") {
            if (!validator.isAscii(value)) {
                errors.push(`${key} is not ascii text.`);
            }
        }
        else if (value && type == "alphanumeric") {
            if (!validator.isAlphanumeric(value, input.locale)) {
                errors.push(`${key} is not alphanumeric text.`);
            }
        }
        else if (value && type == "alpha") {
            if (!validator.isAlpha(value, input.locale)) {
                errors.push(`${key} is not alphabetical text.`);
            }
        }
        else if (value && type == "hexcolor") {
            if (!validator.isHexColor(value)) {
                errors.push(`${key} is not a hex color.`);
            }
        }
        else if (value && type == "location") {
            value = value.split(",").compact(true);
        }
    }

    if (input.min || input.max) {
        if (input.min && input.min >= value) {
            errors.push(`${key} must be greater than ${input.min}.`);
        }

        if (input.max && input.max <= value) {
            errors.push(`${key} must be less than ${input.max}.`);
        }
    }

    if (input.maxlength && value.length) {
        if (input.maxlength > value.length) {
            errors.push(`${key} must be shorter than ${input.length}.`);
        }
    }

    if (input.minlength && value.length) {
        if (input.minlength > value.length) {
            errors.push(`${key} must be longer than ${input.minlength}.`);
        }
    }

    if (input.match) {
        if (Object.isRegExp(input.match)) {
            if (!input.match.test(value)) {
                errors.push(`${key} is not valid.`);
            }    
        }
        else if (Array.isArray(input.match)) {
            if (input.match.indexOf(value) < 0) {
                errors.push(`${key} is not valid.`);
            }
        }
        else if (input.match != value) {
            errors.push(`${key} does not match ${value}.`);
        }
    }

    if (input.custom) {
        !input.custom(value, errors);
    }
    
    if (input.properties) {
        var keys = Object.keys(input.properties);
        keys.forEach(function(key) {
            validateInput(key, input.properties[key], value[key], errors);
        });
    }
}

exports.autoGenerate = function(template, options, cb) {
    template = template.toLowerCase();
    if (cb == null && Object.isFunction(options)) {
        cb = options;
        options = { };
    }
    
    var filename = __dirname + "/templates/" + template + ".ejs";
    fs.readFile(filename, function(err, data) {
        if (err) cb(err);
        else {
            var output = null;
            try {
                output = ejs.render(data.toString(), { 
                    routers: exports.routers,
                    options: options
                }, { filename: filename });
            }
            catch (ex) {
                cb(ex);
                return;
            }

            cb(null, output);
        }
    });
};