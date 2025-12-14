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


// Rotalar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports')); // Pure SQL raporlama endpoint'leri
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

// Veritabanı Bağlantısı ve Başlatma
connectDB().then(() => {
    models.sequelize.sync({ force: false }).then(() => {
        console.log('Tablolar senkronize edildi (PostgreSQL).');
        app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
    });
});