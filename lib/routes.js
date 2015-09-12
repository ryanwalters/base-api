'use strict';

var Dnsimple = require('./api/dnsimple');


// API Server Endpoints

exports.endpoints = [

    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            return reply('hello!');
        }
    },

    { method: 'GET', path: '/dnsimple/list', config: Dnsimple.list },
    { method: 'GET', path: '/dnsimple/check', config: Dnsimple.check }
];