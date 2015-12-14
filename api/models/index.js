'use strict';

const Sequelize = require('sequelize');

const internals = {};
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: true
    }
});

internals.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    User: sequelize.import(__dirname + '/user')
};

module.exports = internals.db;