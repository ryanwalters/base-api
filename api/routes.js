'use strict';

const Token = require('./controllers/token');
const User = require('./controllers/user');


// Routes

module.exports = [

    // Default

    { method: 'GET', path: '/', config: { auth: false, handler: (request, reply) => reply('hello!') } },

    // User

    { method: 'POST', path: '/user', config: User.create },
    { method: 'GET', path: '/user/{id}', config: User.read },
    { method: 'PUT', path: '/user/{id}', config: User.update },
    { method: 'DELETE', path: '/user/{id}', config: User.delete },
    { method: 'POST', path: '/user/{id}/password/update', config: User.updatePassword },

    // Tokens

    { method: 'POST', path: '/token/refresh', config: Token.refresh },
    { method: 'POST', path: '/token/access', config: Token.access },
    { method: 'POST', path: '/token/revoke/{id}', config: Token.revoke }
];