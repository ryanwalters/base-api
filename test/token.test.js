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
    adminUser: {
        username: 'admin',
        password: '123456',
        email: 'admin@test.com',
        displayName: 'Jane Doe'
    },
    user: {
        username: 'test',
        password: '123456',
        email: 'test@test.com',
        displayName: 'John Doe'
    },
    refreshToken: null
};


// Token tests

describe('/v1/token', () => {


    // Reset the DB and create a new user

    before((done) => {
        Models.sequelize.sync({ force: true }).then(() => {

            // Create a normal user

            server.inject({
                method: 'POST',
                url: '/v1/user',
                payload: internals.user
            }, () => done());
        });
    });


    // Refresh token

    describe('POST /refresh', () => {


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

    describe('POST /access', () => {


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

        it('successfully generates an access token', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                console.log(result);

                expect(res.statusCode).to.equal(200);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.data).to.be.an.object();
                expect(result.data).to.not.be.empty();
                done();
            });
        });

        it('fails when user does not exist', (done) => {

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