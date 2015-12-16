'use strict';

const _ = require('lodash');
const Boom = require('boom');
const Joi = require('joi');
const Scopes = require('../../config/constants').Scopes;
const UserModel = require('../models').User;
const Uuid = require('uuid');

module.exports = {

    // Create user

    create: {
        auth: false,
        handler: (request, reply) => {

            const salt = Uuid.v1();

            request.payload.password = UserModel.hashPassword(request.payload.password, salt);
            request.payload.salt = salt;

            UserModel.create(request.payload)
                .then((user) => reply(
                    _.chain(user)
                        .pick(user, ['display_name', 'email', 'username'])
                        .mapKeys((value, key) => _.camelCase(key))
                ))
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
        /*auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },*/
        auth: false,
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

                    return reply(user);
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

            return reply('update user');
        }
    },


    // Delete user

    delete: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },
        handler: (request, reply) => {

            return reply('delete user');
        }
    }
};