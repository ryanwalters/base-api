'use strict';

const Code = require('code');
const Lab = require('lab');


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

const server = require('../server');


// User endpoints tests

describe('/user endpoints', () => {

    describe('GET /user', () => {

        it('fails without valid JWT', (done) => {

            server.inject('/user', (res) => {

                expect(res.statusCode).to.equal(403);
                done();
            });
        });
    });
});