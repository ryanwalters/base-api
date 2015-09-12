'use strict';

var Code = require('code');
var Lab = require('lab');
var Server = require('../server');

var lab = exports.lab = Lab.script();

var describe = lab.describe;
var expect = Code.expect;
var it = lab.it;

describe('dnsimple', function () {

    describe('domain check', function () {

        it('fails when no domain is passed as a parameter', function (done) {

            var options = { method: 'GET', url: '/dnsimple/check' };

            Server.inject(options, function (response) {

                expect(response.statusCode).to.equal(400);
                expect(response.result).to.exist();
                expect(response.result.message).to.include('Missing "domain" parameter.');

                done();
            });
        });

        it('fails when an invalid domain is passed as a parameter', function (done) {

            var options = { method: 'GET', url: '/dnsimple/check?domain=google' };

            Server.inject(options, function (response) {

                expect(response.statusCode).to.equal(400);
                expect(response.result).to.exist();
                expect(response.result.message).to.include('The domain name `weddingfoundry\' is invalid.');

                done();
            });
        });

        it('succeeds when a valid domain name is passed as a parameter', function (done) {

            var options = { method: 'GET', url: '/dnsimple/check?domain=google.com' };

            Server.inject(options, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist();
                expect(response.result.name).to.deep.include({ name: 'google.com' });

                done();
            });
        });
    });
});