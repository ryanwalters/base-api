'use strict';

var Sequelize = require('sequelize');

var internals = {};

module.exports = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: true
    }
});