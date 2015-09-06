'use strict';

var Dnsimple = require('dnsimple')({
    email: process.env.DNSIMPLE_EMAIL,
    token: process.env.DNSIMPLE_TOKEN,
    hostname: process.env.DNSIMPLE_HOSTNAME
});