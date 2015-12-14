'use strict';

const Confidence = require('confidence');
const Package = require('../package');


// Declare criteria

const criteria = {
    env: process.env.NODE_ENV || 'development'
};


// Config

const config = {
    version: Package.version,
    api: {
        version: '/v1'
    },
    server: {
        port: {
            $filter: 'env',
            production: process.env.PORT,
            $default: 5001
        }
    },
    jwt: {
        $filter: 'env',
        $base: {
            validateFunc: (request, token, callback) => {

                return callback(null, true);
            }
        },
        production: {
            secret: process.env.JWT_SECRET
        },
        $default: {
            secret: 'NotVerySecret'
        }
    }
};

const store = new Confidence.Store(config);

exports.get = (key) => store.get(key, criteria);
