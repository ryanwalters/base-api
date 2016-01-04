'use strict';

const _ = require('lodash');
const Joi = require('joi');
const Randomstring = require('randomstring');
const Scopes = require('../../config/constants').Scopes;
const WFResponse = require('../response');
const UserModel = require('../models').User;
const Uuid = require('uuid');


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
                .then((user) => reply(new WFResponse(0, user.safeFields())))
                .catch((error) => reply(new WFResponse(40301, null, error.errors)));
        },
        validate: {
            payload: {
                username: Joi.string().alphanum().min(3).max(30).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
                displayName: Joi.string().min(3).max(30)
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
                        return reply(new WFResponse(40302));
                    }

                    return reply(new WFResponse(0, user.safeFields()));
                })
                .catch((error) => reply(new WFResponse(50000)));
        }
    },


    // Update user

    update: {
        auth: {
            scope: [Scopes.ADMIN, Scopes.USER_ID]
        },
        handler: (request, reply) => {

            UserModel.update(request.payload, {
                where: {
                    id: request.auth.credentials.sub
                },
                returning: true
            })
                .then((response) => reply(new WFResponse(0, response[1][0].safeFields())))
                .catch((error) => reply(new WFResponse(50000)));
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
                .then((rowsAffected) => reply(new WFResponse(0, { rowsAffected: rowsAffected })))
                .catch((error) => reply(new WFResponse(50000)));
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
                        return reply(new WFResponse(40302));
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
                                .then((response) => reply(new WFResponse(0, { rowsAffected: response[0] })))
                                .catch((error) => reply(new WFResponse(50000)));
                        }

                        else {
                            return reply(new WFResponse(40101));
                        }
                    }

                    else {
                        return reply(new WFResponse(40102));
                    }

                    return null; // Stops bluebird from complaining...
                })
                .catch((error) => reply(new WFResponse(50000)));
        },
        validate: {
            payload: {
                newPassword: Joi.string().min(6).required(),
                confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).options({
                    language: {
                        any: {
                            allowOnly: '!!new passwords must match'
                        }
                    }
                }),
                password: Joi.string().min(6).required().invalid(Joi.ref('newPassword')).options({
                    language: {
                        any: {
                            invalid: '!!new password cannot match your current password'
                        }
                    }
                })
            }
        }
    },


    // Reset password

    resetPassword: {
        handler: (request, reply) => {

            /**
             * Steps
             * 1. generate new password and salt
             * 2. hash password
             * 3. update user with hashed password and salt
             * 4. email user with new randomly generated password // todo
             * 5. return rowsAffected
             */

            UserModel.findOne({
                where: {
                    id: request.payload.userId
                }
            })
                .then((user) => {

                    if (!user) {
                        return reply(new WFResponse(40302));
                    }

                    const password = Randomstring.generate();
                    const salt = Uuid.v1();

                    user.password = UserModel.hashPassword(password, salt);
                    user.salt = salt;

                    UserModel.update(user.dataValues, {
                        where: {
                            id: user.id
                        }
                    })
                        .then((response) => {

                            // todo: email user with password

                            return reply(new WFResponse(0, { rowsAffected: response[0] }));
                        })
                        .catch((error) => reply(new WFResponse(50000)));

                    return null; // Stops bluebird from complaining...
                })
                .catch((error) => reply(new WFResponse(50000)));
        },
        validate: {
            payload: {
                userId: Joi.number().required()
            }
        }
    }
};