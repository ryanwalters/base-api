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
        email: 'test@test.com',
        displayName: 'John Doe'
    },
    accessToken: null,
    adminAccessToken: null,
    refreshToken: null
};


// User tests

describe('/v1/user', () => {


    // Reset the DB

    before((done) => {
        Models.sequelize.sync({ force: true }).then(() => {
            done();
        });
    });


    // Create user

    describe('POST - create user', () => {


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
                expect(result.errorDetails).to.be.an.array();
                expect(result.errorDetails).to.have.length(3);
                expect(result.errorDetails).to.deep.include({ path: 'username' });
                expect(result.errorDetails).to.deep.include({ path: 'password' });
                expect(result.errorDetails).to.deep.include({ path: 'email' });
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('successfully creates user', (done) => {

            options.payload = internals.user;

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();

                Models.User.safeFields.forEach((field) => {
                    expect(result.data.user[field]).to.equal(options.payload[field]);
                });

                expect(result.data.accessToken).to.exist();
                expect(result.data.refreshToken).to.exist();

                done();
            });
        });

        it('fails when user already exists', (done) => {

            options.payload = internals.user;

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.ACCOUNT_CREATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.ACCOUNT_CREATION_ERROR.statusCode);
                expect(result.errorDetails).to.be.array();
                expect(result.errorDetails).to.deep.include({ type: 'unique violation' });
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('successfully creates user w/out returning tokens', (done) => {

            options.payload = _.transform(internals.user, (result, value, key) => result[key] = value + '2');
            options.payload.returnToken = false;

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();

                Models.User.safeFields.forEach((field) => {
                    expect(result.data.user[field]).to.equal(options.payload[field]);
                });

                expect(result.data.accessToken).to.not.exist();
                expect(result.data.refreshToken).to.not.exist();

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

                internals.refreshToken = res.result.data.refreshToken;


                // Get normal access token

                server.inject({ method: 'POST', url: '/v1/token/access',
                    headers: { authorization: internals.refreshToken }
                }, (res) => {

                    internals.accessToken = res.result.data.accessToken;


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

                                internals.adminAccessToken = res.result.data.accessToken;
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
                expect(Models.User.safeFields.every(_.partial(_.has, result.data))).to.equal(true);
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
                expect(result.data).to.be.an.object();
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
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
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
                expect(result.data).to.be.empty();
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
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });
    });


    // Update password

    describe('POST /{id}/password/update - update password', () => {


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
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('fails when user has insufficient scope', (done) => {

            options.url = '/v1/user/123/password/update';

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(403);
                done();
            });
        });

        it('fails when user does not exist', (done) => {

            options.headers.authorization = internals.adminAccessToken;
            options.url = '/v1/user/123/password/update';

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.USER_NOT_FOUND.message);
                expect(result.statusCode).to.equal(Status.USER_NOT_FOUND.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('fails when new password does not match confirm password', (done) => {

            options.payload.confirmPassword = 'wrong password';

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.VALIDATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.VALIDATION_ERROR.statusCode);
                expect(result.errorDetails).to.be.an.array();
                expect(result.errorDetails).to.deep.include({ path: 'confirmPassword' });
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('fails when user enters old password as new password', (done) => {

            options.payload.newPassword = options.payload.password;
            options.payload.confirmPassword = options.payload.password;

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.VALIDATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.VALIDATION_ERROR.statusCode);
                expect(result.errorDetails).to.be.an.array();
                expect(result.errorDetails).to.deep.include({ path: 'newPassword' });
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('fails when user enters incorrect password', (done) => {

            options.payload.password = 'wrong password';

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.PASSWORD_INCORRECT.message);
                expect(result.statusCode).to.equal(Status.PASSWORD_INCORRECT.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('successfully updates password', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });
    });


    // Reset password

    describe('POST /password/reset - reset password', () => {


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'POST',
                url: '/v1/user/password/reset',
                headers: {
                    authorization: internals.adminAccessToken
                },
                payload: {
                    userId: 1
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
                expect(result.errorDetails).to.have.length(1);
                expect(result.errorDetails).to.deep.include({ path: 'userId' });
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('fails when user has insufficient scope', (done) => {

            options.headers.authorization = internals.accessToken;

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(403);
                done();
            });
        });

        it('fails when user does not exist', (done) => {

            options.payload.userId = '123';

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.USER_NOT_FOUND.message);
                expect(result.statusCode).to.equal(Status.USER_NOT_FOUND.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('successfully resets password', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });
    });


    // Delete user

    describe('DELETE /{id} - delete user', () => {


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'DELETE',
                url: '/v1/user/1',
                headers: {
                    authorization: internals.adminAccessToken
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

        it('fails when user has insufficient scope', (done) => {

            options.headers.authorization = internals.accessToken;
            options.url = '/v1/user/123';

            server.inject(options, (res) => {

                expect(res.statusCode).to.equal(403);
                done();
            });
        });

        it('fails when user does not exist', (done) => {

            options.url = '/v1/user/123';

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.USER_NOT_FOUND.message);
                expect(result.statusCode).to.equal(Status.USER_NOT_FOUND.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('successfully deletes user', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });
    });
});