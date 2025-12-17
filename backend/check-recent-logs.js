const { query } = require('./config/db-raw');

(async () => {
    try {
        const result = await query(`
            SELECT id, "userId", "userName", action, "tableName", "recordId", timestamp 
            FROM "AuditLogs" 
            ORDER BY timestamp DESC 
            LIMIT 10
        `);
        
        console.log('\n📋 Son 10 Audit Log:');
        console.table(result.rows);
        
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
})();
