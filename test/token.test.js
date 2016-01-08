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
    refreshToken: null
};


// Token tests

describe('/v1/token', () => {


    // Reset the DB and create an admin user

    before((done) => {
        Models.sequelize.sync({ force: true }).then(() => {

            server.inject({
                method: 'POST',
                url: '/v1/user',
                payload: internals.user
            }, () => {

                Models.User.update({ admin: true }, {
                    where: {
                        id: 1
                    }
                })
                    .then(() => done());
            });
        });
    });


    // Refresh token

    describe('POST /refresh - refresh token', () => {


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'POST',
                url: '/v1/token/refresh',
                payload: _.pick(internals.user, ['email', 'password'])
            };

            done();
        });


        // Tests

        it('fails with invalid payload', (done) => {

            options.payload = {};

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.VALIDATION_ERROR.message);
                expect(result.statusCode).to.equal(Status.VALIDATION_ERROR.statusCode);
                expect(result.errorDetails).to.be.an.array();
                expect(result.errorDetails).to.have.length(2);
                expect(result.errorDetails).to.deep.include({ path: 'email' });
                expect(result.errorDetails).to.deep.include({ path: 'password' });
                expect(result.data).to.be.an.object();
                expect(result.data).to.be.empty();
                done();
            });
        });

        it('fails when user does not exist', (done) => {

            options.payload.email = 'bad@email.com';

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

        it('successfully generates refresh token', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                internals.refreshToken = result.data.refreshToken;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.not.be.empty();
                done();
            });
        });
    });


    // Access token

    describe('POST /access - access token', () => {


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'POST',
                url: '/v1/token/access',
                headers: {
                    authorization: internals.refreshToken
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

        it('successfully generates an access token', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                internals.accessToken = result.data.accessToken;

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.not.be.empty();
                done();
            });
        });

        it('fails when user has invalid jti', (done) => {

            server.inject({
                method: 'POST',
                url: '/v1/token/revoke',
                headers: {
                    authorization: internals.accessToken
                },
                payload: {
                    userId: 1
                }
            }, () => {

                server.inject(options, (res) => {

                    const result = res.result;

                    expect(res.statusCode).to.equal(200);
                    expect(result.message).to.equal(Status.INVALID_TOKEN.message);
                    expect(result.statusCode).to.equal(Status.INVALID_TOKEN.statusCode);
                    expect(result.data).to.be.an.object();
                    expect(result.data).to.be.empty();
                    done();
                });
            });
        });

        it('fails when user does not exist', (done) => {

            server.inject({
                method: 'DELETE',
                url: '/v1/user/1',
                headers: {
                    authorization: internals.accessToken
                }
            }, () => {

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
    });


    // Revoke token

    describe('POST /revoke - revoke token', () => {


        // Create another user since we deleted the old one

        before((done) => {

            server.inject({
                method: 'POST',
                url: '/v1/user',
                payload: internals.user
            }, () => done());
        });


        // Set route options

        let options;

        beforeEach((done) => {

            options = {
                method: 'POST',
                url: '/v1/token/revoke',
                headers: {
                    authorization: internals.accessToken
                },
                payload: {
                    userId: 2
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

        it('successfully revokes token', (done) => {

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

        it('fails when user does not exist', (done) => {

            server.inject({
                method: 'DELETE',
                url: '/v1/user/2',
                headers: {
                    authorization: internals.accessToken
                }
            }, () => {

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
    });
});