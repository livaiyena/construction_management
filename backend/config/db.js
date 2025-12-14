const { Sequelize } = require('sequelize');
require('dotenv').config(); // .env dosyasını okumak için

// PostgreSQL Bağlantı Ayarları
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Bağlantıyı Test Et
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Veritabanı Bağlantısı Başarılı.');
        console.log('Bağlı Olunan Database:', process.env.DB_NAME);
        console.log('Host:', process.env.DB_HOST);
    } catch (error) {
        console.error('Veritabanına bağlanılamadı:', error);
    }
};

module.exports = { sequelize, connectDB };