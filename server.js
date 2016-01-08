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

    const jwtRefreshOptions = Config.get('/auth/jwt');

    jwtRefreshOptions.validateFunc = (request, token, callback) => {

        /**
         * Steps:
         * 1. look up user
         * 2. if found, validate jti
         * 3. if valid, continue
         */

        Models.User.findOne({
            where: {
                id: token.sub,
                active: true
            }
        })
            .then((user) => {

                if (!user) {
                    return callback(Status.USER_NOT_FOUND, false);
                }

                if (user.admin) {
                    token.scope.push(Scopes.ADMIN);
                }

                if (token.jti === user.jti) {
                    return callback(null, true, token);
                }

                return callback(Status.INVALID_TOKEN, false);
            })
            .catch((error) => callback(error.message, false));
    };

    server.auth.strategy('jwt', 'jwt', Config.get('/auth/jwt'));
    server.auth.strategy('jwt-refresh', 'jwt', jwtRefreshOptions);

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


// Format validation and jwt errors

server.ext('onPreResponse', (request, reply) => {

    const response = request.response;

    if (response.isBoom && response.data && response.data.name === 'ValidationError') {

        const details = [];

        response.data.details.forEach((detail) => details.push(_.pick(detail, ['message', 'path'])));

        return reply(new WFResponse(Status.VALIDATION_ERROR, null, details));
    }

    if (response.isBoom && response.isJot) {

        switch (response.output.payload.message) {

            case Status.USER_NOT_FOUND:

                return reply(new WFResponse(Status.USER_NOT_FOUND));

            case Status.INVALID_TOKEN:

                return reply(new WFResponse(Status.INVALID_TOKEN));
        }
    }

    return reply.continue();
});


// Start server

/* $lab:coverage:off$ */
if (!module.parent) {
    Models.sequelize.sync(/*{ force: true }*/).then(() => {
        server.start(() => console.log('Server started', server.info.uri));
    });
}
/* $lab:coverage:on$ */

module.exports = server;