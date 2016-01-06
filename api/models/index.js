'use strict';

const Config = require('../config');
const Sequelize = require('sequelize');

const internals = {};
const sequelize = new Sequelize(Config.get('/db/url'), Config.get('/db/options'));

internals.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    User: sequelize.import(__dirname + '/user')
};

if (Config.get('/db/forceSync')) {
    internals.db.sequelize.sync({ force: true });
}

module.exports = internals.db;