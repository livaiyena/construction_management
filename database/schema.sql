-- ============================================
-- İNŞAAT YÖNETİM SİSTEMİ - VERİTABANI ŞEMASI
-- DDL (Data Definition Language) Kodları
-- Veritabanı: PostgreSQL 13+
-- Tarih: 17 Aralık 2025
-- ============================================

-- Mevcut tabloları sil (temiz başlangıç için)
DROP TABLE IF EXISTS "AuditLogs" CASCADE;
DROP TABLE IF EXISTS "Documents" CASCADE;
DROP TABLE IF EXISTS "ProjectEquipment" CASCADE;
DROP TABLE IF EXISTS "ProjectMaterial" CASCADE;
DROP TABLE IF EXISTS "Expenses" CASCADE;
DROP TABLE IF EXISTS "Attendances" CASCADE;
DROP TABLE IF EXISTS "Equipment" CASCADE;
DROP TABLE IF EXISTS "EquipmentTypes" CASCADE;
DROP TABLE IF EXISTS "Materials" CASCADE;
DROP TABLE IF EXISTS "MaterialCategories" CASCADE;
DROP TABLE IF EXISTS "Employees" CASCADE;
DROP TABLE IF EXISTS "Roles" CASCADE;
DROP TABLE IF EXISTS "Suppliers" CASCADE;
DROP TABLE IF EXISTS "Projects" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- ============================================
-- 1. USERS TABLOSU - Kullanıcılar
-- ============================================
CREATE TABLE "Users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) DEFAULT 'admin',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users tablosu için indexler
CREATE INDEX "idx_users_email" ON "Users"("email");
CREATE INDEX "idx_users_role" ON "Users"("role");

COMMENT ON TABLE "Users" IS 'Sistem kullanıcıları tablosu';
COMMENT ON COLUMN "Users"."role" IS 'Kullanıcı rolü: admin, manager, viewer';

-- ============================================
-- 2. PROJECTS TABLOSU - Projeler
-- ============================================
CREATE TABLE "Projects" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "address" TEXT,
    "budget" DECIMAL(15, 2) DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'Planlama',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_projects_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE
);

-- Projects tablosu için indexler
CREATE INDEX "idx_projects_status" ON "Projects"("status");
CREATE INDEX "idx_projects_start_date" ON "Projects"("start_date");
CREATE INDEX "idx_projects_city" ON "Projects"("city");
CREATE INDEX "idx_projects_userId" ON "Projects"("userId");

COMMENT ON TABLE "Projects" IS 'İnşaat projeleri tablosu';
COMMENT ON COLUMN "Projects"."status" IS 'Proje durumu: Planlama, Devam Ediyor, Tamamlandı, Askıda';

-- ============================================
-- 3. ROLES TABLOSU - İş Pozisyonları
-- ============================================
CREATE TABLE "Roles" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "default_daily_rate" DECIMAL(10, 2) DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_roles_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_roles_name" ON "Roles"("name");

COMMENT ON TABLE "Roles" IS 'Çalışan pozisyonları ve meslekleri';
COMMENT ON COLUMN "Roles"."default_daily_rate" IS 'Bu rol için varsayılan günlük ücret';

-- ============================================
-- 4. EMPLOYEES TABLOSU - Çalışanlar
-- ============================================
CREATE TABLE "Employees" (
    "id" SERIAL PRIMARY KEY,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "hire_date" DATE,
    "daily_rate" DECIMAL(10, 2) DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'aktif',
    "isActive" BOOLEAN DEFAULT true,
    "RoleId" INTEGER,
    "ProjectId" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_employees_role" FOREIGN KEY ("RoleId") 
        REFERENCES "Roles"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_employees_project" FOREIGN KEY ("ProjectId") 
        REFERENCES "Projects"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_employees_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE
);

-- Employees tablosu için indexler
CREATE INDEX "idx_employees_status" ON "Employees"("status");
CREATE INDEX "idx_employees_isActive" ON "Employees"("isActive");
CREATE INDEX "idx_employees_name" ON "Employees"("first_name", "last_name");
CREATE INDEX "idx_employees_roleId" ON "Employees"("RoleId");
CREATE INDEX "idx_employees_projectId" ON "Employees"("ProjectId");

