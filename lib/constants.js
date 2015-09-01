'use strict';

exports.API_VERSION = 'v1';

exports.DEFAULT_API_RESPONSE = {
    errorCode: 0,
    errorMessage: '',
    statusCode: 200,
    statusReason: 'OK'
};

exports.DEFAULT_NAMECHEAP_PARAMS = {
    ApiUser: process.env.NAMECHEAP_API_USER,
    ApiKey: process.env.NAMECHEAP_API_KEY,
    UserName: process.env.NAMECHEAP_API_USER
};