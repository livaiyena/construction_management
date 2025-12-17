const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

(async () => {
    try {
        console.log('🔍 Mevcut function tanımını alıyorum...\n');
        
        const funcDef = await pool.query(`
            SELECT pg_get_functiondef(p.oid) as definition
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'sp_monthly_attendance_report'
        `);
        
        console.log('📋 Tanım:');
        console.log(funcDef.rows[0].definition);
        console.log('\n' + '='.repeat(80) + '\n');
        
        console.log('🧪 Function\'ı çağırıyorum...\n');
        const result = await pool.query('SELECT * FROM sp_monthly_attendance_report(2025, 12)');
        
        console.log(`✅ ${result.rows.length} kayıt döndü`);
        console.log('\n📊 İlk 3 kayıt:');
        console.table(result.rows.slice(0, 3));
        
        console.log('\n📋 Kolon tipleri:');
        result.fields.forEach(field => {
            console.log(`   ${field.name}: ${field.dataTypeID}`);
        });
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ HATA:');
        console.error('Message:', error.message);
        console.error('Detail:', error.detail);
        console.error('Hint:', error.hint);
        console.error('Position:', error.position);
        console.error('\nFull error:', error);
        await pool.end();
        process.exit(1);
    }
})();
