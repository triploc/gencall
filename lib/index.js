require("sugar");

var express = require("express"),
    validator = require("validator"),
    sanitize = require('google-caja').sanitize,
    ejs = require("ejs"),
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    mime = require("mime"),
    accepts = require("accepts"),
    xml = require("xml"),
    cartesian = require("cartesian"),
    async = require("async");


//////////////////////////////////////////////////////////////////////////////
// Applications
//////////////////////////////////////////////////////////////////////////////
exports.app = function() {
    var app = express();
    app.mount = function(filepath, options) {
        exports.mount(app, filepath, options);
        return app;
    };
    
    app.static = function(root, options) {
        app.use(exports.router().static(root, options));
        return app;
    };
    
    return app;
};

exports.mount = function(parent, filepath, options) {
    options = options || { };
    if (!options.path) options.path = "/";
    
    if (filepath.endsWith(".js")) {
        var module = require(filepath),
            router = exports.router(options),
            basename = path.basename(filepath, ".js"),
            mountpath = path.join(options.path, (basename.toLowerCase() == "index" ? "" : basename));

        router.mount(parent, mountpath);
        module(router, options);
    }
    else {
        var files = fs.readdirSync(filepath),
            js = files.filter(/.*js/i),
            other = files.exclude(js);

        js.forEach(file => {
            var module = require(path.join(filepath, file)),
                router = exports.router(options),
                basename = path.basename(file, ".js"),
                mountpath = path.join(options.path, (basename.toLowerCase() == "index" ? "" : basename));

            router.mount(parent, mountpath);
            module(router, options);
        });

        other.forEach(file => {
            var basepath = options.path;
            if (fs.lstatSync(path.join(filepath, file)).isDirectory()) {
                var router = exports.router(options),
                    mountpath = path.join(basepath, (file == "index" ? "" : file));

                router.mount(parent, mountpath);
                exports.mount(router, path.join(filepath, file), options);
            }
        });
    }
};


//////////////////////////////////////////////////////////////////////////////
// Routers
//////////////////////////////////////////////////////////////////////////////
exports.routers = [ ];

exports.router = function(options) {
    var r = express.Router(options);
    
    r.title = function(name) {
        r.namespace = name;
        return r;
    };
    
    r.describe = function(desc) {
        r.description = desc;
        return r;
    };
    
    r.secure = function() { 
        r.use(
            (req, res, next) => {
                req.authenticated = true;
                req.privileges = Array.create(arguments).flatten().compact(true);
            },
            exports.secure
        );
        
        return r;
    };
    
    r.formats = function() {
        r.acceptTypes = Array.create(arguments);
        return r;
    };
    
    r.defaultFormat = function(format) {
        r.defaultAcceptType = format;
        return r;
    };
    
    r.error = function(handler) {
        if (handler.length != 4) {
            throw new Error("Error handler must take 4 arguments.");
        }
        
        r.errorHandler = handler;
        return r;
    };
    
    r.calls = [ ];
    
    r.call = function() {
        var call = new Call(r);
        call.router = r;
        r.calls.push(call);
        return call;
    };
    
    r.mount = function(parent, path) {
        r.mountpath = path;
        r.parent = parent;
        
        if (!r.acceptTypes && parent.acceptTypes) {
            r.acceptTypes = parent.acceptTypes;
        }
        
        if (!r.defaultAcceptType && parent.defaultAcceptType) {
            r.defaultAcceptType = parent.defaultAcceptType;
        }
        
        if (!r.errorHandler && parent.errorHandler) {
            r.errorHandler = parent.errorHandler;
        }
        
        parent.use(path, r);
        return r;
    };
    
    r.files = [ ];

    r.listFiles = function(cb) {
        async.map(r.files, getAllFiles, (err, results) => {
            if (err) cb(err);
            else cb(null, results.flatten());
        });
    }

    r.static = function(root, options) {
        r.files = r.files.union(root);
        r.use(express.static(root, options));
        return r;
    };
    
    r.paths = function() {
        var paths = getMountPaths(r);
        if (paths.length > 0) {
            paths = cartesian(paths).map(p => {
                return path.join(...p);
            });
        }

        if (paths.length > 0) return paths;
        else return [ "/" ];
    };
    
    exports.routers.push(r);
    return r;
};

