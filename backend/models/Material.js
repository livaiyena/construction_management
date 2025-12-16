const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Material = sequelize.define('Material', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    MaterialCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'MaterialCategories',
            key: 'id'
        },
        comment: 'Kategori ID'
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Birim: kg, ton, m3, adet, vs.'
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    stock_quantity: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    minimum_stock: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        comment: 'Minimum stok seviyesi - altına düşerse uyarı'
    },
    SupplierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Suppliers',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Material;
