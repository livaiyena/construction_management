const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Activity = sequelize.define('Activity', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.STRING, allowNull: false }, // Örn: "Yeni proje eklendi: Vadi İstanbul"
    type: { type: DataTypes.STRING, defaultValue: 'info' }, // 'info', 'success', 'warning', 'danger'
    userId: { type: DataTypes.INTEGER, allowNull: false } // İşlemi kim yaptı?
});

module.exports = Activity;