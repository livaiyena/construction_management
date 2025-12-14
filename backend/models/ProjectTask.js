const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProjectTask = sequelize.define('ProjectTask', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 100 }
    },
    status: {
        type: DataTypes.ENUM('Planlandı', 'Devam Ediyor', 'Tamamlandı', 'Gecikmiş'),
        defaultValue: 'Planlandı'
    },
    dependencies: {
        type: DataTypes.STRING,
        comment: 'Virgülle ayrılmış ID listesi, örn: "1,2"'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = ProjectTask;
