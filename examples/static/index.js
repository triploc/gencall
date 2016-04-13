module.exports = function(router, options) {

    router.static(__dirname + "/content");

    router.listFiles(function(err, files) {

    });

};
