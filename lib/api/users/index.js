'use strict';

var Users = require('./users-model');

module.exports = {
    create: function (userData) {
        return Users.create({
            username: userData.username,
            email: userData.email
        });
    },

    read: function (id) {
        return Users.findById(id);
    },

    update: function () {

    },

    remove: function () {

    }
};

