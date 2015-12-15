'use strict';

const Crypto = require('crypto');

const internals = {};

internals.hash = (password, salt) => Crypto.createHmac('sha256', salt).update(password).digest('hex');

module.exports = internals.User = (sequelize, DataTypes) => {

    return sequelize.define('User', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        display_name: DataTypes.STRING,
        password: DataTypes.STRING,
        salt: DataTypes.UUID,
        jti: DataTypes.UUID,
        createdAt: {
            allowNull: false,
            defaultValue: DataTypes.NOW,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            defaultValue: DataTypes.NOW,
            type: DataTypes.DATE
        }
    }, {
        classMethods: {
            associate: (models) => {

                //models.User.hasOne(models.Tier);
            },
            hashPassword: (password, salt) => internals.hash
        },
        instanceMethods: {
            isValidPassword: (password, hash, salt) => password === internals.hash(hash, salt)
        }
    });
};