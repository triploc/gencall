module.exports = function(router, options) {

    console.log(router.paths());

    router.static(__dirname + "/content");

};