function getMountPaths(app) {
    var paths = [ ];
    if (app.parent) {
        getMountPaths(app.parent).forEach((p) => {
            paths.push(p);
        });
    }

    if (app.mountpath) {
        if (!Array.isArray(app.mountpath)) {
            app.mountpath = [ app.mountpath ];
        }
        
        paths.push(app.mountpath);
    }

    return paths;
}

function getAllFiles(filepath, cb) {
    fs.readdir(filepath, (err, files) => {
        if (err) cb(err);
        else {
            files = files.exclude(/^\./).map(file => path.join(filepath, file));
            async.mapLimit(files, 25, (file, cb) => {
                fs.lstat(file, (err, stat) => {
                    if (err) cb();
                    else cb(null, stat.isDirectory() ? file : null);
                });
            }, (err, results) => {
                var directories = results.compact(true);
                async.mapLimit(directories, 25, getAllFiles, (err, subFiles) => {
                    if (err) cb(err);
                    else {
                        files = files.subtract(directories).add(subFiles.flatten());
                        cb(null, files);
                    }
                });
            });
        }
    })
}


//////////////////////////////////////////////////////////////////////////////
// Response Types
//////////////////////////////////////////////////////////////////////////////
exports.contentTypeOverride = function(req, res, next) {
    var parse = url.parse(req.url),
        ext = path.extname(parse.pathname);
    
    if (ext.length && ext != ".") {
        req.headers.Accept = mime.lookup(ext);
        res.type(ext);
        parse.pathname = parse.pathname.to(-1 * ext.length);
        req.url = url.format(parse);
    }
    else if (req.query.format) {
        req.headers.Accept = mime.lookup(req.query.format);
        res.type(req.query.format);
    }
    
    next();
};

exports.defaultTemplate = __dirname + "/templates/response.ejs";

function respond(req, res, types, data, template) {
    types = types || [ ];
    if (!Array.isArray(types)) types = [ types ];
    
    switch(accepts(req).type(types)) {
        case "html":
            res.type("html");
            if (template) res.render(template, { req: req, res: res, results: data });
            else res.render(exports.defaultTemplate, { req: req, res: res, results: data });
            break;
        case "json":
            res.type("json");
            res.json(data);
            break;
        case "xml":
            res.type("xml");
            res.send(xml(data));
            break;
        case "text":
        case "txt":
            res.type("text");
            res.send(data.toString()); 
            break;
        default:
            res.status(406).send('Not Acceptable');
    }
}


