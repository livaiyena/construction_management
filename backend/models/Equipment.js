const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Equipment = sequelize.define('Equipment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        comment: 'Tip: Vinç, Ekskavatör, Kamyon, Elektrikli Alet, vs.'
    },
    serial_number: {
        type: DataTypes.STRING,
        unique: true
    },
    purchase_date: {
        type: DataTypes.DATEONLY
    },
    purchase_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    daily_rental_cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Günlük kiralama maliyeti'
    },
    condition: {
        type: DataTypes.ENUM('Mükemmel', 'İyi', 'Orta', 'Kötü', 'Bakımda'),
        defaultValue: 'İyi'
    },
    last_maintenance_date: {
        type: DataTypes.DATEONLY
    },
    next_maintenance_date: {
        type: DataTypes.DATEONLY
    },
    location: {
        type: DataTypes.STRING,
        comment: 'Şu anda nerede bulunuyor'
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Equipment;
