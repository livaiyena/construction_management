const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SiteDiary = sequelize.define('SiteDiary', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ProjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    weather_condition: {
        type: DataTypes.STRING,
        comment: 'Güneşli, Yağmurlu, Karlı, Bulutlu'
    },
    temperature: {
        type: DataTypes.INTEGER
    },
    worker_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    work_summary: {
        type: DataTypes.TEXT,
        comment: 'Yapılan işlerin özeti'
    },
    notes: {
        type: DataTypes.TEXT,
        comment: 'Şantiye şefi notları'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = SiteDiary;
