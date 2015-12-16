'use strict';

const Boom = require('boom');
const Config = require('../../config/config');
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const Scopes = require('../../config/constants').Scopes;
const UserModel = require('../models').User;
const Uuid = require('uuid');

module.exports = {

    // Access token

    access: {
        auth: {
            strategy: 'jwt-refresh',
            scope: [Scopes.REFRESH]
        },
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
             * 2. if exists, validate password
             * 3. if valid, generate jti and update user
             * 4. return signed jwt
             */

            // todo: add facebook, gmail, linkedin strategies; 2. if isAuthenticated, continue to 3

            UserModel.findOne({
                where: {
                    email: request.payload.email,
                    active: true
                }
            })
                .then((user) => {

                    if (!user) {
                        return reply(Boom.unauthorized('User not found.'));
                    }

                    if (user.hasValidPassword(request.payload.password, user.password, user.salt)) {

                        user.jti = Uuid.v1();

                        UserModel.update(user.dataValues, {
                            where: {
                                id: user.id,
                                active: true
                            }
                        })
                            .then((data) => {

                                if (data[0] !== 1) {
                                    return reply(Boom.badImplementation('Must update single row.', { rowsAffected: data[0] }));
                                }

                                return reply({
                                    refreshToken: Jwt.sign({
                                        jti: user.jti,
                                        scope: [Scopes.REFRESH]
                                    }, Config.get('/auth/jwt/secret'), {
                                        subject: user.id
                                    })
                                });
                            })
                            .catch((error) => reply(Boom.badImplementation(error.message)));
                    }

                    else {
                        return reply(Boom.unauthorized('Incorrect password.'));
                    }

                    return null; // Stops bluebird from complaining...
                })
                .catch((error) => reply(Boom.badImplementation(error.message)));
        },
        validate: {
            payload: {
                email: Joi.string().email().required(),
                password: Joi.string().required()
            }
        }
    }
};