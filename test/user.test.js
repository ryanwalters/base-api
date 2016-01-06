'use strict';

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


// User tests

describe('/v1/user', () => {


    // Create user

    describe('POST - create user', () => {

        before((done) => {
            Models.sequelize.sync({ force: true }).then(() => {
                done();
            });
        });

        let options;

        beforeEach((done) => {

            options  = {
                method: 'POST',
                url: '/v1/user',
                payload: {}
            };

            done();
        });

        it('fails user creation when required fields are missing', (done) => {

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.statusCode).to.equal(Status.VALIDATION_ERROR.statusCode);
                expect(result.message).to.equal(Status.VALIDATION_ERROR.message);
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

            options.payload = {
                username: 'test',
                password: 'password',
                email: 'test@weddingfoundry.com',
                displayName: 'John Doe'
            };

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.statusCode).to.equal(Status.OK.statusCode);
                expect(result.message).to.equal(Status.OK.message);
                expect(result.data.username).to.equal(options.payload.username);
                expect(result.data.email).to.equal(options.payload.email);
                expect(result.data.displayName).to.equal(options.payload.displayName);
                done();
            });
        });

        it('fails when user exists', (done) => {

            options.payload = {
                username: 'test',
                password: 'password',
                email: 'test@weddingfoundry.com',
                displayName: 'John Doe'
            };

            server.inject(options, (res) => {

                const result = res.result;

                expect(res.statusCode).to.equal(200);
                expect(result.statusCode).to.equal(Status.ACCOUNT_CREATION_ERROR.statusCode);
                expect(result.message).to.equal(Status.ACCOUNT_CREATION_ERROR.message);
                expect(result.errorDetails).to.be.array();
                expect(result.errorDetails).to.deep.include({ type: 'unique violation' });
                expect(result.data).to.be.empty();
                done();
            });
        });
    });


    // Get user details

    describe('GET /{userId} - user details', () => {

        it('fails without JWT', (done) => {

            server.inject({ method: 'GET', url: '/v1/user/1' }, (res) => {

                expect(res.statusCode).to.equal(401);
                done();
            });
        });
    });
});