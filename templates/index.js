require("sugar");

var ejs = require("ejs"),
    fs = require("fs"),
    render = { };

module.exports = function(schema, format, cb) {
    var lang = format.toLowerCase(),
        filename = __dirname + "/" + lang + ".ejs";
    
    fs.readFile(filename, function(err, data) {
        if (err) cb(err);
        else {
            var output = null;
            try {    
                if (!render[lang]) {
                    render[lang] = ejs.compile(data.toString(), { filename: filename, cache: true });
                }
            
                output = render[lang](schema);
            }
            catch (ex) {
                cb(ex);
                return;
            }
            
            cb(null, output);
        }
    });
};