//////////////////////////////////////////////////////////////////////////////
// Templating
//////////////////////////////////////////////////////////////////////////////
exports.generate = function(template, routers, options, cb) {
    template = template.toLowerCase();

    if ([ "angular", "docs", "jquery", "json", "node" ].indexOf(template) < 0) {
        cb(new Error("Invalid template " + template + "."));
        return;
    }

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
                if (!options.requestFunction) {
                    options.requestFunction = "gencall";
                }
                
                output = ejs.render(data.toString(), { 
                    routers: routers,
                    options: options,
                    path: path
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

exports.sitemap = function(routers, options, cb) {
    if (cb == null && Object.isFunction(options)) {
        cb = options;
        options = { };
    }

    var filename = __dirname + "/templates/sitemap.ejs";
    fs.readFile(filename, function(err, data) {
        if (err) cb(err);
        else {
            async.map(routers, (router, cb) => { router.listFiles(cb); }, (err, urls) => {
                if (err) cb(err);
                else {
                    var output = null;
                    try {
                        output = ejs.render(data.toString(), {
                            urls: urls.flatten(),
                            options: options,
                            path: path
                        }, { filename: filename });
                    }
                    catch (ex) {
                        cb(ex);
                        return;
                    }

                    cb(null, output);
                }
            });
        }
    });
};


//////////////////////////////////////////////////////////////////////////////
// Call Interface
//////////////////////////////////////////////////////////////////////////////
function Call(router) {
    
    var me = this;
    
    function addRoutes(methods, routes) {
        routes = Array.create(routes).compact(true);
        methods = Array.create(methods).compact(true);
        
        if (!me.title) {
            me.title = routes.first().replace(/\/|\:/gi, " ").compact().titleize().trim();
        }
        
        var inputs = { };
        routes.map((r) => { 
            return r.split("/").filter(/\:.*/gi); 
        }).flatten().compact(true).unique().forEach((p) => { 
            inputs[p.from(1)] = { required: true };
        });
        
        routes = cartesian([ methods, routes ]);
        me.routes.add(routes);
    }
    
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
    
    this.formats = function() {
        me.acceptTypes = Array.create(arguments);
    };
    
    this.defaultFormat = function(format) {
        me.defaultAcceptType = format;
    };
    
    this.params = function(params) {
        me.inputs = Object.merge(me.inputs || { }, params, true);
        return me;
    };

    [
        "all", "checkout", "checkin", "connect", "copy", "delete", "get", "head",
        "lock", "merge", "mkactivity", "mkcol", "move", "m-search",
        "notify", "options", "patch", "post", "propfind", "proppatch",
        "purge", "put", "report", "search", "subscribe", "trace",
        "unlock", "unsubscribe"
    ].forEach(function(method) {
        me[method] = me[method.toUpperCase()] = function() {
            addRoutes(method, arguments);
            return me;
        };
    });
    
    this.getpost = this.GETPOST = function() {
        addRoutes([ "get", "post" ], arguments);
        return me;
    };
    
    this.process = function() {
        var handlers = Array.create(arguments);
        if (handlers.length == 0) {
            return me;
        }
        else {
            handlers.map("interface").forEach(interface => {
                if (interface) me.params(interface);
            });
        }

        if (me.router.errorHandler) {
            handlers.push(me.router.errorHandler);
        }

        me.routes.forEach(function(route) {
            router[route.first()](
                route.last(), 
                (req, res, next) => {
                    req.authenticated = me.authenticated;
                    req.privileges = me.privileges;
                    req.verb = route.first();
                    req.route = route.last();
                    req.inputs = me.inputs;
                    
                    res.respond = (data, template) => { 
                        var types = me.acceptTypes || me.router.acceptTypes || me.defaultAcceptType || me.router.defaultAcceptType;
                        respond(req, res, types, data, template); 
                    };
                    
                    if (!req.headers.Accept && (me.defaultAcceptType || me.router.defaultAcceptType)) {
                        req.headers.Accept = mime.lookup(me.defaultAcceptType || me.router.defaultAcceptType);
                    }
                    
                    next();
                }, 
                exports.secure,
                validateRequest,
                exports.validated,
                ...handlers
            );
        });
    };
    
}

exports.secure = function(req, res, next) {
    if (req.authenticated) {
        if (!req.session || !req.session.authenticated) {
            res.status(401);
            next(new Error("Unauthenticated"));
        }
        else if (req.privileges && req.privileges.length) {
            if (req.session.privileges && req.privileges.intersect(req.session.privileges).length > 0) {
                next();
            }
            else {
                res.status(403);
                next(new Error("Forbidden"));
            }
        }
        else next();
    }
    else next();
};

function validateRequest(req, res, next) {
    var inputs = req.inputs, 
        errors = [ ],
        abort = false;
    
    Object.keys(inputs).forEach(function(key) {
        var value = null, 
            input = inputs[key], 
            err = [ ];

        if (input.source) {
            if (!Array.isArray(input.source)) input.source = [ input.source ];
            value = input.source.include("params", "query", "body").map((source) => { 
                return req[source][key]; 
            }).compact()[0];
        }
        else {
            value = req.params[key] || req.query[key] || (req.body ? req.body[key] : null);
        }
        
        validateInput(key, input, value, err);
        
        if (err.length) {
            errors.push({ key: key, value: value, errors: err });
            if (input.abort) abort = true;
        }
        else {
            res.locals[key] = value;
        }
    });
    
    req.errors = errors;
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

    if (input.required && (!value || value.trim() == "")) {
        errors.push(input.error || `${key} cannot be missing.`);
    }
    else if (input.default && (!value || value.trim() == "")) {
        value = input.default;
    }
    else if (!input.required && (!value || value.trim() == "")) {
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

    if (input.type) {
        var type = input.type.toLowerCase();
        if (value && type == "text") value = value.toString();
        else if (value && type == "integer") {
            try {
                value = parseInt(value);
            }
            catch (ex) {
                errors.push(input.error || `${key} is not an integer.`);
            }
        }
        else if (value && type == "number") {
            try {
                value = parseFloat(value);
            }
            catch (ex) {
                errors.push(input.error || `${key} is not a number.`);
            }
        }
        else if (value && type == "date") {
            try {
                value = Date.create(value);    
            }
            catch (ex) {
                errors.push(input.error || `${key} is not a date.`);
            }
        }
        else if (value && type == "json") {
            try {
                value = JSON.parse(value);    
            }
            catch (ex) {
                errors.push(input.error || `${key} is not an object.`);
            }
        }
        else if (value && type == "boolean") {
            value = (value.toLowerCase() == "true");
        }
        else if (value && type == "uuid") {
            if (!validator.isUUID(value)) {
                errors.push(input.error || `${key} is not a UUID.`);
            }
        }
        else if (value && type == "email") {
            if (!validator.isEmail(value)) {
                errors.push(input.error || `${key} is not an email address.`);
            }
        }
        else if (value && type == "domain") {
            if (!validator.isFQDN(value)) {
                errors.push(input.error || `${key} is not a domain.`);
            }
        }
        else if (value && type == "url") {
            if (!validator.isURL(value)) {
                errors.push(input.error || `${key} is not a URL.`);
            }
        }
        else if (value && type == "ip") {
            if (!validator.isIP(value)) {
                errors.push(input.error || `${key} is not an IP address.`);
            }
        }
        else if (value && type == "mac") {
            if (!validator.isMACAddress(value)) {
                errors.push(input.error || `${key} is not a MAC address.`);
            }
        }
        else if (value && type == "phone") {
            if (!validator.isMobileNumber(value, input.locale)) {
                errors.push(input.error || `${key} is not a phone.`);
            }
        }
        else if (value && type == "uuid") {
            if (!validator.isUUID(value)) {
                errors.push(input.error || `${key} is not a unique identifier.`);
            }
        }
        else if (value && type == "creditcard") {
            if (!validator.isCreditCard(value)) {
                errors.push(input.error || `${key} is not a valid credit card number.`);
            }
        }
        else if (value && type == "base64") {
            if (!validator.isBase64(value)) {
                errors.push(input.error || `${key} is not a base-64 string.`);
            }
        }
        else if (value && type == "hexidecimal") {
            if (!validator.isHexadecimal(value)) {
                errors.push(input.error || `${key} is not a hexidecimal string.`);
            }
        }
        else if (value && type == "currency") {
            if (!validator.isCurrency(value)) {
                errors.push(input.error || `${key} is not a currency.`);
            }
        }
        else if (value && type == "ascii") {
            if (!validator.isAscii(value)) {
                errors.push(input.error || `${key} is not ascii text.`);
            }
        }
        else if (value && type == "alphanumeric") {
            if (!validator.isAlphanumeric(value, input.locale)) {
                errors.push(input.error || `${key} is not alphanumeric text.`);
            }
        }
        else if (value && type == "alpha") {
            if (!validator.isAlpha(value, input.locale)) {
                errors.push(input.error || `${key} is not alphabetical text.`);
            }
        }
        else if (value && type == "hexcolor") {
            if (!validator.isHexColor(value)) {
                errors.push(input.error || `${key} is not a hex color.`);
            }
        }
        else if (value && type == "latitude") {
            try {
                value = parseFloat(value);
            }
            catch (ex) {
                errors.push(input.error || `${key} is not a valid latitude.`);
            }
            
            if (value.latitude >= -90 && value.latitude <= 90) {
                errors.push(input.error || `${key} is not a valid latitude.`);
            }
        }
        else if (value && type == "longitude") {
            try {
                value = parseFloat(value);
            }
            catch (ex) {
                errors.push(input.error || `${key} is not a valid latitude.`);
            }
            
            if (value.longitude >= -180 && value.longitude <= 180) {
                errors.push(input.error || `${key} is not a valid longitude.`);
            }
        }
        else if (value && type == "location") {
            try {
                value = value.split(",").compact(true).map(parseFloat);
                if (value.length != 2) throw new Error("Invalid location.");
            }
            catch (ex) {
                errors.push(input.error || `${key} is not a valid location.`);
            }
            
            value = { latitude: value[0], longitude: value[1] };
            if (value.latitude >= -90 && value.latitude <= 90) {
                errors.push(input.error || `${key} does not have a valid latitude component.`);
            }
            
            if (value.longitude >= -180 && value.longitude <= 180) {
                errors.push(input.error || `${key} does not have a valid longitude component.`);
            }
        }
    }

    if (input.min || input.max) {
        if (input.min && input.min >= value) {
            errors.push(input.error || `${key} must be greater than ${input.min}.`);
        }

        if (input.max && input.max <= value) {
            errors.push(input.error || `${key} must be less than ${input.max}.`);
        }
    }

    if (input.maxlength && value.length) {
        if (input.maxlength > value.length) {
            errors.push(input.error || `${key} must be shorter than ${input.length}.`);
        }
    }

    if (input.minlength && value.length) {
        if (input.minlength > value.length) {
            errors.push(input.error || `${key} must be longer than ${input.minlength}.`);
        }
    }

    if (input.hasNumber) {
        if (/[0-9]/.test(value) == false) {
            errors.push(input.error || `${key} must contain digits.`);
        }
    }
    
    if (input.hasUppercase) {
        if (/[A-Z]/.test(value) == false) {
            errors.push(input.error || `${key} must contain a uppercase character.`);
        }
    }
    
    if (input.hasLowercase) {
        if (/[a-z]/.test(value) == false) {
            errors.push(input.error || `${key} must contain a lowercase character.`);
        }
    }
    
    if (input.hasSymbol) {
        if (/[`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\\|;:'",<.>\/\?]/.test(value) == false) {
            errors.push(input.error || `${key} must contain a symbol.`);
        }
    }
    
    if (input.hasWhitespace) {
        if (/\s/.test(value) == false) {
            errors.push(input.error || `${key} must contain whitespace.`);
        }
    }
    
    if (input.match) {
        if (Object.isRegExp(input.match)) {
            if (!input.match.test(value)) {
                errors.push(input.error || `${key} is not valid.`);
            }    
        }
        else if (Array.isArray(input.match)) {
            if (input.match.indexOf(value) < 0) {
                errors.push(input.error || `${key} is not valid.`);
            }
        }
        else if (input.match != value) {
            errors.push(input.error || `${key} does not match ${value}.`);
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

exports.validated = function(req, res, next) {
    if (req.abort) {
        res.status(400);
        next(new Error("Bad request"));
    }
    else {
        next();
    }
};
