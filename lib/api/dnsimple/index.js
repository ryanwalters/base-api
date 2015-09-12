'use strict';

var Boom = require('boom');
var Dnsimple = require('dnsimple')({
    email: process.env.DNSIMPLE_EMAIL,
    token: process.env.DNSIMPLE_TOKEN,
    hostname: process.env.DNSIMPLE_HOSTNAME
});
var Hoek = require('hoek');


// Check domain availability

exports.check = {

    handler: function (request, reply) {

        Hoek.assert(request.query, 'Missing "domain" parameter');
        Hoek.assert(request.query.domain, 'Missing "domain" parameter');

        Dnsimple('GET', '/domains/' + request.query.domain + '/check', function (err, data) {

            if (err) {
                switch (err.code) {
                    case 404:
                        return reply(err.data);
                    default:
                        return reply(Boom.create(err.code, err.error, err.data));
                }
            }

            return reply(data);
        });
    }
};


// List all domains

exports.list = {

    handler: function (request, reply) {

        Dnsimple('GET', '/domains', function (err, data) {

            if (err) {
                return reply(Boom.create(err.code, err.error));
            }

            return reply(data);
        });
    }
};