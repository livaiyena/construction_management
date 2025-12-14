const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    
    default_daily_rate: { type: DataTypes.FLOAT, defaultValue: 0 },
    
    userId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Role;