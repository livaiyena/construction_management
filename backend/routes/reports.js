// routes/reports.js - Pure SQL Raporlama Endpoint'leri (Final Dökümantasyonu için)
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

// ==================== SQL SORGU 1: Proje Bazlı Toplam Harcama ====================
// JOIN, SUM, GROUP BY kullanımı
router.get('/project-expenses', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.name AS project_name,
                p.city,
                p.district,
                p.address,
                COUNT(e.id) AS expense_count,
                COALESCE(SUM(e.amount), 0) AS total_expenses
            FROM "Projects" p
            LEFT JOIN "Expenses" e ON p.id = e."ProjectId"
            GROUP BY p.id, p.name, p.city, p.district, p.address
            HAVING COUNT(e.id) > 0
            ORDER BY total_expenses DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 2: Kategori Bazlı Harcama Analizi ====================
// GROUP BY, HAVING, aggregate functions
router.get('/expense-by-category', async (req, res) => {
    try {
        const query = `
            SELECT 
                category,
                COUNT(*) AS transaction_count,
                SUM(amount) AS total_amount,
                AVG(amount) AS average_amount,
                MIN(amount) AS min_amount,
                MAX(amount) AS max_amount
            FROM "Expenses"
            GROUP BY category
            HAVING SUM(amount) > 1000
            ORDER BY total_amount DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 3: Çalışan Yoklama İstatistikleri ====================
// Multiple JOINs, COUNT, GROUP BY
router.get('/employee-attendance-stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                COALESCE(r.name, 'Belirtilmemiş') AS role_title,
                COUNT(CASE WHEN a.status = 'Geldi' THEN 1 END) AS days_present,
                COUNT(CASE WHEN a.status = 'Gelmedi' THEN 1 END) AS days_absent,
                COUNT(CASE WHEN a.status NOT IN ('Geldi', 'Gelmedi') THEN 1 END) AS days_leave,
                COUNT(a.id) AS total_records
            FROM "Employees" e
            LEFT JOIN "Roles" r ON e."RoleId" = r.id
            LEFT JOIN "Attendances" a ON e.id = a."EmployeeId"
            GROUP BY e.id, e.first_name, e.last_name, r.name
            HAVING COUNT(a.id) > 0
            ORDER BY days_present DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 4: Proje Detay Raporu ====================
// Complex JOIN, subquery simulation
router.get('/project-details/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const query = `
            SELECT 
                p.id,
                p.name,
                p.city,
                p.district,
                p.address,
                p.budget,
                p.start_date,
                p.end_date,
                p.status,
                COUNT(DISTINCT e.id) AS employee_count,
                COUNT(DISTINCT ex.id) AS expense_count,
                COALESCE(SUM(ex.amount), 0) AS total_spent,
                (p.budget - COALESCE(SUM(ex.amount), 0)) AS remaining_budget
            FROM "Projects" p
            LEFT JOIN "Employees" e ON p.id = e."ProjectId"
            LEFT JOIN "Expenses" ex ON p.id = ex."ProjectId"
            WHERE p.id = :projectId
            GROUP BY p.id, p.name, p.city, p.district, p.address, p.budget, p.start_date, p.end_date, p.status
        `;

        const results = await sequelize.query(query, {
            replacements: { projectId },
            type: QueryTypes.SELECT
        });
        res.json({ data: results[0] || {}, query: query.trim().replace(':projectId', projectId) });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 5: Aylık Harcama Trendi ====================
// DATE functions, GROUP BY with date formatting
router.get('/monthly-expenses', async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(expense_date, 'YYYY-MM') AS month,
                TO_CHAR(expense_date, 'Month YYYY') AS month_name,
                COUNT(*) AS transaction_count,
                SUM(amount) AS total_amount,
                AVG(amount) AS average_amount,
                MIN(amount) AS min_amount,
                MAX(amount) AS max_amount
            FROM "Expenses"
            WHERE expense_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY TO_CHAR(expense_date, 'YYYY-MM'), TO_CHAR(expense_date, 'Month YYYY')
            ORDER BY month DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 6: En Aktif Çalışanlar ====================
// Subquery, ORDER BY, LIMIT
router.get('/top-active-employees', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                CONCAT(e.first_name, ' ', e.last_name) AS name,
                e.phone,
                r.name AS role,
                COUNT(a.id) AS attendance_count,
                ROUND(
                    CAST(COUNT(CASE WHEN a.status = 'Geldi' THEN 1 END) AS DECIMAL) / 
                    NULLIF(COUNT(a.id), 0) * 100, 
                    2
                ) AS attendance_rate
            FROM "Employees" e
            LEFT JOIN "Roles" r ON e."RoleId" = r.id
            LEFT JOIN "Attendances" a ON e.id = a."EmployeeId"
            WHERE e."isActive" = true
            GROUP BY e.id, e.first_name, e.last_name, e.phone, r.name
            HAVING COUNT(a.id) > 0
            ORDER BY attendance_rate DESC
            LIMIT 10
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 7: Rol Bazlı Maaş Analizi ====================
// JOIN, COUNT, GROUP BY - Rollerin günlük ücret ve çalışan sayılarına göre aylık maliyet analizi
router.get('/role-salary-analysis', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.name AS role_title,
                COALESCE(r.default_daily_rate, 0) AS daily_rate,
                COUNT(CASE WHEN e."isActive" = true THEN 1 END) AS employee_count,
                ROUND(CAST(COALESCE(r.default_daily_rate, 0) AS NUMERIC) * 30, 2) AS estimated_monthly_cost_per_employee,
                ROUND(CAST(COALESCE(r.default_daily_rate, 0) AS NUMERIC) * 30 * COUNT(CASE WHEN e."isActive" = true THEN 1 END), 2) AS total_monthly_cost
            FROM "Roles" r
            LEFT JOIN "Employees" e ON r.id = e."RoleId"
            GROUP BY r.id, r.name, r.default_daily_rate
            ORDER BY total_monthly_cost DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 8: Geciken Ödemeler ====================
// WHERE, CASE, date comparison
router.get('/pending-expenses', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                e.description,
                e.amount,
                e.category,
                e.expense_date,
                e.status,
                p.name AS project_name,
                CURRENT_DATE - e.expense_date AS days_pending,
                CASE 
                    WHEN CURRENT_DATE - e.expense_date > 30 THEN 'Kritik'
                    WHEN CURRENT_DATE - e.expense_date > 15 THEN 'Uyarı'
                    ELSE 'Normal'
                END AS priority_level
            FROM "Expenses" e
            INNER JOIN "Projects" p ON e."ProjectId" = p.id
            WHERE e.status IN ('Beklemede', 'Onaylandı')
                AND CURRENT_DATE - e.expense_date <= 45
                AND CURRENT_DATE - e.expense_date > 7
            ORDER BY days_pending DESC
            LIMIT 20
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 9: Proje Performans Karşılaştırması ====================
// Multiple aggregations, complex calculations - Projelerin bütçe kullanımı ve ekip analizi
router.get('/project-performance', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.name AS project_name,
                p.status,
                CAST(COALESCE(p.budget, 0) AS NUMERIC) AS budget,
                CAST(COALESCE(SUM(e.amount), 0) AS NUMERIC) AS total_expenses,
                CASE 
                    WHEN COALESCE(p.budget, 0) > 0 THEN 
                        ROUND((CAST(COALESCE(SUM(e.amount), 0) AS NUMERIC) / CAST(p.budget AS NUMERIC)) * 100, 2)
                    ELSE 0
                END AS budget_usage_percentage,
                COUNT(DISTINCT emp.id) AS team_size,
                COUNT(DISTINCT e.id) AS expense_transactions,
                p.status AS timeline_status
            FROM "Projects" p
            LEFT JOIN "Expenses" e ON p.id = e."ProjectId"
            LEFT JOIN "Employees" emp ON p.id = emp."ProjectId" AND emp."isActive" = true
            GROUP BY p.id, p.name, p.status, p.budget
            ORDER BY total_expenses DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 10: Haftalık Yoklama Özeti ====================
// Date functions, aggregation by week - Son 8 haftanın haftalık yoklama istatistikleri
router.get('/weekly-attendance', async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(date, 'IYYY-IW') AS week,
                COUNT(*) AS total_records,
                COUNT(CASE WHEN status = 'Geldi' THEN 1 END) AS present_count,
                COUNT(CASE WHEN status = 'Gelmedi' THEN 1 END) AS absent_count,
                COUNT(CASE WHEN status IN ('İzinli', 'Raporlu') THEN 1 END) AS leave_count,
                ROUND(
                    CAST((COUNT(CASE WHEN status = 'Geldi' THEN 1 END) * 100.0) AS NUMERIC) / 
                    NULLIF(COUNT(*), 0), 
                    2
                ) AS attendance_percentage
            FROM "Attendances"
            WHERE date >= CURRENT_DATE - INTERVAL '8 weeks'
            GROUP BY TO_CHAR(date, 'IYYY-IW')
            ORDER BY week DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 11: En Pahalı Projeler (BONUS) ====================
// Nested query simulation, TOP N
router.get('/most-expensive-projects', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.budget,
                COALESCE(SUM(e.amount), 0) AS total_spent,
                COUNT(e.id) AS expense_count,
                COALESCE(SUM(e.amount), 0) / NULLIF(COUNT(e.id), 0) AS avg_expense
            FROM "Projects" p
            LEFT JOIN "Expenses" e ON p.id = e."ProjectId"
            GROUP BY p.id, p.name, p.budget
            HAVING COALESCE(SUM(e.amount), 0) > 0
            ORDER BY total_spent DESC
            LIMIT 5
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 12: Çalışan Maliyet Raporu (BONUS) ====================
// Complex calculation with multiple tables - Çalışanların toplam maliyeti ve çalışma istatistikleri
router.get('/employee-cost-report', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                r.name AS role,
                CAST(COALESCE(e.daily_rate, r.default_daily_rate, 0) AS NUMERIC) AS daily_rate,
                COUNT(CASE WHEN a.status = 'Geldi' THEN 1 END) AS days_worked,
                CAST(COALESCE(SUM(a.worked_hours), 0) AS NUMERIC) AS total_hours,
                ROUND(
                    CAST(COALESCE(e.daily_rate, r.default_daily_rate, 0) AS NUMERIC) * 
                    COUNT(CASE WHEN a.status = 'Geldi' THEN 1 END), 
                    2
                ) AS total_cost
            FROM "Employees" e
            INNER JOIN "Roles" r ON e."RoleId" = r.id
            LEFT JOIN "Attendances" a ON e.id = a."EmployeeId"
            WHERE e."isActive" = true
            GROUP BY e.id, e.first_name, e.last_name, r.name, e.daily_rate, r.default_daily_rate
            HAVING COUNT(CASE WHEN a.status = 'Geldi' THEN 1 END) > 0
            ORDER BY total_cost DESC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json({ data: results, query: query.trim() });
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

module.exports = router;
