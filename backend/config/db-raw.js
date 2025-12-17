// config/db.js - PostgreSQL Raw SQL Connection
const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Connection Pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        require: true,
        rejectUnauthorized: false
    },
    max: 20, // Maximum number of clients in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL Veritabanı Bağlantısı Başarılı');
        console.log('📊 Database:', process.env.DB_NAME);
        console.log('🌐 Host:', process.env.DB_HOST);
        
        // Test query
        const result = await client.query('SELECT NOW()');
        console.log('⏰ Server Time:', result.rows[0].now);
        
        client.release();
    } catch (error) {
        console.error('❌ Veritabanına bağlanılamadı:', error.message);
        process.exit(1);
    }
};

// Generic query function with error handling
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log slow queries (> 1000ms)
        if (duration > 1000) {
            console.warn(`⚠️ Slow query (${duration}ms):`, text.substring(0, 100));
        }
        
        return result;
    } catch (error) {
        console.error('❌ Query error:', error.message);
        console.error('SQL:', text);
        console.error('Params:', params);
        throw error;
    }
};

// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    pool,
    query,
    transaction,
    connectDB
};
