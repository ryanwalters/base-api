'use strict';

const Hoek = require('hoek');


// Declare internals

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


// Response class

module.exports = class WFResponse {

    constructor(statusCode, data, errorDetails) {

        const codeNumber = parseInt(statusCode, 10);

        Hoek.assert(!Number.isNaN(codeNumber), `First argument must be a number: ${codeNumber}`);
        Hoek.assert(internals.STATUS_CODES[codeNumber] !== undefined, `Invalid status code: ${codeNumber}`);

        this.data = data || {};
        this.statusCode = codeNumber;
        this.message = internals.STATUS_CODES[codeNumber];

        if (errorDetails) {
            this.errorDetails = errorDetails;
        }
    }
};