COMMENT ON TABLE "Employees" IS 'Şantiye çalışanları tablosu';
COMMENT ON COLUMN "Employees"."status" IS 'Çalışan durumu: aktif, pasif, izinli';

-- ============================================
-- 5. ATTENDANCES TABLOSU - Yoklama Kayıtları
-- ============================================
CREATE TABLE "Attendances" (
    "id" SERIAL PRIMARY KEY,
    "EmployeeId" INTEGER NOT NULL,
    "ProjectId" INTEGER,
    "date" DATE NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Geldi',
    "worked_hours" DECIMAL(5, 2) DEFAULT 8.0,
    "overtime_hours" DECIMAL(5, 2) DEFAULT 0,
    "notes" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_attendance_employee" FOREIGN KEY ("EmployeeId") 
        REFERENCES "Employees"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_attendance_project" FOREIGN KEY ("ProjectId") 
        REFERENCES "Projects"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_attendance_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_worked_hours" CHECK ("worked_hours" >= 0 AND "worked_hours" <= 24),
    CONSTRAINT "chk_overtime_hours" CHECK ("overtime_hours" >= 0 AND "overtime_hours" <= 24),
    CONSTRAINT "chk_attendance_status" CHECK ("status" IN ('Geldi', 'Gelmedi', 'İzinli', 'Raporlu'))
);

-- Attendances tablosu için indexler
CREATE UNIQUE INDEX "idx_attendance_unique" ON "Attendances"("EmployeeId", "ProjectId", "date");
CREATE INDEX "idx_attendance_status" ON "Attendances"("status");
CREATE INDEX "idx_attendance_date" ON "Attendances"("date");
CREATE INDEX "idx_attendance_projectId" ON "Attendances"("ProjectId");

COMMENT ON TABLE "Attendances" IS 'Çalışan devam kayıtları (yoklama)';
COMMENT ON COLUMN "Attendances"."status" IS 'Yoklama durumu: Geldi, Gelmedi, İzinli, Raporlu';

-- ============================================
-- 6. SUPPLIERS TABLOSU - Tedarikçiler
-- ============================================
CREATE TABLE "Suppliers" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "tax_number" VARCHAR(50),
    "payment_terms" VARCHAR(255),
    "rating" INTEGER DEFAULT 5,
    "isActive" BOOLEAN DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_suppliers_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_supplier_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE INDEX "idx_suppliers_isActive" ON "Suppliers"("isActive");
CREATE INDEX "idx_suppliers_name" ON "Suppliers"("name");

COMMENT ON TABLE "Suppliers" IS 'Malzeme ve ekipman tedarikçileri';
COMMENT ON COLUMN "Suppliers"."payment_terms" IS 'Ödeme koşulları: 30 gün vadeli, peşin, vb.';

-- ============================================
-- 7. MATERIAL CATEGORIES TABLOSU
-- ============================================
CREATE TABLE "MaterialCategories" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_material_categories_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_material_categories_name" ON "MaterialCategories"("name");

COMMENT ON TABLE "MaterialCategories" IS 'Malzeme kategorileri: Çimento, Demir, Boya vb.';

-- ============================================
-- 8. MATERIALS TABLOSU - Malzemeler
-- ============================================
CREATE TABLE "Materials" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "MaterialCategoryId" INTEGER,
    "unit" VARCHAR(50) NOT NULL,
    "unit_price" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "stock_quantity" DECIMAL(10, 2) DEFAULT 0,
    "minimum_stock" DECIMAL(10, 2) DEFAULT 0,
    "SupplierId" INTEGER,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_materials_category" FOREIGN KEY ("MaterialCategoryId") 
        REFERENCES "MaterialCategories"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_materials_supplier" FOREIGN KEY ("SupplierId") 
        REFERENCES "Suppliers"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_materials_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_stock_quantity" CHECK ("stock_quantity" >= 0)
);

CREATE INDEX "idx_materials_name" ON "Materials"("name");
CREATE INDEX "idx_materials_categoryId" ON "Materials"("MaterialCategoryId");
CREATE INDEX "idx_materials_supplierId" ON "Materials"("SupplierId");

