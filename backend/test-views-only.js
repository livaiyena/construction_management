const { query } = require('./config/db-raw');

(async () => {
    try {
        console.log('🧪 VIEW Test:\n');
        
        const viewTest = await query('SELECT * FROM "vw_employee_project_performance" LIMIT 2');
        console.table(viewTest.rows);

        console.log('\n✅ VIEW başarıyla çalışıyor!\n');
        
        console.log('📁 Örnek Dosyalar:');
        console.log('- database/schema.sql (VIEW ve PROCEDURE tanımları mevcut)');
        console.log('- database/view-and-procedure-examples.sql (Kullanım örnekleri)');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
})();
