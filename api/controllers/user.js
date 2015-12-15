'use strict';

const _ = require('lodash');
const Boom = require('boom');
const Joi = require('joi');
const Scopes = require('../../config/constants').Scopes;
const UserModel = require('../models').User;

module.exports = {

    // Create user

    create: {
        auth: false,
        handler: (request, reply) => {

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

    find: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },
        handler: (request, reply) => {

            return reply('find user');
        }
    },


    // Update user

    update: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER]
        },
        handler: (request, reply) => {

            return reply('update user');
        }
    },


    // Delete user

    delete: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER]
        },
        handler: (request, reply) => {

            return reply('delete user');
        }
    }
};