const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MaterialTransaction = sequelize.define('MaterialTransaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    MaterialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Materials',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('GİRİŞ', 'ÇIKIŞ', 'TRANSFER'),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        comment: 'Açıklama veya transfer ise nereye gittiği'
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = MaterialTransaction;
