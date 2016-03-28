require("sugar");

var fs = require("fs"),
    rm = require("rimraf");
    
describe('Module', function() {
    
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
            phone: { type: "phone", required: true, description: "mobile phone number", abort: true },
            email: { type: "email", description: "mail email address" }
        });
        
        router.call().secure().getpost("/test2").params({
            phone: { type: "phone", required: true, description: "mobile phone number", abort: true },
            email: { type: "email", description: "mail email address" }
        });
        
        router.call().secure().getpost("/test3").params({
            phone: { type: "phone", required: true, description: "mobile phone number", abort: true },
            email: { type: "email", description: "mail email address" }
        });
    });
    
    it("can generate HTML documentation", function(done) {
        gencall.generate("docs", function(err, html) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/doc.html", html, done);
            }
        })
    });
    
    it("can generate JSON schema", function(done) {
        gencall.generate("json", function(err, json) {
            if (err) throw err;
            else {
                JSON.parse(json);
                fs.writeFile(outputDir + "/schema.json", json, done);
            }
        })
    });
    
    it("can generate a jQuery client", function(done) {
        gencall.generate("jquery", function(err, js) {
            if (err) throw err;
            else {
                eval(js);
                fs.writeFile(outputDir + "/jquery.js", js, done);
            }
        })
    });
    
    it("can generate an Angular client", function(done) {
        gencall.generate("angular", function(err, js) {
            if (err) throw err;
            else {
                eval(js);
                fs.writeFile(outputDir + "/angular.js", js, done);
            }
        })
    });
    
    it("can generate a Node.js client", function(done) {
        gencall.generate("node", function(err, js) {
            if (err) throw err;
            else {
                eval(js);
                fs.writeFile(outputDir + "/node.js", js, done);
            }
        })
    });
    
});