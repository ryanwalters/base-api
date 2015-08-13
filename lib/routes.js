'use strict';

module.exports = [];

// Users
module.exports.push({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {
        reply('ok');
    }
});