'use strict';

const Config = require('../../config/config');
const Jwt = require('jsonwebtoken');
const Scopes = require('../../config/constants').Scopes;
const UserModel = require('../models').User;

module.exports = {

    // Access token

    access: {
        handler: (request, reply) => {

            return reply('access token');
        }
    },


    // Generate refresh token when user logs in

    refresh: {
        auth: false,
        handler: (request, reply) => {

            /**
             * Steps:
             * 1. lookup email
             * 2. if exists, compare password
             * 3. if valid, generate jti and update user
             * 4. return signed jwt
             */

            // todo: add facebook, gmail, linkedin strategies; 2. if isAuthenticated, continue to 3

            return reply('generate refresh token');

            /*return reply({
                accessToken: Jwt.sign({
                    jti: user.jti,
                    scope: [`${Scopes.USER}-${user.id}`]
                }, Config.get('/jwt/secret'), {
                    audience: user.username
                })
            });*/
        }
    }
};