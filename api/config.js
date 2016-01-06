'use strict';

const Confidence = require('confidence');
const Package = require('../package');
const Path = require('path');


// Declare criteria

const criteria = {
    env: process.env.NODE_ENV
};


// Config

const config = {
    version: Package.version,
    api: {
        version: '/v1'
    },
    auth: {
        jwt: {
            $filter: 'env',
            $base: {
                issuer: 'weddingfoundry.com'
            },
            production: {
                secret: process.env.JWT_SECRET
            },
            $default: {
                secret: 'NotVerySecret'
            }
        }
    },
    connection: {
        port: {
            $filter: 'env',
            production: process.env.PORT,
            $default: 5001
        },
        routes: {
            cors: {
                origin: ['.weddingfoundry.com']
            }
        }
    },
    db: {
        forceSync: {
            $filter: 'env',
            test: true,
            $default: false
        },
        options: {
            $filter: 'env',
            test: {
                dialect: {
                    dialect: 'sqlite'
                }
            },
            $default: {
                dialect: 'postgres',
                dialectOptions: {
                    ssl: true
                }
            }
        },
        url: {
            $filter: 'env',
            test: Path.join('sqlite://', __dirname, '../test/database.sqlite'),
            $default: process.env.DATABASE_URL
        }
    },
    server: {}
};

const store = new Confidence.Store(config);

exports.get = (key) => store.get(key, criteria);
