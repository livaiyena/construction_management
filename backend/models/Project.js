const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    budget: {
        type: DataTypes.FLOAT, // Para birimi için FLOAT veya DECIMAL
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Planlama'
    },
    start_date: {
        type: DataTypes.DATEONLY, // Sadece tarih (saat yok)
        allowNull: false
    },
	userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Project;