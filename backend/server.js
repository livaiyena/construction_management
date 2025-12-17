const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db-raw');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Raw SQL Rotaları - Tüm route'lar raw SQL kullanıyor
app.use('/api/auth', require('./routes-raw/auth'));
app.use('/api/projects', require('./routes-raw/projects'));
app.use('/api/employees', require('./routes-raw/employees'));
app.use('/api/roles', require('./routes-raw/roles'));
app.use('/api/attendance', require('./routes-raw/attendance'));
app.use('/api/expenses', require('./routes-raw/expenses'));
app.use('/api/equipment', require('./routes-raw/equipment'));
app.use('/api/materials', require('./routes-raw/materials'));
app.use('/api/suppliers', require('./routes-raw/suppliers'));
app.use('/api/audit', require('./routes-raw/audit'));
app.use('/api/reports', require('./routes-raw/reports'));
app.use('/api/categories', require('./routes-raw/materialCategories'));
app.use('/api/equipment-types', require('./routes-raw/equipmentTypes'));
app.use('/api/users', require('./routes-raw/users'));
app.use('/api/documents', require('./routes-raw/documents'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running with raw SQL' });
});

const PORT = process.env.PORT || 5000;

// Veritabanı Bağlantısı ve Sunucu Başlatma
connectDB()
    .then(() => {
        console.log('✅ PostgreSQL bağlantısı başarılı (Raw SQL)');
        app.listen(PORT, () => {
            console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
            console.log(`📊 Veritabanı: PostgreSQL (Neon.tech)`);
            console.log(`🔧 Mod: Raw SQL (Sequelize ORM kaldırıldı)`);
        });
    })
    .catch((err) => {
        console.error('❌ Veritabanı bağlantı hatası:', err);
        process.exit(1);
    });