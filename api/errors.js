'use strict';


const internals = {
    STATUS_CODES: Object.setPrototypeOf({
        '0': 'Ok',
        '40001': 'Validation error',
        '40000': 'Unauthorized',
        '40101': 'Old password used',
        '40102': 'Password incorrect',
        '40300': 'Forbidden',
        '40301': 'Account creation error',
        '40302': 'User not found',
        '50000': 'Server error'
    }, null)
};

module.exports = Object.freeze({
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
    OLD_PASSWORD: {
        statusCode: 40101,
        message: 'Old password used'
    },
    PASSWORD_INCORRECT: {
        statusCode: 40102,
        message: 'Password incorrect'
    },
    FORBIDDEN: {
        statusCode: 40300,
        message: 'Forbidden'
    },
    ACCOUNT_CREATION_ERROR: {
        statusCode: 40301,
        message: 'Account creation error'
    }
});