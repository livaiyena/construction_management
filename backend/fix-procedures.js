const { query } = require('./config/db-raw');

(async () => {
    try {
        console.log('🔧 STORED PROCEDURE\'leri oluşturuluyor...\n');

        // sp_monthly_attendance_report
        console.log('1️⃣ sp_monthly_attendance_report oluşturuluyor...');
        
        // Önce DROP
        await query(`DROP FUNCTION IF EXISTS sp_monthly_attendance_report(INTEGER, INTEGER) CASCADE`);
        
        // Sonra CREATE
        await query(`
            CREATE OR REPLACE FUNCTION sp_monthly_attendance_report(
                p_year INTEGER,
                p_month INTEGER
            )
            RETURNS TABLE (
                employee_id INTEGER,
                employee_name TEXT,
                emp_position TEXT,
                total_days BIGINT,
                present_days BIGINT,
                absent_days BIGINT,
                sick_leave_days BIGINT,
                excused_days BIGINT,
                total_worked_hours NUMERIC,
                total_overtime_hours NUMERIC,
                attendance_rate NUMERIC
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    e."id"::INTEGER AS employee_id,
                    (e."first_name" || ' ' || e."last_name")::TEXT AS employee_name,
                    COALESCE(r."name", 'Atanmamış')::TEXT AS emp_position,
                    COUNT(a."id") AS total_days,
                    SUM(CASE WHEN a."status" = 'Geldi' THEN 1 ELSE 0 END) AS present_days,
                    SUM(CASE WHEN a."status" = 'Gelmedi' THEN 1 ELSE 0 END) AS absent_days,
                    SUM(CASE WHEN a."status" = 'İzinli' THEN 1 ELSE 0 END) AS sick_leave_days,
                    SUM(CASE WHEN a."status" = 'Mazeret' THEN 1 ELSE 0 END) AS excused_days,
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
            $$ LANGUAGE plpgsql
        `);
        console.log('   ✅ Başarılı\n');

        // sp_budget_alert_projects
        console.log('2️⃣ sp_budget_alert_projects oluşturuluyor...');
        
        // Önce DROP
        await query(`DROP FUNCTION IF EXISTS sp_budget_alert_projects(NUMERIC) CASCADE`);
        
        // Sonra CREATE
        await query(`
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
                    p."id"::INTEGER AS project_id,
                    p."name"::TEXT AS project_name,
                    p."budget",
                    COALESCE(SUM(ex."amount"), 0) AS total_expenses,
                    p."budget" - COALESCE(SUM(ex."amount"), 0) AS remaining_budget,
                    ROUND((COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100, 2) AS usage_percentage,
                    (CASE 
                        WHEN (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= 100 THEN 'KRİTİK'
                        WHEN (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= 90 THEN 'YÜKSEK'
                        WHEN (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= p_threshold_percentage THEN 'ORTA'
                        ELSE 'DÜŞÜK'
                    END)::TEXT AS alert_level
                FROM "Projects" p
                LEFT JOIN "Expenses" ex ON p."id" = ex."ProjectId"
                WHERE p."budget" > 0
                GROUP BY p."id", p."name", p."budget"
                HAVING (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100 >= p_threshold_percentage
                ORDER BY usage_percentage DESC;
            END;
            $$ LANGUAGE plpgsql
        `);
        console.log('   ✅ Başarılı\n');

        // Test
        console.log('🧪 Test ediliyor...\n');
        
        console.log('📅 Aralık 2025 Yoklama:');
        const test1 = await query('SELECT * FROM sp_monthly_attendance_report(2025, 12)');
        console.log(`   ${test1.rows.length} kayıt bulundu`);
        if (test1.rows.length > 0) console.table(test1.rows.slice(0, 2));
        
        console.log('\n💰 Bütçe Uyarıları (%50 eşik):');
        const test2 = await query('SELECT * FROM sp_budget_alert_projects(50)');
        console.log(`   ${test2.rows.length} proje bulundu`);
        if (test2.rows.length > 0) console.table(test2.rows.slice(0, 3));
        
        console.log('\n✅ STORED PROCEDURE\'ler başarıyla oluşturuldu ve test edildi!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
})();
