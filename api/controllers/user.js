'use strict';

const _ = require('lodash');
const Boom = require('boom');
const Joi = require('joi');
const Scopes = require('../../config/constants').Scopes;
const UserModel = require('../models').User;
const Uuid = require('uuid');


// Declare internals

const internals = {};

internals.fields = ['display_name', 'email', 'username'];

internals.camelizeFields = (user) => _.chain(user)
    .pick(user, internals.fields)
    .mapKeys((value, key) => _.camelCase(key))
    .value();

internals.snakeFields = (user) => _.chain(user)
    .mapKeys((value, key) => _.snakeCase(key))
    .pick(user, internals.fields)
    .value();


// User endpoints

module.exports = {


    // Create user

    create: {
        auth: false,
        handler: (request, reply) => {

            const salt = Uuid.v1();

            request.payload.password = UserModel.hashPassword(request.payload.password, salt);
            request.payload.salt = salt;

            UserModel.create(request.payload)
                .then((user) => reply(internals.camelizeFields(user)))
                .catch((error) => {

                    const userCreationError = Boom.forbidden();

                    if (error.errors) {
                        userCreationError.output.payload.messages = _.map(error.errors, (error) => _.omit(error, 'path'));
                    }

                    return reply(userCreationError);
                });
        },
        validate: {
            payload: {
                username: Joi.string().alphanum().min(3).max(30).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
                display_name: Joi.string().min(3).max(30)
            }
        }
    },


    // Get user

    read: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },
        handler: (request, reply) => {

            UserModel.findOne({
                where: {
                    id: request.params.id,
                    active: true
                }
            })
                .then((user) => {

                    if (!user) {
                        return reply(Boom.unauthorized('User not found.'));
                    }

                    return reply(internals.camelizeFields(user));
                })
                .catch((error) => reply(Boom.badImplementation(error.message)));
        }
    },


    // Update user

    update: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },
        handler: (request, reply) => {

            UserModel.update(internals.snakeFields(request.payload), {
                where: {
                    id: request.auth.credentials.sub
                },
                returning: true
            })
                .then((response) => {

                    if (response[0] !== 1) {
                        return reply(Boom.badImplementation('Must update single row.', { rowsAffected: response[0] }));
                    }

                    return reply(internals.camelizeFields(response[1][0].dataValues));
                })
                .catch((error) => reply(Boom.badImplementation(error.message)));
        }
    },


    // Delete user

    delete: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },
        handler: (request, reply) => {

            UserModel.destroy({
                where: {
                    id: request.auth.credentials.sub
                },
                limit: 1
            })
                .then((rowsDeleted) => reply({
                    rowsDeleted: rowsDeleted
                }))
                .catch((error) => reply(Boom.badImplementation(error.message)));
        }
    },


    // Update password

    updatePassword: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },
        handler: (request, reply) => {

            /**
             * Steps:
             * 1. validate old password
             * 2. generate new salt
             * 3. hash new password
             * 4. update user with new salt and hash
             * 5. return status
             */

            UserModel.findOne({
                where: {
                    id: request.auth.credentials.sub
                }
            })
                .then((user) => {

                    if (!user) {
                        return reply(Boom.unauthorized('User not found.'));
                    }

                    if (user.hasValidPassword(request.payload.password, user.password, user.salt)) {

                        if (request.payload.password !== request.payload.newPassword) {

                            user.salt = Uuid.v1();
                            user.password = UserModel.hashPassword(request.payload.newPassword, user.salt);

                            UserModel.update(user.dataValues, {
                                    where: {
                                        id: user.id
                                    }
                                })
                                .then((response) => reply({
                                    rowsAffected: response[0]
                                }))
                                .catch((error) => reply(Boom.badImplementation(error.message)));
                        }

                        else {
                            return reply(Boom.unauthorized('New password must be different from previous password.'));
                        }
                    }

                    else {
                        return reply(Boom.unauthorized('Invalid password.'));
                    }

                    return null;
                })
                .catch((error) => reply(Boom.badImplementation(error.message)));
        },
        validate: {
            payload: {
                password: Joi.string().min(6).required().invalid('newPassword'),
                newPassword: Joi.string().min(6).required(),
                confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
            }
        }
    }
};