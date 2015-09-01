'use strict';

var Constants = require('../../constants');
var DataTypes = require('sequelize');
var Sequelize = require('../../db/sequelize-wrapper');

var internals = {};

var Users = Sequelize.define('user', {
    username: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    }
});

Users.schema(Constants.API_VERSION);

//process.env.NODE_ENV === 'development' && Users.sync({ force: true });

module.exports = Users;