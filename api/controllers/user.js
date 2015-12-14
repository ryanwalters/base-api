'use strict';

const _ = require('lodash');
const Boom = require('boom');
const Config = require('../../config/config');
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const Scopes = require('../../config/constants').Scopes;
const UserModel = require('../models').User;

module.exports = {

    // Create user

    create: {
        auth: false,
        handler: (request, reply) => {

            // todo: save jti to user

            UserModel.create(_.assign({}, request.payload))
                .then((user) => {

                    return reply({
                        accessToken: Jwt.sign({
                            scope: [`user-${user.id}`]
                        }, Config.get('/jwt/secret'), {
                            audience: user.username,
                            expiresIn: 60 * 60 * 24
                        })
                    });
                })
                .catch((error) => {

                    error.errors.forEach(error => {

                        switch (error.type) {
                            case 'unique violation':
                                return reply(Boom.conflict('User already exists.'));
                            default:
                                return reply(Boom.badRequest());
                        }
                    });
                });
        },
        validate: {
            payload: {
                username: Joi.string().alphanum().min(3).max(30).required(),
                email: Joi.string().email().required().required(),
                password: Joi.string().min(6),
                display_name: Joi.string().min(3).max(30)
            }
        }
    },


    // Get user

    find: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER]
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