const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Tip: Sözleşme, Ruhsat, Plan, Fatura, Rapor, vs.'
    },
    file_path: {
        type: DataTypes.STRING,
        comment: 'Dosya yolu veya URL'
    },
    file_name: {
        type: DataTypes.STRING
    },
    file_size: {
        type: DataTypes.INTEGER,
        comment: 'Dosya boyutu (bytes)'
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        comment: 'Geçerlilik tarihi (ruhsatlar için)'
    },
    description: {
        type: DataTypes.TEXT
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    version: {
        type: DataTypes.STRING,
        defaultValue: '1.0'
    },
    status: {
        type: DataTypes.ENUM('Aktif', 'Arşiv', 'Süresi Dolmuş'),
        defaultValue: 'Aktif'
    }
});

module.exports = Document;
