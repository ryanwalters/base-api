'use strict';

const Crypto = require('crypto');

const internals = {};

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
        password: DataTypes.STRING,
        salt: DataTypes.UUID,
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
            hash: (password, salt) => Crypto.createHmac('sha256', salt).update(password).digest('hex')
        },
        instanceMethods: {
            isValidPassword: (password) => {

            }
        }
    });
};