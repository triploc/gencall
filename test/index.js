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
        router.call().get("/test").validate({
            phone: { type: "phone", required: true },
            email: { type: "email" }
        });
    });
    
    it("can generate HTML documentation", function(done) {
        router.client("html", function(err, html) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/doc.html", html, done);
            }
        })
    });
    
    it("can generate a jQuery client", function(done) {
        router.client("jquery", function(err, js) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/jquery.js", js, done);
            }
        })
    });
    
    it("can generate an Angular client", function(done) {
        router.client("angular", function(err, js) {
            if (err) throw err;
            else {
                fs.writeFile(outputDir + "/angular.js", js, done);
            }
        })
    });
    
});