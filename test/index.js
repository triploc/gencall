require("sugar");

var fs = require("fs"),
    rm = require("rimraf");
    
describe('Router', function() {
    
    var outputDir = __dirname + "/../test-output";
    
    before(function(done) {
        rm(outputDir, function(err) {
            if (err) throw err;
            else fs.mkdir(outputDir, done);
        });
    });
    
    var gencall = null,
        router = null;
    
    it("ain't broke", function() {
        gencall = require("../index");
    })
    
    it("can create a router", function() {
        router = gencall.router();
    });

    it("can register a call", function() {
        router.call().secure().getpost("/test").params({
            phone: { type: "phone", required: true, description: "mobile phone number" },
            email: { type: "email", description: "mail email address" }
        });
    });
    
    it("can load examples", function(done) {
        fs.readdir(__dirname + "/../examples", function(err, files) {
            files.filter(/.*js/i).forEach(function(file) {
                require(__dirname + "/../examples/" + file);
            });
            
            done();
        })
    });
    
    it("can generate HTML documentation", function(done) {
        gencall.autoGenerate("html", function(err, html) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/doc.html", html, done);
            }
        })
    });
    
    it("can generate a jQuery client", function(done) {
        gencall.autoGenerate("jquery", function(err, js) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/jquery.js", js, done);
            }
        })
    });
    
    it("can generate an Angular client", function(done) {
        gencall.autoGenerate("angular", function(err, js) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/angular.js", js, done);
            }
        })
    });
    
    it("can generate a Node.js client", function(done) {
        gencall.autoGenerate("node", function(err, js) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/node.js", js, done);
            }
        })
    });
    
});