'use strict';

var Hapi = require('hapi');

var server = new Hapi.Server();

server.connection({
    port: process.env.PORT || 5000
});

if (!module.parent) {
    server.start(function() {
        console.log("Server started", server.info.uri);
    });
}

module.exports = server;