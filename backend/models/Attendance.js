const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    EmployeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employees',
            key: 'id'
        }
    },
    ProjectId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Proje ataması opsiyonel
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Geldi', 'Gelmedi', 'İzinli', 'Raporlu'),
        defaultValue: 'Geldi'
    },
    worked_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 8.0,
        validate: {
            min: 0,
            max: 24
        }
    },
    overtime_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 24
        }
    },
    notes: {
        type: DataTypes.TEXT
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['EmployeeId', 'ProjectId', 'date']
        }
    ]
});

module.exports = Attendance;
