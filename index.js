require("sugar");

var express = require("express"),
    validator = require("validator"),
    sanitize = require('google-caja').sanitize,
    ejs = require("ejs"),
    fs = require("fs");

exports.router = function(options) {
    return new Router(express.router(options));
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

function Router(router) {
    
    var me = this,
        schema = { };
    
    for (var param in router) {
        if (Object.isFunction(router[param])) {
            me[param] = router[param];
        }
    }
    
    this.client = function(lang, cb) {
        var lang = format.toLowerCase(),
            filename = __dirname + "/" + lang + ".ejs";

        fs.readFile(filename, function(err, data) {
            if (err) cb(err);
            else {
                var output = null;
                try {
                    output = ejs.render(data.toString(), schema, { filename: filename });
                }
                catch (ex) {
                    cb(ex);
                    return;
                }

                cb(null, output);
            }
        });
    };
    
    this.call = function() {
        return new Call(schema, router);
    };
    
}

function Call(schema, router) {
    
    var me = this,
        routes = [ ];
    
    this.secure = function() { 
        me.authenticated = true;
        me.privileges = Array.create(arguments).compact(true);
        return me;
    };
    
    this.params = function(inputs) {
        schema[pattern] = inputs;
        return me;
    };
    
    this.all = function() {
        routes.add([ "all" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.get = function() {
        routes.add([ "get" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.get = function() {
        routes.add([ "get", "post" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.post = function(route) {
        routes.add([ "post" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.put = function(route) {
        routes.add([ "put" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.delete = function(route) {
        routes.add([ "delete" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.head = function(route) {
        routes.add([ "head" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.options = function(route) {
        routes.add([ "options" ].zip(Array.create(arguments).compact(true)));
        return me;
    };
    
    this.execute = function(cb) {
        routes.forEach(function(route) {
            router[route.first()](
                route.last(), 
                function(req, res, next) {
                    req.authenticated = me.authenticated;
                    req.privileges = me.privileges;
                    req.verb = route.first();
                    req.route = route.last();
                    req.interface = schema[pattern];
                    next();
                }, 
                exports.secure, 
                cb
            );
        });
    }
    
}

function handleRequest(req, res, next) {
    var inputs = req.interface, output = { }, allErrors = [ ];
    Object.keys(inputs).forEach(function(key) {
        var value = null, errors = [ ];
        if (req.params && req.params[key]) value = req.params[key];
        else if (req.query && req.query[key]) value = req.query[key];
        else if (req.body && req.body[key]) value = req.body[key];
        
        var input = inputs[key];
        if (input.required && (!value || value.trim() == "")) {
            errors.push(`${key} cannot be missing.`);
        }
        else if (!input.required && !value) {
            value = "";
        }
        
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
            else if (value && type == "email") {
                if (!validator.isEmail(value)) {
                    errors.push(`${key} is not an email address.`);
                }
            }
            else if (value && type == "url") {
                if (!validator.isURL(value)) {
                    errors.push(`${key} is not a URL.`);
                }
            }
            else if (value && type == "phone") {
                if (!validator.isMobileNumber(value)) {
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
                if (!validator.isAlphanumeric(value)) {
                    errors.push(`${key} is not alphanumeric text.`);
                }
            }
            else if (value && type == "isAlpha") {
                if (!validator.isAlphanumeric(value)) {
                    errors.push(`${key} is not alphabetical text.`);
                }
            }
            else if (value && type == "location") {
                value = value.split(",").compact(true);
            }
        }
        
        if (input.min || input.max) {
            if (input.min && input.min > value) {
                errors.push(`${key} must be greater than ${input.min}.`);
            }
            
            if (input.max && input.max < value) {
                errors.push(`${key} must be less than ${input.max}.`);
            }
        }
        
        if (input.length && value.length) {
            if (input.length > value.length) {
                errors.push(`${key} must be shorter than ${input.length}.`);
            }
        }
        
        if (input.minlength && value.length) {
            if (input.minlength > value.length) {
                errors.push(`${key} must be longer than ${input.minlength}.`);
            }
        }
        
        if (input.truncate) {
            value = value.truncate(input.truncate);
        }
        
        if (input.words) {
            value = value.truncateOnWord(input.words);
        }
        
        if (input.match) {
            if (!new RegEx(input.match).test(value)) {
                errors.push(`${key} is not valid.`);
            }
        }
        
        if (input.custom) {
            !input.custom(value, errors);
        }
        
        output[key] = value;
        
        if (errors.length) {
            allErrors.push({ key: key, value: value, errors: errors });    
        }
    });
    
    req.errors = allErrors;
    req.params = output;
    
    if (allErrors.length && input.validate) {
        res.statusCode = 400;
        next(new Error("Invalid request"));
    }
    else {
        next();
    }
}