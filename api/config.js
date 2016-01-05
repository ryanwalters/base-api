'use strict';

const Confidence = require('confidence');
const Package = require('../package');
const UserModel = require('./models/index').User;


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
        /*debug: {
            request: ['error']
        }*/
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
        },
        jwtRefresh: {
            $filter: 'env',
            $base: {
                issuer: 'weddingfoundry.com',
                validateFunc: (request, token, callback) => {

                    /**
                     * Steps:
                     * 1. look up user
                     * 2. if found, validate jti
                     * 3. if valid, continue
                     */

                    UserModel.findOne({
                        where: {
                            id: token.sub,
                            active: true
                        }
                    })
                        .then((user) => {

                            if (!user) {
                                return callback('No user found.', false);
                            }

                            if (token.jti === user.jti) {
                                return callback(null, true);
                            }

                            return callback(null, false);
                        })
                        .catch((error) => callback(error.message, false));
                }
            },
            production: {
                secret: process.env.JWT_SECRET
            },
            $default: {
                secret: 'NotVerySecret'
            }
        }
    }
};

const store = new Confidence.Store(config);

exports.get = (key) => store.get(key, criteria);
