'use strict';

module.exports = {

    // Access token

    access: {
        handler: (request, reply) => {

            return reply('access token');
        }
    },


    // Refresh token

    refresh: {
        auth: {
            strategy: 'jwt-refresh',
            scope: false
        },
        handler: (request, reply) => {

            return reply('refresh token');
        }
    }
};