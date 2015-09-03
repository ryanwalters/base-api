'use strict';

var Boom = require('boom');
var Constants = require('../../constants');
var Hoek = require('hoek');
var Qs = require('qs');
var Request = require('request');
var Utils = require('../../utils');
var Xml2json = require('xml2json');


// Declare internals

var internals = {

    namecheapRequest: function (request, reply) {

        Request(process.env.NAMECHEAP_SERVER_URL + Qs.stringify(request), function (error, response, body) {

            if (error) {
                return reply(error);
            }

            if (!body) {
                return reply(Boom.notFound());
            }

            var apiResponse = JSON.parse(Xml2json.toJson(body)).ApiResponse;

            console.log(apiResponse.RequestedCommand, response.statusCode);

            Utils.removeKeys(apiResponse, ['xmlns', 'RequestedCommand', 'Server']);
            Utils.removeKeys(apiResponse.CommandResponse, ['Type']);

            return reply(JSON.stringify(apiResponse));
        });
    }
};


// Check for domain availability

exports.check = {
    auth: false,
    handler: function (request, reply) {

        if (!(request.query && request.query.domainList)) {
            return reply(Boom.badRequest('Invalid query.', request.query));
        }

        var ncRequest = Hoek.applyToDefaults(Constants.NAMECHEAP_GLOBAL_PARAMS, {
            Command: 'namecheap.domains.check',
            ClientIp: request.info.remoteAddress,
            DomainList: request.query.domainList
        });

        internals.namecheapRequest(ncRequest, reply);
    }
};