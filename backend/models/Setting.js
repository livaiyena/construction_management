const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define('Setting', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.STRING, // "true", "false" vb.
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'settings',
    timestamps: false
});

module.exports = Setting;
