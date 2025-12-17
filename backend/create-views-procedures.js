const { query } = require('./config/db-raw');

(async () => {
    try {
        console.log('📋 VIEW ve STORED PROCEDURE oluşturuluyor...\n');

        // Schema dosyasından VIEW ve PROCEDURE tanımlarını al ve çalıştır
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        
        // Sadece VIEW ve PROCEDURE kısımlarını çalıştırmak için yeni bir SQL dosyası oku
        const viewProcSql = `
-- VIEW 1: Çalışan Performans Özeti
DROP VIEW IF EXISTS "vw_employee_project_performance" CASCADE;

CREATE VIEW "vw_employee_project_performance" AS
SELECT 
    e."id" AS "employee_id",
    e."first_name" || ' ' || e."last_name" AS "employee_name",
    COALESCE(r."name", 'Atanmamış') AS "role_name",
    p."id" AS "project_id",
    p."name" AS "project_name",
    COUNT(DISTINCT a."date") AS "total_attendance_days",
    SUM(a."worked_hours") AS "total_worked_hours",
    SUM(a."overtime_hours") AS "total_overtime_hours",
    ROUND(AVG(a."worked_hours"), 2) AS "avg_daily_hours",
    SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END) AS "present_days",
    SUM(CASE WHEN a."status" = 'Gelmedi' THEN 1 ELSE 0 END) AS "absent_days",
    ROUND(
        (SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END)::NUMERIC / 
         NULLIF(COUNT(DISTINCT a."date"), 0)) * 100, 
        2
    ) AS "attendance_percentage"
FROM "Employees" e
LEFT JOIN "Roles" r ON e."RoleId" = r."id"
LEFT JOIN "Attendances" a ON e."id" = a."EmployeeId"
LEFT JOIN "Projects" p ON a."ProjectId" = p."id"
GROUP BY e."id", e."first_name", e."last_name", r."name", p."id", p."name"
HAVING COUNT(a."id") > 0
ORDER BY e."id", "total_worked_hours" DESC;

-- VIEW 2: Proje Maliyet Özeti
DROP VIEW IF EXISTS "vw_project_cost_summary" CASCADE;

CREATE VIEW "vw_project_cost_summary" AS
SELECT 
    p."id" AS "project_id",
    p."name" AS "project_name",
    p."budget",
    p."status",
    COALESCE(SUM(ex."amount"), 0) AS "total_expenses",
    COALESCE(SUM(CASE WHEN ex."category" = 'İşçilik' THEN ex."amount" ELSE 0 END), 0) AS "labor_cost",
    COALESCE(SUM(CASE WHEN ex."category" = 'Malzeme' THEN ex."amount" ELSE 0 END), 0) AS "material_cost",
    p."budget" - COALESCE(SUM(ex."amount"), 0) AS "remaining_budget",
    ROUND((COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100, 2) AS "budget_usage_percentage"
FROM "Projects" p
LEFT JOIN "Expenses" ex ON p."id" = ex."ProjectId"
GROUP BY p."id", p."name", p."budget", p."status"
ORDER BY "budget_usage_percentage" DESC;

-- STORED PROCEDURE 1: Aylık Yoklama Raporu
DROP FUNCTION IF EXISTS sp_monthly_attendance_report(INTEGER, INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION sp_monthly_attendance_report(
    p_year INTEGER,
    p_month INTEGER
)
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
        e."first_name" || ' ' || e."last_name" AS employee_name,
        COALESCE(r."name", 'Atanmamış') AS emp_position,
        COUNT(a."id")::INTEGER AS total_days,
        SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END)::INTEGER AS present_days,
        SUM(CASE WHEN a."status" = 'Gelmedi' THEN 1 ELSE 0 END)::INTEGER AS absent_days,
        SUM(CASE WHEN a."status" = 'İzinli' THEN 1 ELSE 0 END)::INTEGER AS sick_leave_days,
        SUM(CASE WHEN a."status" = 'Mazeret' THEN 1 ELSE 0 END)::INTEGER AS excused_days,
        COALESCE(SUM(a."worked_hours"), 0) AS total_worked_hours,
        COALESCE(SUM(a."overtime_hours"), 0) AS total_overtime_hours,
        ROUND(
            (SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END)::NUMERIC / 
             NULLIF(COUNT(a."id"), 0)) * 100,
            2
        ) AS attendance_rate
    FROM "Employees" e
    LEFT JOIN "Roles" r ON e."RoleId" = r."id"
    LEFT JOIN "Attendances" a ON e."id" = a."EmployeeId"
        AND EXTRACT(YEAR FROM a."date") = p_year
        AND EXTRACT(MONTH FROM a."date") = p_month
    GROUP BY e."id", e."first_name", e."last_name", r."name"
    HAVING COUNT(a."id") > 0
    ORDER BY attendance_rate DESC, employee_name;
END;
$$ LANGUAGE plpgsql;

-- STORED PROCEDURE 2: Bütçe Uyarı Raporu
DROP FUNCTION IF EXISTS sp_budget_alert_projects(NUMERIC) CASCADE;

CREATE OR REPLACE FUNCTION sp_budget_alert_projects(
    p_threshold_percentage NUMERIC DEFAULT 80
)
RETURNS TABLE (
    project_id INTEGER,
    project_name TEXT,
    budget NUMERIC,
    total_expenses NUMERIC,
    remaining_budget NUMERIC,
    usage_percentage NUMERIC,
    alert_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."id" AS project_id,
        p."name" AS project_name,
        p."budget",
        COALESCE(SUM(ex."amount"), 0) AS total_expenses,
        p."budget" - COALESCE(SUM(ex."amount"), 0) AS remaining_budget,
        ROUND((COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100, 2) AS usage_percentage,
        CASE 
            WHEN (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= 100 THEN 'KRİTİK'
            WHEN (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= 90 THEN 'YÜKSEK'
            WHEN (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= p_threshold_percentage THEN 'ORTA'
            ELSE 'DÜŞÜK'
        END AS alert_level
    FROM "Projects" p
    LEFT JOIN "Expenses" ex ON p."id" = ex."ProjectId"
    WHERE p."budget" > 0
    GROUP BY p."id", p."name", p."budget"
    HAVING (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= p_threshold_percentage
    ORDER BY usage_percentage DESC;
END;
$$ LANGUAGE plpgsql;
        `;

        await query(viewProcSql);

        console.log('✅ VIEW ve STORED PROCEDURE başarıyla oluşturuldu!\n');

        // View'leri test et
        console.log('📊 VIEW TEST - Çalışan Performans Özeti (İlk 3 kayıt):');
        const viewResult = await query('SELECT * FROM "vw_employee_project_performance" LIMIT 3');
        console.table(viewResult.rows);

        console.log('\n💰 VIEW TEST - Proje Maliyet Özeti (İlk 3 kayıt):');
        const costResult = await query('SELECT * FROM "vw_project_cost_summary" LIMIT 3');
        console.table(costResult.rows);

        // Stored Procedure'leri test et
        console.log('\n📅 STORED PROCEDURE TEST - Aralık 2025 Yoklama Raporu:');
        const procResult = await query('SELECT * FROM sp_monthly_attendance_report(2025, 12)');
        console.table(procResult.rows);

        console.log('\n⚠️ STORED PROCEDURE TEST - Bütçe Uyarı Raporu (%80 eşik):');
        const budgetResult = await query('SELECT * FROM sp_budget_alert_projects(80)');
        if (budgetResult.rows.length > 0) {
            console.table(budgetResult.rows);
        } else {
            console.log('   Uyarı seviyesinde proje yok.');
        }

        console.log('\n✅ Tüm testler tamamlandı!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
})();
