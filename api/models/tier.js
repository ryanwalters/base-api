'use strict';

// Ported from weddingfoundry-dashboard

module.exports = internals.Tier = (sequelize, DataTypes) => {

    return sequelize.define('Tier', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        label: {
            type: DataTypes.STRING,
            unique: true
        },
        price: {
            type: DataTypes.INTEGER
        },
        description: {
            type: DataTypes.STRING
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    });
};