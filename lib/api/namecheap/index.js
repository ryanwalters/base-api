'use strict';

// Declare internals

var internals = {};


// Namecheap endpoints

internals.endpoints = [

    // domains

    'namecheap.domains.check',
    'namecheap.domains.create',
    'namecheap.domains.getContacts',
    'namecheap.domains.getInfo',
    'namecheap.domains.getList',
    'namecheap.domains.getRegistrarLock',
    'namecheap.domains.getTldList',
    'namecheap.domains.reactivate',
    'namecheap.domains.renew',
    'namecheap.domains.setContacts',
    'namecheap.domains.setRegistrarLock',


    // domains.dns

    'namecheap.domains.dns.getEmailForwarding',
    'namecheap.domains.dns.getHosts',
    'namecheap.domains.dns.getList',
    'namecheap.domains.dns.setCustom',
    'namecheap.domains.dns.setDefault',
    'namecheap.domains.dns.setEmailForwarding',
    'namecheap.domains.dns.setHosts',


    // domains.ns

    'namecheap.domains.ns.create',
    'namecheap.domains.ns.delete',
    'namecheap.domains.ns.getInfo',
    'namecheap.domains.ns.update',


    // domains.transfer

    'namecheap.domains.transfer.create',
    'namecheap.domains.transfer.getList',
    'namecheap.domains.transfer.getStatus',
    'namecheap.domains.transfer.updateStatus',


    // ssl

    'namecheap.ssl.activate',
    'namecheap.ssl.create',
    'namecheap.ssl.getApproverEmailList',
    'namecheap.ssl.getInfo',
    'namecheap.ssl.getList',
    'namecheap.ssl.parseCSR',
    'namecheap.ssl.purchasemoresans',
    'namecheap.ssl.renew',
    'namecheap.ssl.resendApproverEmail',
    'namecheap.ssl.reissue',
    'namecheap.ssl.resendfullfillmentemail',
    'namecheap.ssl.revokecertificate',


    // users

    'namecheap.users.changePassword',
    'namecheap.users.createaddfundsrequest',
    'namecheap.users.getAddFundsStatus',
    'namecheap.users.getBalances',
    'namecheap.users.getPricing',
    'namecheap.users.login',
    'namecheap.users.resetPassword',
    'namecheap.users.update',


    // users.address

    'namecheap.users.address.create',
    'namecheap.users.address.delete',
    'namecheap.users.address.getInfo',
    'namecheap.users.address.getList',
    'namecheap.users.address.setDefault',
    'namecheap.users.address.update',


    // whoisguard

    'namecheap.whoisguard.allot',
    'namecheap.whoisguard.changeemailaddress',
    'namecheap.whoisguard.disable',
    'namecheap.whoisguard.discard',
    'namecheap.whoisguard.enable',
    'namecheap.whoisguard.getList',
    'namecheap.whoisguard.renew',
    'namecheap.whoisguard.unallot'
];


// API Server Endpoints

exports.domains = require('./domains');