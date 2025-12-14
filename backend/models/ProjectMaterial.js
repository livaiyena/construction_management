const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Many-to-Many ilişki tablosu: Projects <-> Materials
const ProjectMaterial = sequelize.define('ProjectMaterial', {
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
    MaterialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Materials',
            key: 'id'
        }
    },
    quantity_used: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Kullanılan miktar'
    },
    unit_price_at_time: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'O anki birim fiyat (fiyat değişikliklerini takip için)'
    },
    date_used: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    indexes: [
        {
            fields: ['ProjectId', 'MaterialId', 'date_used']
        }
    ]
});

module.exports = ProjectMaterial;
