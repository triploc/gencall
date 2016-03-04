var express = require("express"),
    fs = require("fs"),
    gencall = require("../index");

var app = express(),
    router = gencall.router();

router.call().get("/test").params({
    phone: { type: "phone", required: true },
    email: { type: "email" }
});

describe('Router', function() {
    
    before(function() {
        router.attach(app);
        app.listen(3000);
    });
    
    it("generates HTML documentation", function(done) {
        router.client("html", function(err, html) {
            if (err) throw err;
            else fs.writeFile(__dirname + "/doc.html", html, done);
        })
    });
    
});