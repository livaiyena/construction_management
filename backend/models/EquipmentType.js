const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EquipmentType = sequelize.define('EquipmentType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = EquipmentType;
