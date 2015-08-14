'use strict';

module.exports = [];

// Index
module.exports.push({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply();
    }
});

// Users
module.exports.push({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {
        reply({ response: 'ok' });
    }
});