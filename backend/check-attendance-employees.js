const { query } = require('./config/db-raw');

(async () => {
    try {
        // Son yoklama kaydını ve ilgili çalışan bilgisini getir
        const result = await query(`
            SELECT 
                a.id as attendance_id,
                a."EmployeeId",
                a.date,
                a.status,
                e.first_name,
                e.last_name,
                e.email
            FROM "Attendances" a
            LEFT JOIN "Employees" e ON a."EmployeeId" = e.id
            ORDER BY a."createdAt" DESC
            LIMIT 5
        `);
        
        console.log('\n📋 Son 5 Yoklama Kaydı ve Çalışan Bilgileri:');
        console.table(result.rows);
        
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
})();
