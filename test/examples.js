require("sugar");
require("chai").should();

var expect = require("chai").expect,
    gencall = require("../index"),
    request = require("request");

describe('Examples', function() {

    it("cannot load an invalid app", function() {
        try {
            gencall.app().mount(__dirname + "/../blah");
        }
        catch (ex) {
            ex.should.be.ok;
        }
    });

    it("can load examples", function() {
        gencall.app().mount(__dirname + "/../examples").listen(3000);
    });

    describe("Simple", function() {

        it("can GET /simple/test", function(done) {
            request.get("http://localhost:3000/simple/test", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

        it("can GET /simple/test", function(done) {
            request.post("http://localhost:3000/simple/test", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

        it("can GET /static/static.txt", function(done) {
            request.get("http://localhost:3000/static/static.txt", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal("This is some content");
                done();
            });
        });

    });

});
