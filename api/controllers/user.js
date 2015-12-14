'use strict';

const Joi = require('joi');
const Scopes = require('../../config/constants').Scopes;

module.exports = {


    // Create user

    create: {
        auth: false,
        handler: (request, reply) => {

            return reply('user creation endpoint');
        },
        validate: {
            payload: {
                username: Joi.string().alphanum().min(3).max(30).description('Username must be unique'),
                email: Joi.string().email().required().description('Valid email required'),
                password: Joi.string().min(6).description('Password must be at least 6 characters'),
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