'use strict';

const Config = require('./config/config');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Models = require('./api/models');
const Routes = require('./api/routes');

const server = new Hapi.Server();


server.connection({
    port: Config.get('/server/port'),
    routes: {
        cors: true
    }
});


// Register authentication strategies

server.register(require('jot'), (err) => {

    Hoek.assert(!err, err);


    // JWT

    server.auth.strategy('jwt', 'jwt', Config.get('/jwt'));
    server.auth.strategy('jwt-refresh', 'jwt', Config.get ('/jwt'));

    server.auth.default({
        strategy: 'jwt',
        scope: 'admin'
    });
});

server.route(Routes);

// Start server

if (!module.parent) {
    Models.sequelize.sync(/*{ force: true }*/).then(() => {
        server.start(() => console.log('Server started', server.info.uri));
    });
}

module.exports = server;