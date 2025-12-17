const { query } = require('./config/db-raw');

(async () => {
    try {
        console.log('🧪 STORED PROCEDURE Test:\n');
        
        console.log('1️⃣ sp_monthly_attendance_report test...');
        try {
            const result1 = await query('SELECT * FROM sp_monthly_attendance_report(2025, 12)');
            console.log(`   ✅ Başarılı - ${result1.rows.length} kayıt`);
            if (result1.rows.length > 0) {
                console.table(result1.rows.slice(0, 2));
            }
        } catch (e) {
            console.log(`   ❌ Hata: ${e.message}`);
        }

        console.log('\n2️⃣ sp_budget_alert_projects test...');
        try {
            const result2 = await query('SELECT * FROM sp_budget_alert_projects(80)');
            console.log(`   ✅ Başarılı - ${result2.rows.length} kayıt`);
            if (result2.rows.length > 0) {
                console.table(result2.rows);
            } else {
                console.log('   ℹ️  Uyarı seviyesinde proje yok (normal)');
            }
        } catch (e) {
            console.log(`   ❌ Hata: ${e.message}`);
        }

        console.log('\n3️⃣ Stored procedure listesi kontrol...');
        const procList = await query(`
            SELECT routine_name, routine_type 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_type = 'FUNCTION'
            AND routine_name LIKE 'sp_%'
        `);
        console.table(procList.rows);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Genel Hata:', error.message);
        process.exit(1);
    }
})();
