const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Many-to-Many ilişki tablosu: Projects <-> Equipment
const ProjectEquipment = sequelize.define('ProjectEquipment', {
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
    EquipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Equipment',
            key: 'id'
        }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY
    },
    daily_cost: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Bu proje için günlük maliyet'
    },
    total_days_used: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    indexes: [
        {
            fields: ['ProjectId', 'EquipmentId']
        }
    ]
});

module.exports = ProjectEquipment;
