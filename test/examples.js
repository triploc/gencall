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
        gencall.app().require(__dirname + "/../examples/simple.js").should.be.ok;
    });

    it("can mount static files to an app", function() {
        gencall.app().static(__dirname + "/../examples/static/content").should.be.ok;
    })

    var app = null;

    it("can mount examples", function() {
        app = gencall.app().require(__dirname + "/../examples");
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

    describe("Metadata", function() {

        it("can register error handler with proper number of arguments", function() {
            gencall.router().error((err, req, res, next) => { });
        });

        it("cannot register error handler with improper number of arguments", function() {
            try {
                gencall.router().error(() => { });
                throw Error("Should throw error");
            }
            catch (ex) {
                ex.should.be.ok;
            }
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

        it("can GET /content/sample?format=json", function(done) {
            request.get("http://localhost:3000/content/sample?format=json", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('{"field":"Hello","array":[1,2,3],"object":{"sub":"Hello","sub2":"Goodbye"}}');
                done();
            });
        });

        it("cannot GET /content/sample.blah with invalid format", function(done) {
            request.get("http://localhost:3000/content/sample.blah", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(406);
                done();
            });
        });

        it("can GET /content/sample2 with default format JSON", function(done) {
            request.get("http://localhost:3000/content/sample2", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('{"field":"Hello","array":[1,2,3],"object":{"sub":"Hello","sub2":"Goodbye"}}');
                done();
            });
        });

        it("can GET /content/sample3 with unspecified format HTML", function(done) {
            request.get("http://localhost:3000/content/sample3", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.be.ok;
                done();
            });
        });

        it("can GET /content/custom as HTML using customized template", function(done) {
            request.get("http://localhost:3000/content/custom", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.be.ok;
                done();
            });
        });

    });

    describe("Interface", function() {

        it("can GET /interface/sample with valid email", function(done) {
            request.get({
                url: "http://localhost:3000/interface/sample",
                qs: { "email": "j@j.com" }
            }, function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                body.toString().should.equal('Ok');
                done();
            });
        });

    });

    describe("Secure", function() {

        it("succeeds on GET /secure/auth/200", function(done) {
            request.get("http://localhost:3000/secure/auth/200", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

        it("succeeds on GET /secure/auth/200/priv", function(done) {
            request.get("http://localhost:3000/secure/auth/200/priv", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

        it("fails on GET /secure/401", function(done) {
            request.get("http://localhost:3000/secure/401", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(401);
                done();
            });
        });

        it("fails on GET /secure/auth/403", function(done) {
            request.get("http://localhost:3000/secure/auth/403", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(403);
                done();
            });
        });

    });

    describe("Inherit", function() {

        it("succeeds on GET /inherit/r1/sample", function(done) {
            request.get("http://localhost:3000/inherit/r1/sample", function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

        it("succeeds on GET /inherit/r1/sample in JSON format", function(done) {
            request.get({
                url: "http://localhost:3000/inherit/r1/sample",
                headers: {
                    Accept: "application/json"
                }
            }, function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                done();
            });
        });

        it("succeeds on GET /inherit/r1/sample in default format", function(done) {
            request.get({
                url: "http://localhost:3000/inherit/r1/sample"
            }, function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(200);
                response.headers["content-type"].should.match(/application\/json/);
                done();
            });
        });

        it("fails on GET /inherit/r1/sample in HTML format", function(done) {
            request.get({
                url: "http://localhost:3000/inherit/r1/sample",
                headers: {
                    Accept: "text/html"
                }
            }, function(err, response, body) {
                expect(err).to.be.null;
                response.statusCode.should.equal(406);
                done();
            });
        });

    });

    describe("Validate", function() {

        describe("Required", function() {
            it("can verify required works positively", function(done) {
                request({
                    url: "http://localhost:3000/validate/required/true",
                    qs: { value: "value" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can verify required works negatively", function(done) {
                request({
                    url: "http://localhost:3000/validate/required/true"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Required parameter missing.");
                    done();
                })
            });

            it("can verify that absense of required works positively", function(done) {
                request({
                    url: "http://localhost:3000/validate/required/false"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });
        });

        describe("Abort", function() {
            it("can verify abort will generate a validation error positively", function(done) {
                request({
                    url: "http://localhost:3000/validate/abort/true"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can verify abort will generate a validation error negatively", function(done) {
                request({
                    url: "http://localhost:3000/validate/abort/true",
                    qs: { value: "value" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can verify no abort will fall through", function(done) {
                request({
                    url: "http://localhost:3000/validate/abort/false"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });
        });

        describe("Source", function() {
            it("can use param source", function(done) {
                request({
                    url: "http://localhost:3000/validate/source/param/user"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can verify absense of param source fails", function(done) {
                request({
                    url: "http://localhost:3000/validate/source/param"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can use param query", function(done) {
                request({
                    url: "http://localhost:3000/validate/source/query",
                    qs: { value: "okay" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can verify absense of query source fails", function(done) {
                request({
                    url: "http://localhost:3000/validate/source/query"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("cannot use body source with no body parser", function(done) {
                request({
                    url: "http://localhost:3000/validate/source/nobody",
                    method: "POST",
                    form: { value: "okay" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can use body source", function(done) {
                request({
                    url: "http://localhost:3000/validate/source/body",
                    method: "POST",
                    form: { value: "okay" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can verify absense of body source fails", function(done) {
                request({
                    url: "http://localhost:3000/validate/source/body",
                    method: "POST"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });
        });

        describe("Defaults", function() {
            it("can validate a good default", function(done) {
                request({
                    url: "http://localhost:3000/validate/default/true"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("cannot validate a bad default", function(done) {
                request({
                    url: "http://localhost:3000/validate/default/false"
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate a good default override", function(done) {
                request({
                    url: "http://localhost:3000/validate/default/false",
                    qs: { value: "a@a.com" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("cannot validate a bad default override", function(done) {
                request({
                    url: "http://localhost:3000/validate/default/true",
                    qs: { value: "bad" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });
        });

        describe("Transforms", function() {
            it("can sanitize an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/sanitize",
                    qs: { value: "this is input <script>some script;</script> and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this is input  and more.");
                    done();
                })
            });

            it("can strip all tags an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/strip/all",
                    qs: { value: "this is input <script>some script;</script><br> <b>asdf</b> and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this is input some script; asdf and more.");
                    done();
                })
            });

            it("can strip some tags an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/strip/some",
                    qs: { value: "this is input <i>xcvxvxcv</i><b>asdf</b> and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this is input xcvxvxcvasdf and more.");
                    done();
                })
            });

            it("can compact an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/compact",
                    qs: { value: "this is input      and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this is input and more.");
                    done();
                })
            });

            it("can truncate an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/truncate",
                    qs: { value: "this is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this...");
                    done();
                })
            });

            it("can truncate an input on a word", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/words",
                    qs: { value: "this is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this is...");
                    done();
                })
            });

            it("can capitalize an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/capitalize",
                    qs: { value: "this is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("This is input and more.");
                    done();
                })
            });

            it("can titleize an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/titleize",
                    qs: { value: "this is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("This Is Input and More.");
                    done();
                })
            });

            it("can transform an input to uppercase", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/uppercase",
                    qs: { value: "this is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("This is input and more.".toUpperCase());
                    done();
                })
            });

            it("can transform an input to lowercase", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/lowercase",
                    qs: { value: "this is input and more.".toUpperCase() }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("This is input and more.".toLowerCase());
                    done();
                })
            });

            it("can dasherize an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/dasherize",
                    qs: { value: "this is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this-is-input-and-more.");
                    done();
                })
            });

            it("can parameterize an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/parameterize",
                    qs: { value: "this is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this-is-input-and-more");
                    done();
                })
            });

            it("can humanize an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/humanize",
                    qs: { value: "this_is_input_and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("This is input and more.");
                    done();
                })
            });

            it("can underscore an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/underscore",
                    qs: { value: "This is input and more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this_is_input_and_more.");
                    done();
                })
            });

            it("can spacify an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/spacify",
                    qs: { value: "thisIsInput_and_more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("this is input and more.");
                    done();
                })
            });

            it("can camelcase an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/camelcase",
                    qs: { value: "this is input and more" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("thisIsInputAndMore");
                    done();
                })
            });

            it("can titlecase an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/titlecase",
                    qs: { value: "this Is Input and more" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("ThisIsInputAndMore");
                    done();
                })
            });

            it("cannot apply an invalid transform to an input", function(done) {
                request({
                    url: "http://localhost:3000/validate/transform/invalid",
                    qs: { value: "thisIsInput_and_more." }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    done();
                })
            });
        });

        describe("Languages", function() {
            function testLanguage(lang, good, bad) {
                it(`can verify an input is in ${lang}`, function(done) {
                    request({
                        url: "http://localhost:3000/validate/language/" + lang.toLowerCase(),
                        qs: { value: good }
                    }, function(err, response, body) {
                        expect(err).to.be.null;
                        response.statusCode.should.equal(200);
                        done();
                    })
                });

                it(`can verify an input is not in ${lang}`, function(done) {
                    request({
                        url: "http://localhost:3000/validate/language/" + lang.toLowerCase(),
                        qs: { value: bad }
                    }, function(err, response, body) {
                        expect(err).to.be.null;
                        response.statusCode.should.equal(400);
                        done();
                    })
                });
            }

            testLanguage("Arabic", "أتكلم", "latin");
            testLanguage("Cyrillic", "визит", "latin");
            testLanguage("Greek", "γλώσσα", "latin");
            testLanguage("Hangul", "먹겠습니다", "latin");
            testLanguage("Han", "汉字", "latin");
            testLanguage("Kanji", "漢字", "latin");
            testLanguage("Hebrew", "עברית", "latin");
            testLanguage("Hiragana", "たべもの", "latin");
            testLanguage("Kana", "きゃ", "latin");
            testLanguage("Katakana", "ウィキペディア", "latin");
            testLanguage("Latin", "l'année", "أتكلم");
            testLanguage("Thai", "ภาษาเขียน", "latin");
            testLanguage("Devanagari", "देवनागरी", "latin");

            it(`cannot verify an invalid language`, function(done) {
                request({
                    url: "http://localhost:3000/validate/language/gibberish",
                    qs: { value: "latin" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    done();
                })
            });
        });

        describe("Types", function() {
            function testType(type, good, bad) {
                if (good) {
                    it("can validate a good " + type, function(done) {
                        request({
                            url: "http://localhost:3000/validate/types/" + type,
                            qs: { value: good }
                        }, function(err, response, body) {
                            expect(err).to.be.null;
                            response.statusCode.should.equal(200);
                            body.toString().should.equal("Success");
                            done();
                        })
                    });
                }

                if (bad) {
                    it("cannot validate a bad " + type, function(done) {
                        request({
                            url: "http://localhost:3000/validate/types/" + type,
                            qs: { value: bad }
                        }, function(err, response, body) {
                            expect(err).to.be.null;
                            response.statusCode.should.equal(400);
                            body.toString().should.equal("Bad request");
                            done();
                        })
                    });
                }
            }

            testType("text", "sometext", null);
            testType("integer", "12", "b");
            testType("number", "-2.2343e2", "pi");
            testType("date", "December 23rd", "Arthur");
            testType("json", JSON.stringify({ hello: "goodbye"}), "{ a: 1 }");
            testType("boolean", "true", null);
            testType("uuid", "123e4567-e89b-12d3-a456-426655440000", "asdfasdfadsf");
            testType("email", "a@a.com", "b");
            testType("domain", "some.domain.com", 345);
            testType("url", "http://google.com", "false");
            testType("ip", "2601:282:800:1b80:5e1:148:2c3d:fae4", "something");
            testType("mac", "01:23:45:67:89:ab", "x");
            testType("phone", "+19702345939", "phone");
            testType("creditcard", "378282246310005", "asdf");
            testType("base64", "dGVzdA==", "()");
            testType("hexidecimal", "10FE", "XXX");
            testType("currency", "$10.03", "XXX");
            testType("ascii", "asdfqwer", "أتكلم");
            testType("alphanumeric", "asdfkj234342", ",");
            testType("alpha", "asdfkj", "asdf32");
            testType("hexcolor", "#234", "xxx");
            testType("latitude", 50, 100);
            testType("latitude", 90, "asdf");
            testType("longitude", 50, 200);
            testType("longitude", 180, "asdf");
            testType("location", "50,100", "360,360");
            testType("location", "90,180", "asdf");
        });

        describe("Min and Max", function() {
            it("can validate an integer range with a good value", function(done) {
                request({
                    url: "http://localhost:3000/validate/range",
                    qs: { value: 6 }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can validate an integer range with an edge-case lower value", function(done) {
                request({
                    url: "http://localhost:3000/validate/range",
                    qs: { value: 5 }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can validate an integer range with an edge-case upper value", function(done) {
                request({
                    url: "http://localhost:3000/validate/range",
                    qs: { value: 10 }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("cannot validate an integer range with a value too large", function(done) {
                request({
                    url: "http://localhost:3000/validate/range",
                    qs: { value: 15 }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("cannot validate an integer range with a value too small", function(done) {
                request({
                    url: "http://localhost:3000/validate/range",
                    qs: { value: 1 }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate text length range with a good value", function(done) {
                request({
                    url: "http://localhost:3000/validate/length",
                    qs: { value: "value" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can validate text length range with an edge-case lower value", function(done) {
                request({
                    url: "http://localhost:3000/validate/length",
                    qs: { value: "to" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("can validate text length range with an edge-case upper value", function(done) {
                request({
                    url: "http://localhost:3000/validate/length",
                    qs: { value: "this thing" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("cannot validate text length range with a value too short", function(done) {
                request({
                    url: "http://localhost:3000/validate/length",
                    qs: { value: "I" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("cannot validate text length range with a value too long", function(done) {
                request({
                    url: "http://localhost:3000/validate/length",
                    qs: { value: "this is too long" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });
        });

        describe("Has, Match, Custom, and Properties", function() {

            it("can validate an input has a number", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/number",
                    qs: { value: "asdf8asdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate an input without a number", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/number",
                    qs: { value: "asdfasdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate an input has an uppercase letter", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/uppercase",
                    qs: { value: "asdf8Asdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate an input without an uppercase letter", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/uppercase",
                    qs: { value: "asdfasdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate an input has a lowercase letter", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/lowercase",
                    qs: { value: "ASDF8asdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate an input without a lowercase letter", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/lowercase",
                    qs: { value: "ASDF" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate an input has a symbol", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/symbol",
                    qs: { value: "asdf8a,sdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate an input without a symbol", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/symbol",
                    qs: { value: "asdfasdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate an input has whitespace", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/whitespace",
                    qs: { value: "asdf8asdf " }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate an input without whitespace", function(done) {
                request({
                    url: "http://localhost:3000/validate/has/whitespace",
                    qs: { value: "asdfasdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate a good input against a regular expression", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/regexp",
                    qs: { value: "5a" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate a bad input against a regular expression", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/regexp",
                    qs: { value: "asdfasdf" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate a good input against a selection", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/selection",
                    qs: { value: "option2" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate a bad input against a selection", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/selection",
                    qs: { value: "option3" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate a good input against a value", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/value",
                    qs: { value: "option" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate a bad input against a value", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/value",
                    qs: { value: "other" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate a good input against a function", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/function",
                    qs: { value: "value" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate a bad input against a function", function(done) {
                request({
                    url: "http://localhost:3000/validate/match/function",
                    qs: { value: "other" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate a good input against a custom validator", function(done) {
                request({
                    url: "http://localhost:3000/validate/custom",
                    qs: { value: "value" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate a bad input against a custom validator", function(done) {
                request({
                    url: "http://localhost:3000/validate/custom",
                    qs: { value: "other" }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

            it("can validate properties", function(done) {
                request({
                    url: "http://localhost:3000/validate/properties",
                    qs: { value: JSON.stringify({ int: 10, str: "okay" }) }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(200);
                    body.toString().should.equal("Success");
                    done();
                })
            });

            it("will invalidate bad properties", function(done) {
                request({
                    url: "http://localhost:3000/validate/properties",
                    qs: { value: JSON.stringify({ int: 10, str: "not okay" }) }
                }, function(err, response, body) {
                    expect(err).to.be.null;
                    response.statusCode.should.equal(400);
                    body.toString().should.equal("Bad request");
                    done();
                })
            });

        });

    });

});
