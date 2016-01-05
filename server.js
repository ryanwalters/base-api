'use strict';

const _ = require('lodash');
const Config = require('./api/config');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Models = require('./api/models');
const Scopes = require('./api/constants').Scopes;
const Status = require('./api/constants').Status;
const WFResponse = require('./api/response');

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


    // Default, unprefixed route; todo: make these the docs (lout?)

    server.route({ method: 'GET', path: '/',
        config: {
            auth: false,
            handler: (request, reply) => reply('hello!')
        }
    });
});


// Format Boom validation errors

server.ext('onPreResponse', (request, reply) => {

    const response = request.response;

    if (response.isBoom && response.data && response.data.name === 'ValidationError') {

        const details = [];

        response.data.details.forEach((detail) => details.push(_.pick(detail, ['message', 'path'])));

        return reply(new WFResponse(Status.VALIDATION_ERROR, null, details));
    }

    return reply.continue();
});


// Start server

if (!module.parent) {
    Models.sequelize.sync(/*{ force: true }*/).then(() => {
        server.start(() => console.log('Server started', server.info.uri));
    });
}

module.exports = server;