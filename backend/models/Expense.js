const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ProjectId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Genel harcamalar için opsiyonel
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Kategori: Maaş, Malzeme, Ekipman, Ulaşım, Yemek, vs.'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    payment_method: {
        type: DataTypes.STRING,
        comment: 'Ödeme yöntemi: Nakit, Kredi Kartı, Havale, vs.'
    },
    receipt_number: {
        type: DataTypes.STRING,
        comment: 'Fiş/Fatura numarası'
    },
    paid_to: {
        type: DataTypes.STRING,
        comment: 'Kime ödendi'
    },
    approved_by: {
        type: DataTypes.STRING,
        comment: 'Kim onayladı'
    },
    status: {
        type: DataTypes.ENUM('Beklemede', 'Onaylandı', 'Ödendi', 'İptal'),
        defaultValue: 'Beklemede'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    indexes: [
        { fields: ['category'] },
        { fields: ['expense_date'] },
        { fields: ['status'] },
        { fields: ['ProjectId'] }
    ]
});

module.exports = Expense;
