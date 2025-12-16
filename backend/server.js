const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Tüm modelleri ve ilişkileri yükle
const models = require('./models');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Rotalar - Aktif Kullanımda Olanlar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/categories', require('./routes/materialCategories'));
app.use('/api/equipment-types', require('./routes/equipmentTypes'));

// Gelecekte Kullanılacak (Frontend'de henüz implement edilmedi)
app.use('/api/users', require('./routes/users')); // Admin kullanıcı yönetimi için
app.use('/api/documents', require('./routes/documents')); // Proje dökümanları için

const PORT = process.env.PORT || 5000;

// Veritabanı Bağlantısı ve Başlatma
connectDB().then(() => {
    models.sequelize.sync({ alter: true }).then(() => {
        console.log('Tablolar senkronize edildi (PostgreSQL).');
        app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
    });
});