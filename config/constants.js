'use strict';

module.exports = {

    Scopes: Object.freeze({
        ADMIN: 'admin',
        REFRESH: 'refresh',
        USER: 'user',
        USER_ID: 'user-{params.id}'
    }),

    Errors: Object.freeze({
        USER_NOT_FOUND: {
            errorCode: 10000,
            message: 'User not found.'
        }
    })
};