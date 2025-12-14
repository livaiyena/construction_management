const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Project = require('./Project');
const Role = require('./Role');

const Employee = sequelize.define('Employee', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },

    RoleId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Geçici olarak null olabilir
        references: {
            model: Role,
            key: 'id'
        }
    },

    ProjectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: Project, key: 'id' }
    },
    
    phone: { type: DataTypes.STRING },
    daily_rate: { type: DataTypes.FLOAT, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Employee;