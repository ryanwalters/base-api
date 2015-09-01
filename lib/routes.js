'use strict';

var Namecheap = require('./api/namecheap/index');
var Request = require('request');
var UsersApi = require('./api/users/index');
var Xml2json = require('xml2json');


// API Server Endpoints

exports.endpoints = [

    { method: 'GET', path: '/domains/check', config: Namecheap.domains.check }
];

/*
module.exports = [];

// Index
module.exports.push({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply();
    }
});

// Users
module.exports.push({
    method: 'GET',
    path: '/users/{userId}',
    handler: function (request, reply) {
        UsersApi.read(encodeURIComponent(request.params.userId))
            .then(function (response) {
                reply(response);
            });
    }
});

module.exports.push({
    method: 'POST',
    path: '/users',
    handler: function (request, reply) {
        UsersApi.create({
                username: 'braveknave',
                email: 'braveknave@gmail.com'
            })
            .then(function (response) {
                reply(response);
            });
    }
});

module.exports.push({
    method: 'GET',
    path: '/domain',
    handler: function (request, reply) {
        Request('https://api.sandbox.namecheap.com/xml.response?ApiUser=weddingfoundry&ApiKey=4e813fc82db445ab921b13cb40941f43&UserName=weddingfoundry&ClientIp=121.22.123.22&Command=namecheap.domains.check&DomainList=domain1.com,domain2.com', function (err, response, body) {
            reply(Xml2json.toJson(body));
        });
    }
});

module.exports.push({
    method: 'GET',
    path: '/check',
    handler: function (request, reply) {
        console.log(request.info.remoteAddress);
        reply('ok');
    }
});*/