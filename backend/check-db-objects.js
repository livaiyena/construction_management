const { query } = require('./config/db-raw');

(async () => {
    try {
        console.log('🔍 Veritabanı kontrol:\n');
        
        // Önce VIEW'leri kontrol et
        console.log('1️⃣ VIEW kontrol:');
        const views = await query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
        `);
        console.log('   Bulunan VIEW\'ler:', views.rows.map(r => r.table_name));
        
        // FUNCTION kontrol
        console.log('\n2️⃣ FUNCTION kontrol:');
        const funcs = await query(`
            SELECT proname 
            FROM pg_proc 
            WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            AND prokind = 'f'
        `);
        console.log('   Bulunan FUNCTION\'lar:', funcs.rows.map(r => r.proname));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
})();
