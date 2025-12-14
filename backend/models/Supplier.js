const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_person: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    address: {
        type: DataTypes.TEXT
    },
    tax_number: {
        type: DataTypes.STRING
    },
    payment_terms: {
        type: DataTypes.STRING,
        comment: 'Ödeme koşulları (örn: 30 gün vadeli, peşin, vs.)'
    },
    rating: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        validate: {
            min: 1,
            max: 5
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Supplier;
