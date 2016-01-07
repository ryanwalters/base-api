'use strict';

module.exports = {

    // Scopes

    Scopes: Object.freeze({
        ADMIN: 'admin',
        REFRESH: 'refresh',
        USER: 'user',
        USER_ID: 'user-{params.id}'
    }),


    // Status codes

    Status: Object.freeze({
        OK: {
            statusCode: 0,
            message: 'Ok'
        },
        UNAUTHORIZED: {
            statusCode: 40000,
            message: 'Unauthorized'
        },
        VALIDATION_ERROR: {
            statusCode: 40001,
            message: 'Validation error'
        },
        FORBIDDEN: {
            statusCode: 40300,
            message: 'Forbidden'
        },
        ACCOUNT_CREATION_ERROR: {
            statusCode: 40301,
            message: 'Account creation error'
        },
        USER_NOT_FOUND: {
            statusCode: 40302,
            message: 'User not found'
        },
        PASSWORD_INCORRECT: {
            statusCode: 40303,
            message: 'Password incorrect'
        },
        SERVER_ERROR: {
            statusCode: 50000,
            message: 'Server error'
        }
    })
};