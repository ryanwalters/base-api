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

describe('/v1', () => {

    describe('GET /user/1', () => {

        it('fails without JWT', (done) => {

            server.inject({ method: 'GET', url: '/v1/user/1' }, (res) => {

                expect(res.statusCode).to.equal(401);
                done();
            });
        });
    });
});