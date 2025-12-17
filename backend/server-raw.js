// server.js - Express Server with Raw SQL
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db-raw');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes-raw/auth'));
app.use('/api/projects', require('./routes-raw/projects'));
app.use('/api/employees', require('./routes-raw/employees'));
app.use('/api/roles', require('./routes-raw/roles'));
app.use('/api/attendance', require('./routes-raw/attendance'));
app.use('/api/expenses', require('./routes-raw/expenses'));
app.use('/api/materials', require('./routes-raw/materials'));
app.use('/api/material-categories', require('./routes-raw/materialCategories'));
app.use('/api/equipment', require('./routes-raw/equipment'));
app.use('/api/equipment-types', require('./routes-raw/equipmentTypes'));
app.use('/api/suppliers', require('./routes-raw/suppliers'));
app.use('/api/documents', require('./routes-raw/documents'));
app.use('/api/audit', require('./routes-raw/audit'));
app.use('/api/reports', require('./routes-raw/reports'));
app.use('/api/users', require('./routes-raw/users'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL',
        method: 'Raw SQL' 
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'İnşaat Yönetim Sistemi API',
        version: '2.0.0 (Raw SQL)',
        documentation: '/api/health'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({ 
        message: 'Sunucu hatası', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Start express server
        app.listen(PORT, () => {
            console.log('\n🚀 ==========================================');
            console.log(`   Server çalışıyor: http://localhost:${PORT}`);
            console.log(`   API Base: http://localhost:${PORT}/api`);
            console.log(`   Database: PostgreSQL (Raw SQL)`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('==========================================\n');
        });
    } catch (error) {
        console.error('❌ Server başlatılamadı:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
