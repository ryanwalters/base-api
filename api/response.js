'use strict';

const Config = require('./config');
const Hoek = require('hoek');


// Response class

module.exports = class WFResponse {

    constructor(status, data, errorDetails) {

        const codeNumber = parseInt(status.statusCode, 10);

        Hoek.assert(!Number.isNaN(codeNumber), `First argument must be a number: ${codeNumber}`);
        Hoek.assert(status === Object(status), 'First argument is invalid');

        this.data = data || {};
        this.statusCode = codeNumber;
        this.message = status.message;

        if (errorDetails && Config.get('/showServerErrors')) {
            this.errorDetails = errorDetails;
        }
    }
};