COMMENT ON TABLE "Materials" IS 'İnşaat malzemeleri ve stok takibi';
COMMENT ON COLUMN "Materials"."unit" IS 'Birim: kg, ton, m3, adet, vb.';
COMMENT ON COLUMN "Materials"."minimum_stock" IS 'Minimum stok seviyesi - altına düşerse uyarı';

-- ============================================
-- 9. EQUIPMENT TYPES TABLOSU
-- ============================================
CREATE TABLE "EquipmentTypes" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_equipment_types_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_equipment_types_name" ON "EquipmentTypes"("name");

COMMENT ON TABLE "EquipmentTypes" IS 'Ekipman türleri: Vinç, Kazıcı, Matkap vb.';

-- ============================================
-- 10. EQUIPMENT TABLOSU - Ekipmanlar
-- ============================================
CREATE TABLE "Equipment" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "EquipmentTypeId" INTEGER,
    "serial_number" VARCHAR(100) UNIQUE,
    "purchase_date" DATE,
    "purchase_price" DECIMAL(10, 2) DEFAULT 0,
    "daily_rental_cost" DECIMAL(10, 2) DEFAULT 0,
    "condition" VARCHAR(50) DEFAULT 'İyi',
    "last_maintenance_date" DATE,
    "next_maintenance_date" DATE,
    "location" VARCHAR(255),
    "isAvailable" BOOLEAN DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_equipment_type" FOREIGN KEY ("EquipmentTypeId") 
        REFERENCES "EquipmentTypes"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_equipment_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_equipment_condition" CHECK ("condition" IN ('Mükemmel', 'İyi', 'Orta', 'Kötü', 'Bakımda'))
);

CREATE INDEX "idx_equipment_name" ON "Equipment"("name");
CREATE INDEX "idx_equipment_typeId" ON "Equipment"("EquipmentTypeId");
CREATE INDEX "idx_equipment_isAvailable" ON "Equipment"("isAvailable");

COMMENT ON TABLE "Equipment" IS 'İnşaat ekipmanları ve araçları';
COMMENT ON COLUMN "Equipment"."condition" IS 'Ekipman durumu: Mükemmel, İyi, Orta, Kötü, Bakımda';

