'use strict';

const _ = require('lodash');
const Code = require('code');
const Lab = require('lab');
const Status = require('../api/constants').Status;
const Models = require('../api/models');


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;
const before = lab.before;
const beforeEach = lab.beforeEach;

const server = require('../server');


// Declare internals

const internals = {
    user: {
        username: 'test',
        password: '123456',
        email: 'test@weddingfoundry.com',
        displayName: 'John Doe'
    },
    accessToken: null,
    adminAccessToken: null,
    refreshToken: null
};


// User tests

describe('/v1/user', () => {


    // Create user

    describe('POST - create user', () => {


        // Reset the DB

        before((done) => {
            Models.sequelize.sync({ force: true }).then(() => {
                done();
            });
        });


        // Set route options

        let options;

        beforeEach((done) => {

            options  = {
                method: 'POST',
                url: '/v1/user',
                payload: {}
            };

            done();
        });


        // Tests

        it('fails user creation when required fields are missing', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.VALIDATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.VALIDATION_ERROR.statusCode);
                expect(result.data).to.be.empty();
                expect(result.errorDetails).to.be.an.array();
                expect(result.errorDetails).to.have.length(3);
                expect(result.errorDetails).to.deep.include({ path: 'username' });
                expect(result.errorDetails).to.deep.include({ path: 'password' });
                expect(result.errorDetails).to.deep.include({ path: 'email' });
                done();
            });
        });

        it('successfully creates user', (done) => {

            options.payload = internals.user;

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.data).to.be.an.object();

                // todo: check safeFields vs hard coding fields
                expect(result.data.username).to.equal(options.payload.username);
                expect(result.data.email).to.equal(options.payload.email);
                expect(result.data.displayName).to.equal(options.payload.displayName);
                done();
            });
        });

        it('fails when user exists', (done) => {

            options.payload = internals.user;

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.ACCOUNT_CREATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.ACCOUNT_CREATION_ERROR.statusCode);
                expect(result.errorDetails).to.be.array();
                expect(result.errorDetails).to.deep.include({ type: 'unique violation' });
                expect(result.data).to.be.empty();
                done();
            });
        });
    });


    // Get user details

    describe('GET /{id} - user details', () => {


        // Retrieve access tokens for normal and admin users

        before((done) => {


            // Get refresh token

            server.inject({ method: 'POST', url: '/v1/token/refresh',
                payload: _.pick(internals.user, ['email', 'password'])
            }, (res) => {

                internals.refreshToken = res.result.refreshToken;


                // Get normal access token

                server.inject({ method: 'POST', url: '/v1/token/access',
                    headers: { authorization: internals.refreshToken }
                }, (res) => {

                    internals.accessToken = res.result.accessToken;


                    // Make user an admin and get the admin access token

                    Models.User.update({ admin: true }, {
                        where: {
                            id: 1
                        }
                    })
                        .then(() => {

                            server.inject({ method: 'POST', url: '/v1/token/access',
                                headers: { authorization: internals.refreshToken }
                            }, (res) => {

                                internals.adminAccessToken = res.result.accessToken;
                                done();
                            });
                        });
                });
            });
        });


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'GET',
                url: '/v1/user/1',
                headers: {
                    authorization: internals.accessToken
                }
            };

            done();
        });


        // Tests

        it('fails without jwt', (done) => {

            delete options.headers;

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(401);
                done();
            });
        });

        it('successfully retrieves user details', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.deep.equal(_.omit(internals.user, 'password'));
                done();
            });
        });

        it('fails when user has insufficient scope', (done) => {

            options.url = '/v1/user/123';

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(403);
                done();
            });
        });

        it('fails when user does not exist', (done) => {

            options.headers.authorization = internals.adminAccessToken;
            options.url = '/v1/user/123';

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.USER_NOT_FOUND.message);
                expect(result.statusCode).to.equal(Status.USER_NOT_FOUND.statusCode);
                expect(result.data).to.be.empty();
                done();
            });
        });
    });


    // Update user

    describe('PUT /{id} - update user', () => {


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'PUT',
                url: '/v1/user/1',
                headers: {
                    authorization: internals.accessToken
                },
                payload: {}
            };

            done();
        });


        // Tests

        it('fails without jwt', (done) => {

            delete options.headers;

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(401);
                done();
            });
        });

        it('fails to update password', (done) => {

            options.payload = {
                password: '123456'
            };

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.VALIDATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.VALIDATION_ERROR.statusCode);
                expect(result.errorDetails).to.be.an.array();
                expect(result.errorDetails).to.deep.include({ path: 'password' });
                done();
            });
        });

        it('successfully updates user', (done) => {

            options.payload = _.chain(internals.user)
                .omit('password')
                .mapValues((value) => '2' + value)
                .value();

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();
                done();
            });
        });

        it('fails when user has insufficient scope', (done) => {

            options.url = '/v1/user/123';

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(403);
                done();
            });
        });

        it('fails when user does not exist', (done) => {

            options.headers.authorization = internals.adminAccessToken;
            options.url = '/v1/user/123';

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.USER_NOT_FOUND.message);
                expect(result.statusCode).to.equal(Status.USER_NOT_FOUND.statusCode);
                done();
            });
        });
    });


    // Update password

    describe('POST /{id}/password/update', () => {


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'POST',
                url: '/v1/user/1/password/update',
                headers: {
                    authorization: internals.accessToken
                },
                payload: {
                    newPassword: '1234567',
                    confirmPassword: '1234567',
                    password: internals.user.password
                }
            };

            done();
        });


        // Tests

        it('fails without jwt', (done) => {

            delete options.headers;

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(401);
                done();
            });
        });

        it('fails with invalid payload', (done) => {

            options.payload = {};

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.VALIDATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.VALIDATION_ERROR.statusCode);
                expect(result.errorDetails).to.be.an.array();
                expect(result.errorDetails).to.have.length(3);
                expect(result.errorDetails).to.deep.include({ path: 'newPassword' });
                expect(result.errorDetails).to.deep.include({ path: 'confirmPassword' });
                expect(result.errorDetails).to.deep.include({ path: 'password' });
                done();
            });
        });

        it('successfully updates password', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.deep.equal({ rowsAffected: 1 });
                done();
            });
        });
    });
});