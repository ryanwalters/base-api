'use strict';

const Config = require('../config');
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const Scopes = require('../constants').Scopes;
const Status = require('../constants').Status;
const UserModel = require('../models').User;
const Uuid = require('uuid');
const WFResponse = require('../response');


// Token generation endpoints

module.exports = {


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
                        return reply(new WFResponse(Status.USER_NOT_FOUND));
                    }

                    if (!user.hasValidPassword(request.payload.password, user.password, user.salt)) {
                        return reply(new WFResponse(Status.PASSWORD_INCORRECT));
                    }

                    const scope = [Scopes.REFRESH];

                    user.jti = Uuid.v1();

                    UserModel.update(user.dataValues, {
                        where: {
                            id: user.id,
                            active: true
                        }
                    })
                        .then(() => reply(new WFResponse(Status.OK, {
                            refreshToken: Jwt.sign({
                                jti: user.jti,
                                scope: scope
                            }, Config.get('/auth/jwt/secret'), {
                                issuer: Config.get('/auth/jwt/issuer'),
                                subject: user.id
                            })
                        })))
                        .catch((error) => reply(new WFResponse(Status.SERVER_ERROR, null, error)));

                    return null; // Stops bluebird from complaining...
                })
                .catch((error) => reply(new WFResponse(Status.SERVER_ERROR, null, error)));
        },
        validate: {
            payload: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            }).options({ abortEarly: false })
        }
    },


    // Generate access token from a refresh token

    access: {
        auth: {
            strategy: 'jwt-refresh',
            access: {
                scope: [Scopes.REFRESH]
            }
        },
        handler: (request, reply) => {

            const scope = [`${Scopes.USER}-${request.auth.credentials.sub}`];

            if (request.auth.credentials.scope.indexOf(Scopes.ADMIN) !== -1) {
                scope.push(Scopes.ADMIN);
            }

            return reply(new WFResponse(Status.OK, {
                accessToken: Jwt.sign({
                    scope: scope
                }, Config.get('/auth/jwt/secret'), {
                    expiresIn: 60 * 60,
                    issuer: Config.get('/auth/jwt/issuer'),
                    subject: request.auth.credentials.sub
                })
            }));
        }
    },


    // Revoke token

    revoke: {
        handler: (request, reply) => {

            /**
             * Steps:
             * 1. look up user
             * 2. generate new jti
             * 3. update user with new jti
             * 4. return number of affected rows
             */

            UserModel.findOne({
                where: {
                    id: request.payload.userId
                }
            })
                .then((user) => {

                    if (!user) {
                        return reply(new WFResponse(Status.USER_NOT_FOUND));
                    }

                    user.dataValues.jti = Uuid.v1();

                    UserModel.update(user.dataValues, {
                        where: {
                            id: user.id
                        }
                    })
                        .then(() => reply(new WFResponse(Status.OK)))
                        .catch((error) => reply(new WFResponse(Status.SERVER_ERROR, null, error)));

                    return null; // Stops bluebird from complaining...
                })
                .catch((error) => reply(new WFResponse(Status.SERVER_ERROR, null, error)));
        },
        validate: {
            payload: {
                userId: Joi.number().required()
            }
        }
    }
};