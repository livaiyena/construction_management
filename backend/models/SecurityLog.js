const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SecurityLog = sequelize.define('SecurityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true // Silinen kullanıcıların logları kalabilsin diye opsiyonel bırakabiliriz veya db constraint ile hallederiz.
    },
    userName: {
        type: DataTypes.STRING, // Kullanıcı silinirse adı burada kalsın
        allowNull: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = SecurityLog;
