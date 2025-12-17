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
        console.log('🔗 Bağlanıyor...\n');
        
        // Basit test
        const test = await pool.query('SELECT NOW()');
        console.log('✅ Bağlantı başarılı:', test.rows[0].now);
        
        // VIEW test
        console.log('\n📊 VIEW test:');
        const viewTest = await pool.query('SELECT COUNT(*) FROM "vw_employee_project_performance"');
        console.log('   ✅ vw_employee_project_performance:', viewTest.rows[0].count, 'kayıt');
        
        // FUNCTION varsa test
        console.log('\n🔍 Function kontrol:');
        const funcCheck = await pool.query(`
            SELECT proname FROM pg_proc 
            WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            AND proname LIKE 'sp_%'
        `);
        console.log('   Bulunan function\'lar:', funcCheck.rows.map(r => r.proname));
        
        // Eğer yoksa oluştur
        if (funcCheck.rows.length === 0) {
            console.log('\n⚙️ STORED PROCEDURE oluşturuluyor...');
            
            const createProc = `
CREATE OR REPLACE FUNCTION sp_monthly_attendance_report(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
    employee_id INTEGER,
    employee_name TEXT,
    emp_position TEXT,
    total_days BIGINT,
    present_days BIGINT,
    absent_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e."id"::INTEGER,
        (e."first_name" || ' ' || e."last_name")::TEXT,
        COALESCE(r."name", 'Atanmamış')::TEXT,
        COUNT(a."id"),
        SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END),
        SUM(CASE WHEN a."status" = 'Gelmedi' THEN 1 ELSE 0 END)
    FROM "Employees" e
    LEFT JOIN "Roles" r ON e."RoleId" = r."id"
    LEFT JOIN "Attendances" a ON e."id" = a."EmployeeId"
        AND EXTRACT(YEAR FROM a."date") = p_year
        AND EXTRACT(MONTH FROM a."date") = p_month
    GROUP BY e."id", e."first_name", e."last_name", r."name"
    HAVING COUNT(a."id") > 0;
END;
$$ LANGUAGE plpgsql;`;
            
            await pool.query(createProc);
            console.log('   ✅ Oluşturuldu');
            
            // Test et
            const procTest = await pool.query('SELECT * FROM sp_monthly_attendance_report(2025, 12) LIMIT 2');
            console.log(`   ✅ Test başarılı: ${procTest.rows.length} kayıt`);
            console.table(procTest.rows);
        }
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ HATA:', error);
        await pool.end();
        process.exit(1);
    }
})();