-- ============================================
-- 11. PROJECT_MATERIAL TABLOSU (Many-to-Many)
-- ============================================
CREATE TABLE "ProjectMaterial" (
    "id" SERIAL PRIMARY KEY,
    "ProjectId" INTEGER NOT NULL,
    "MaterialId" INTEGER NOT NULL,
    "quantity_used" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "unit_price_at_time" DECIMAL(10, 2),
    "date_used" DATE NOT NULL DEFAULT CURRENT_DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_project_material_project" FOREIGN KEY ("ProjectId") 
        REFERENCES "Projects"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_project_material_material" FOREIGN KEY ("MaterialId") 
        REFERENCES "Materials"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_project_material_composite" ON "ProjectMaterial"("ProjectId", "MaterialId", "date_used");

COMMENT ON TABLE "ProjectMaterial" IS 'Projelerde kullanılan malzemeler (Many-to-Many ilişki)';
COMMENT ON COLUMN "ProjectMaterial"."unit_price_at_time" IS 'Kullanım anındaki birim fiyat (fiyat değişikliklerini takip için)';

-- ============================================
-- 12. PROJECT_EQUIPMENT TABLOSU (Many-to-Many)
-- ============================================
CREATE TABLE "ProjectEquipment" (
    "id" SERIAL PRIMARY KEY,
    "ProjectId" INTEGER NOT NULL,
    "EquipmentId" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "daily_cost" DECIMAL(10, 2) DEFAULT 0,
    "total_days" INTEGER DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_project_equipment_project" FOREIGN KEY ("ProjectId") 
        REFERENCES "Projects"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_project_equipment_equipment" FOREIGN KEY ("EquipmentId") 
        REFERENCES "Equipment"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_project_equipment_composite" ON "ProjectEquipment"("ProjectId", "EquipmentId");

COMMENT ON TABLE "ProjectEquipment" IS 'Projelerde kullanılan ekipmanlar (Many-to-Many ilişki)';

-- ============================================
-- 13. EXPENSES TABLOSU - Harcamalar
-- ============================================
CREATE TABLE "Expenses" (
    "id" SERIAL PRIMARY KEY,
    "ProjectId" INTEGER,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "expense_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "payment_method" VARCHAR(50),
    "receipt_number" VARCHAR(100),
    "paid_to" VARCHAR(255),
    "approved_by" VARCHAR(100),
    "status" VARCHAR(50) DEFAULT 'Beklemede',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_expenses_project" FOREIGN KEY ("ProjectId") 
        REFERENCES "Projects"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_expenses_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_expense_amount" CHECK ("amount" >= 0),
    CONSTRAINT "chk_expense_status" CHECK ("status" IN ('Beklemede', 'Onaylandı', 'Ödendi', 'İptal'))
);

CREATE INDEX "idx_expenses_projectId" ON "Expenses"("ProjectId");
CREATE INDEX "idx_expenses_category" ON "Expenses"("category");
CREATE INDEX "idx_expenses_date" ON "Expenses"("expense_date");
CREATE INDEX "idx_expenses_status" ON "Expenses"("status");

COMMENT ON TABLE "Expenses" IS 'Proje harcamaları ve genel giderler';
COMMENT ON COLUMN "Expenses"."category" IS 'Harcama kategorisi: Maaş, Malzeme, Ekipman, Ulaşım, Yemek vb.';

-- ============================================
-- 14. DOCUMENTS TABLOSU - Dökümanlar
-- ============================================
CREATE TABLE "Documents" (
    "id" SERIAL PRIMARY KEY,
    "ProjectId" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "file_path" VARCHAR(500),
    "file_name" VARCHAR(255),
    "file_size" INTEGER,
    "upload_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" DATE,
    "description" TEXT,
    "uploaded_by" INTEGER,
    "version" VARCHAR(20) DEFAULT '1.0',
    "status" VARCHAR(50) DEFAULT 'Aktif',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_documents_project" FOREIGN KEY ("ProjectId") 
        REFERENCES "Projects"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_documents_uploader" FOREIGN KEY ("uploaded_by") 
        REFERENCES "Users"("id") ON DELETE SET NULL,
    CONSTRAINT "chk_document_status" CHECK ("status" IN ('Aktif', 'Arşiv', 'Süresi Dolmuş'))
);

CREATE INDEX "idx_documents_projectId" ON "Documents"("ProjectId");
CREATE INDEX "idx_documents_type" ON "Documents"("type");

COMMENT ON TABLE "Documents" IS 'Proje dökümanları: Sözleşme, Ruhsat, Plan, Fatura vb.';
COMMENT ON COLUMN "Documents"."type" IS 'Döküman tipi: Sözleşme, Ruhsat, Plan, Fatura, Rapor vb.';

-- ============================================
-- 15. AUDIT_LOGS TABLOSU - Sistem Logları
-- ============================================
CREATE TABLE "AuditLogs" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER,
    "userName" VARCHAR(255),
    "action" VARCHAR(50) NOT NULL,
    "tableName" VARCHAR(100),
    "recordId" INTEGER,
    "changes" TEXT,
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_audit_user" FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE SET NULL,
    CONSTRAINT "chk_audit_action" CHECK ("action" IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'))
);

CREATE INDEX "idx_audit_userId" ON "AuditLogs"("userId");
CREATE INDEX "idx_audit_action" ON "AuditLogs"("action");
CREATE INDEX "idx_audit_timestamp" ON "AuditLogs"("timestamp");
CREATE INDEX "idx_audit_tableName" ON "AuditLogs"("tableName");

COMMENT ON TABLE "AuditLogs" IS 'Sistem işlem kayıtları ve denetim logları';
COMMENT ON COLUMN "AuditLogs"."action" IS 'İşlem tipi: CREATE, UPDATE, DELETE, LOGIN, LOGOUT';

-- ============================================
-- ALTER TABLE EXAMPLES (Tablo Değişiklik Örnekleri)
-- ============================================

-- Örnek 1: Projects tablosuna yeni kolon ekleme
-- ALTER TABLE "Projects" ADD COLUMN "project_code" VARCHAR(50) UNIQUE;
-- ALTER TABLE "Projects" ADD COLUMN "completion_percentage" INTEGER DEFAULT 0;

-- Örnek 2: Employees tablosunda kolon değiştirme
-- ALTER TABLE "Employees" ALTER COLUMN "phone" TYPE VARCHAR(30);
-- ALTER TABLE "Employees" ADD CONSTRAINT "chk_daily_rate" CHECK ("daily_rate" >= 0);

-- Örnek 3: Index ekleme
-- CREATE INDEX "idx_expenses_amount" ON "Expenses"("amount");

-- Örnek 4: Foreign key ekleme
-- ALTER TABLE "Expenses" ADD CONSTRAINT "fk_expenses_supplier" 
--     FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id");

-- ============================================
-- VIEW (GÖRÜNÜM) TANIMLARI
-- ============================================

-- VIEW 1: Çalışanların Proje Bazında Performans Özeti
-- Açıklama: Her çalışanın hangi projelerde kaç gün çalıştığını, 
-- toplam çalışma saatlerini ve fazla mesai saatlerini gösterir
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

COMMENT ON VIEW "vw_employee_project_performance" IS 
'Çalışanların proje bazında devam durumu ve çalışma saatleri performans raporu';

-- VIEW 2: Proje Maliyet Özeti
-- Açıklama: Her projenin toplam harcamalarını, çalışan maliyetlerini 
-- ve genel bütçe durumunu gösterir
DROP VIEW IF EXISTS "vw_project_cost_summary" CASCADE;

CREATE VIEW "vw_project_cost_summary" AS
SELECT 
    p."id" AS "project_id",
    p."name" AS "project_name",
    p."budget",
    p."status",
    COALESCE(SUM(ex."amount"), 0) AS "total_expenses",
    COALESCE(SUM(
        CASE WHEN ex."category" = 'İşçilik' 
        THEN ex."amount" 
        ELSE 0 
        END
    ), 0) AS "labor_cost",
    COALESCE(SUM(
        CASE WHEN ex."category" = 'Malzeme' 
        THEN ex."amount" 
        ELSE 0 
        END
    ), 0) AS "material_cost",
    p."budget" - COALESCE(SUM(ex."amount"), 0) AS "remaining_budget",
    ROUND(
        (COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0)) * 100,
        2
    ) AS "budget_usage_percentage"
FROM "Projects" p
LEFT JOIN "Expenses" ex ON p."id" = ex."ProjectId"
GROUP BY p."id", p."name", p."budget", p."status"
ORDER BY "budget_usage_percentage" DESC;

COMMENT ON VIEW "vw_project_cost_summary" IS 
'Projelerin maliyet analizi ve bütçe kullanım raporu';

-- ============================================
-- STORED PROCEDURE (SAKLI YORDAM) TANIMLARI
-- ============================================

-- STORED PROCEDURE 1: Aylık Yoklama Raporu Oluşturma
-- Açıklama: Belirli bir ay ve yıl için tüm çalışanların yoklama özetini döndürür
-- Parametreler: p_year (yıl), p_month (ay)
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_monthly_attendance_report IS 
'Aylık yoklama raporu - Parametreler: yıl, ay';

-- STORED PROCEDURE 2: Proje Bütçe Kontrolü ve Uyarı
-- Açıklama: Proje bütçesinin eşik değerini aşan projeleri listeler
-- Parametreler: threshold_percentage (eşik yüzdesi, varsayılan 80)
DROP FUNCTION IF EXISTS sp_budget_alert_projects(NUMERIC) CASCADE;

CREATE OR REPLACE FUNCTION sp_budget_alert_projects(
    threshold_percentage NUMERIC DEFAULT 80
)
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_budget_alert_projects IS 
'Bütçe uyarı raporu - Parametre: eşik yüzdesi (varsayılan 80)';

-- ============================================
-- BAŞARIYLA TAMAMLANDI
-- Toplam 15 tablo, 2 view, 2 stored procedure oluşturuldu
-- ============================================
