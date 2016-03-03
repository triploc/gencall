require("sugar");

var express = require("express"),
    validator = require("validator"),
    ejs = require("ejs"),
    fs = require("fs");

exports.router = function(options) {
    return new Router(express.router(options));
};

exports.invalid = function(req, res, err) {
    res.write(req.errors);
    res.end();
};

exports.compile = true;

function Router(router) {
    
    var me = this,
        schema = { };
    
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
    
    this.use = router.use;
    
    this.param = router.param;
    
    this.route = router.route;
    
    this.all = router.all;
    
    this.get = router.get;
    
    this.post = router.post;
    
    this.put = router.put;
    
    this.delete = router.delete;
    
    this.head = router.head;
    
    this.options = router.options;
    
    this.api = {
        get: function(pattern, inputs, handler) {
            inputs.verb = "get";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.get(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        },
        post: function(pattern, inputs, handler) {
            inputs.verb = "post";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.post(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        },
        put: function(pattern, inputs, handler) {
            inputs.verb = "put";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.put(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        },
        delete: function(pattern, inputs, handler) {
            inputs.verb = "delete";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.delete(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        },
        head: function(pattern, inputs, handler) {
            inputs.verb = "head";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.head(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        },
        options: function(pattern, inputs, handler) {
            inputs.verb = "options";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.options(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        },
        getpost: function(pattern, inputs, handler) {
            inputs.verb = "getpost";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.get(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
            
            me.post(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        },
        all: function(pattern, inputs, handler) {
            inputs.verb = "all";
            inputs.route = pattern;
            schema[pattern] = inputs;
            me.all(pattern, function(req, res, next) {
                handleRequest(req, res, next, inputs, handler);
            });
        }
    }
    
}

function handleRequest(req, res, next, inputs, handler) {
    var output = { }, allErrors = [ ];
    Object.keys(inputs).exclude([ "method", "route" ]).forEach(function(key) {
        var value = null, errors = [ ];
        if (req.params && req.params[key]) value = req.params[key];
        else if (req.query && req.query[key]) value = req.query[key];
        else if (req.body && req.body[key]) value = req.body[key];
        
        var input = inputs[key];
        if (input.required && (!value || value.trim() == "")) {
            errors.push(`${key} cannot be missing.`, next);
        }
        else if (!input.required && !value) {
            value = "";
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
            else if (value && type == "integer") value = parseInt(value);
            else if (value && type == "number") value = parseFloat(value);
            else if (value && type == "date") value = Date.create(value);
            else if (type == "json") value = JSON.parse(value);
            else if (type == "boolean") value = (value != null) && (value.toLowerCase() == "true");
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
        
        if (input.match) {
            if (!new RegEx(input.match).test(value)) {
                errors.push(`${key} is not valid.`);
            }
        }
        
        if (input.custom) {
            !input.custom(value, errors);
        }
        
        if (input.truncate) {
            value = value.truncate(input.truncate);
        }
        
        if (input.words) {
            value = value.truncateOnWord(input.words);
        }
        
        output[key] = input;
    });
    
    req.verb = input.verb;
    req.route = input.route;
    req.errors = errors;
    req.params = output;
    
    if (errors.length && input.validate) {
        exports.invalid(req, res);
    }
    else {
        handler(req, res, next);
    }
}