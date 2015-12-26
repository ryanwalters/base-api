'use strict';

const Config = require('./config/config');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Models = require('./api/models');
const Scopes = require('./config/constants').Scopes;

const server = new Hapi.Server(Config.get('/server'));

server.connection(Config.get('/connection'));


// Authentication strategies

server.register(require('jot'), (err) => {

    Hoek.assert(!err, err);


    // JWT

    server.auth.strategy('jwt', 'jwt', Config.get('/auth/jwt'));
    server.auth.strategy('jwt-refresh', 'jwt', Config.get('/auth/jwtRefresh'));

    server.auth.default({
        strategy: 'jwt',
        scope: [Scopes.ADMIN]
    });
});


// Routes

server.register(require('./api/routes'), {
    routes: {
        prefix: Config.get('/api/version')
    }
}, (err) => {

    Hoek.assert(!err, err);


    // Default, unprefixed route

    server.route({ method: 'GET', path: '/',
        config: {
            auth: false,
            handler: (request, reply) => reply('hello!')
        }
    });
});


// Start server

if (!module.parent) {
    Models.sequelize.sync(/*{ force: true }*/).then(() => {
        server.start(() => console.log('Server started', server.info.uri));
    });
}

module.exports = server;