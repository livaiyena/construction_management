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
        console.log('🔧 Stored Procedure\'ları yeniden oluşturuyorum...\n');
        
        // 1. sp_monthly_attendance_report - TİP UYUMLULUĞU DÜZELTİLDİ
        console.log('📌 sp_monthly_attendance_report...');
        await pool.query(`DROP FUNCTION IF EXISTS sp_monthly_attendance_report(INTEGER, INTEGER) CASCADE`);
        
        const monthlyProc = `
CREATE OR REPLACE FUNCTION sp_monthly_attendance_report(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
    employee_id INTEGER,
    employee_name TEXT,
    emp_position TEXT,
    total_days INTEGER,
    present_days INTEGER,
    absent_days INTEGER,
    sick_leave_days INTEGER,
    excused_days INTEGER,
    total_worked_hours NUMERIC,
    total_overtime_hours NUMERIC,
    attendance_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e."id" AS employee_id,
        (e."first_name" || ' ' || e."last_name")::TEXT AS employee_name,
        COALESCE(r."name", 'Atanmamış')::TEXT AS emp_position,
        COUNT(a."id")::INTEGER AS total_days,
        SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END)::INTEGER AS present_days,
        SUM(CASE WHEN a."status" = 'Gelmedi' THEN 1 ELSE 0 END)::INTEGER AS absent_days,
        SUM(CASE WHEN a."status" = 'İzinli' THEN 1 ELSE 0 END)::INTEGER AS sick_leave_days,
        SUM(CASE WHEN a."status" = 'Mazeret' THEN 1 ELSE 0 END)::INTEGER AS excused_days,
        COALESCE(SUM(a."worked_hours"), 0)::NUMERIC AS total_worked_hours,
        COALESCE(SUM(a."overtime_hours"), 0)::NUMERIC AS total_overtime_hours,
        ROUND(
            (SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END)::NUMERIC / 
             NULLIF(COUNT(a."id"), 0)) * 100,
            2
        )::NUMERIC AS attendance_rate
    FROM "Employees" e
    LEFT JOIN "Roles" r ON e."RoleId" = r."id"
    LEFT JOIN "Attendances" a ON e."id" = a."EmployeeId"
        AND EXTRACT(YEAR FROM a."date") = p_year
        AND EXTRACT(MONTH FROM a."date") = p_month
    GROUP BY e."id", e."first_name", e."last_name", r."name"
    HAVING COUNT(a."id") > 0
    ORDER BY attendance_rate DESC, employee_name;
END;
$$ LANGUAGE plpgsql;`;
        
        await pool.query(monthlyProc);
        console.log('   ✅ Oluşturuldu');
        
        // Test
        const test1 = await pool.query('SELECT * FROM sp_monthly_attendance_report(2025, 12) LIMIT 2');
        console.log(`   ✅ Test: ${test1.rows.length} kayıt`);
        
        // 2. sp_budget_alert_projects - TÜM TİPLERİ DÜZELTİLDİ
        console.log('\n📌 sp_budget_alert_projects...');
        await pool.query(`DROP FUNCTION IF EXISTS sp_budget_alert_projects(NUMERIC) CASCADE`);
        
        const budgetProc = `
CREATE OR REPLACE FUNCTION sp_budget_alert_projects(threshold_percentage NUMERIC DEFAULT 80)
RETURNS TABLE (
    project_id INTEGER,
    project_name TEXT,
    project_status TEXT,
    total_budget NUMERIC,
    total_spent NUMERIC,
    remaining_budget NUMERIC,
    budget_usage_percentage NUMERIC,
    alert_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."id" AS project_id,
        p."name"::TEXT AS project_name,
        p."status"::TEXT AS project_status,
        p."budget"::NUMERIC AS total_budget,
        COALESCE(SUM(e."amount"), 0)::NUMERIC AS total_spent,
        (p."budget" - COALESCE(SUM(e."amount"), 0))::NUMERIC AS remaining_budget,
        ROUND(
            (COALESCE(SUM(e."amount"), 0) / NULLIF(p."budget", 0)) * 100,
            2
        )::NUMERIC AS budget_usage_percentage,
        CASE 
            WHEN (COALESCE(SUM(e."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= 100 THEN 'Kritik'::TEXT
            WHEN (COALESCE(SUM(e."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= threshold_percentage THEN 'Uyarı'::TEXT
            ELSE 'Normal'::TEXT
        END AS alert_level
    FROM "Projects" p
    LEFT JOIN "Expenses" e ON p."id" = e."ProjectId"
    WHERE p."status" IN ('Devam Ediyor', 'Planlanıyor')
    GROUP BY p."id", p."name", p."status", p."budget"
    HAVING (COALESCE(SUM(e."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= threshold_percentage
    ORDER BY budget_usage_percentage DESC;
END;
$$ LANGUAGE plpgsql;`;
        
        await pool.query(budgetProc);
        console.log('   ✅ Oluşturuldu');
        
        // Test
        const test2 = await pool.query('SELECT * FROM sp_budget_alert_projects(50) LIMIT 2');
        console.log(`   ✅ Test: ${test2.rows.length} kayıt`);
        
        console.log('\n✅ Tüm stored procedure\'lar başarıyla yeniden oluşturuldu!');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ HATA:', error.message);
        console.error('Detail:', error.detail);
        await pool.end();
        process.exit(1);
    }
})();
