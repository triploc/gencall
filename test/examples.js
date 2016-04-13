require("sugar");
require("chai").should();

var mlog = require('mocha-logger'),
    expect = require("chai").expect,
    fs = require("fs"),
    gencall = require("../index"),
    request = require("request");

describe('Examples', function() {

    var outputDir = __dirname + "/../test-output";

    it("cannot load an invalid app", function() {
        try {
            gencall.app().mount(__dirname + "/../blah");
        }
        catch (ex) {
            ex.should.be.ok;
        }
    });

    it("can load a single file", function() {
        gencall.app().mount(__dirname + "/../examples/simple.js").should.be.ok;
    });

    it("can mount static files to an app", function() {
        gencall.app().static(__dirname + "/../examples/static/content").should.be.ok;
    })

    var app = null;
    it("can mount examples", function() {
        app = gencall.app().mount(__dirname + "/../examples");
        app.should.be.ok;
        app.listen(3000);
    });

    describe("Simple", function() {

        it("can GET /simple/test", function(done) {
            request.get("http://localhost:3000/simple/test", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

        it("can POST /simple/test", function(done) {
            request.post("http://localhost:3000/simple/test", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

    });

    describe("Static", function() {

        it("can GET /static/static.txt", function(done) {
            request.get("http://localhost:3000/static/static.txt", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal("This is some content");
                done();
            });
        });

    });

    describe("Content", function() {

        it("can GET /content/sample.json", function(done) {
            request.get("http://localhost:3000/content/sample.json", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('{"field":"Hello","array":[1,2,3],"object":{"sub":"Hello","sub2":"Goodbye"}}');
                done();
            });
        });

        it("can GET /content/sample.xml", function(done) {
            request.get("http://localhost:3000/content/sample.xml", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal("<response><field>Hello</field><array>123</array><object><sub>Hello</sub><sub2>Goodbye</sub2></object></response>");
                done();
            });
        });

        it("can GET /content/sample.txt", function(done) {
            request.get("http://localhost:3000/content/sample.txt", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('[object Object]');
                done();
            });
        });

        it("can GET /content/sample.text", function(done) {
            request.get("http://localhost:3000/content/sample.text", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('[object Object]');
                done();
            });
        });

        it("can GET /content/sample.html", function(done) {
            request.get("http://localhost:3000/content/sample.html", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.be.ok;
                done();
            });
        });

        it("cannot GET /content/sample.blah", function(done) {
            request.get("http://localhost:3000/content/sample.blah", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(406);
                done();
            });
        });

        it("can GET /content/sample?format=json", function(done) {
            request.get("http://localhost:3000/content/sample?format=json", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('{"field":"Hello","array":[1,2,3],"object":{"sub":"Hello","sub2":"Goodbye"}}');
                done();
            });
        });

        it("can GET /content/sample2 as JSON", function(done) {
            request.get("http://localhost:3000/content/sample2", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('{"field":"Hello","array":[1,2,3],"object":{"sub":"Hello","sub2":"Goodbye"}}');
                done();
            });
        });

        it("can GET /content/sample3 as HTML", function(done) {
            request.get("http://localhost:3000/content/sample3", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.be.ok;
                done();
            });
        });



    });

});
