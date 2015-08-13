'use strict';

var Hapi = require('hapi');
var Routes = require('./lib/routes');

var server = new Hapi.Server();

server.connection({
    port: process.env.PORT || 5000
});

server.route(Routes);

if (!module.parent) {
    server.start(function() {
        console.log("Server started", server.info.uri);
    });
}

module.exports = server;