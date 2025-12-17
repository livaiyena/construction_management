-- ============================================
-- İNŞAAT YÖNETİM SİSTEMİ
-- DML (Data Manipulation Language) Örnekleri
-- INSERT, UPDATE, DELETE İşlemleri
-- ============================================

-- ============================================
-- INSERT EXAMPLES (Veri Ekleme)
-- ============================================

-- 1. Users Tablosuna Kayıt Ekleme
INSERT INTO "Users" ("name", "email", "password", "role", "createdAt", "updatedAt")
VALUES 
    ('Ahmet Yılmaz', 'ahmet@example.com', '$2a$10$hashedpassword123', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Mehmet Kaya', 'mehmet@example.com', '$2a$10$hashedpassword456', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Ayşe Demir', 'ayse@example.com', '$2a$10$hashedpassword789', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Projects Tablosuna Kayıt Ekleme
INSERT INTO "Projects" ("name", "city", "district", "address", "budget", "status", "start_date", "userId", "createdAt", "updatedAt")
VALUES 
    ('Lale Sitesi İnşaatı', 'İstanbul', 'Beşiktaş', 'Yıldız Mahallesi, Çırağan Caddesi No: 45', 5000000.00, 'Devam Ediyor', '2024-01-15', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Gül Rezidans', 'Ankara', 'Çankaya', 'Kızılay Meydanı, Atatürk Bulvarı No: 120', 3500000.00, 'Planlama', '2024-03-01', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Papatya Plaza', 'İzmir', 'Konak', 'Alsancak Mahallesi, Kordon Boyu No: 78', 7200000.00, 'Devam Ediyor', '2023-11-10', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Roles Tablosuna Kayıt Ekleme
INSERT INTO "Roles" ("name", "default_daily_rate", "userId", "createdAt", "updatedAt")
VALUES 
    ('Mühendis', 1500.00, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Usta', 800.00, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('İşçi', 500.00, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Elektrikçi', 700.00, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Tesisatçı', 650.00, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Employees Tablosuna Kayıt Ekleme
INSERT INTO "Employees" ("first_name", "last_name", "email", "phone", "hire_date", "daily_rate", "status", "RoleId", "ProjectId", "userId", "createdAt", "updatedAt")
VALUES 
    ('Ali', 'Çelik', 'ali.celik@example.com', '0532 123 4567', '2024-01-20', 1500.00, 'aktif', 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Veli', 'Taş', 'veli.tas@example.com', '0533 234 5678', '2024-01-22', 800.00, 'aktif', 2, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Can', 'Kara', 'can.kara@example.com', '0534 345 6789', '2024-02-01', 500.00, 'aktif', 3, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Zeynep', 'Ak', 'zeynep.ak@example.com', '0535 456 7890', '2024-02-10', 700.00, 'aktif', 4, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Fatma', 'Yıldız', 'fatma.yildiz@example.com', '0536 567 8901', '2024-02-15', 650.00, 'aktif', 5, 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Attendances Tablosuna Kayıt Ekleme (Yoklama)
INSERT INTO "Attendances" ("EmployeeId", "ProjectId", "date", "status", "worked_hours", "overtime_hours", "userId", "createdAt", "updatedAt")
VALUES 
    (1, 1, '2024-12-15', 'Geldi', 8.0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, '2024-12-15', 'Geldi', 8.0, 2.0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, '2024-12-15', 'Gelmedi', 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 1, '2024-12-16', 'Geldi', 8.0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 2, '2024-12-15', 'İzinli', 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Suppliers Tablosuna Kayıt Ekleme (Tedarikçiler)
INSERT INTO "Suppliers" ("name", "contact_person", "phone", "email", "tax_number", "payment_terms", "rating", "userId", "createdAt", "updatedAt")
VALUES 
    ('Çimento A.Ş.', 'Hasan Özkan', '0212 555 1234', 'info@cimento.com', '1234567890', '30 gün vadeli', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Demir Ticaret Ltd.', 'Ayşe Yılmaz', '0212 555 5678', 'satis@demir.com', '9876543210', 'Peşin', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Boya Dünyası', 'Mehmet Şen', '0216 555 9012', 'contact@boya.com', '5555555555', '15 gün vadeli', 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. Material Categories Ekleme
INSERT INTO "MaterialCategories" ("name", "description", "userId", "createdAt", "updatedAt")
VALUES 
    ('Çimento', 'İnşaat çimentoları ve bağlayıcılar', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Demir', 'İnşaat demiri ve çelik malzemeler', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Boya', 'İç ve dış cephe boyaları', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Seramik', 'Zemin ve duvar seramikleri', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. Materials Tablosuna Kayıt Ekleme
INSERT INTO "Materials" ("name", "MaterialCategoryId", "unit", "unit_price", "stock_quantity", "minimum_stock", "SupplierId", "userId", "createdAt", "updatedAt")
VALUES 
    ('Portland Çimentosu CEM I 42.5', 1, 'ton', 2500.00, 50.0, 10.0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('İnşaat Demiri Ø12', 2, 'ton', 15000.00, 25.0, 5.0, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Dış Cephe Boyası Beyaz 15L', 3, 'adet', 450.00, 100, 20, 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Granit Seramik 60x60', 4, 'm²', 120.00, 500, 100, NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 9. Equipment Types Ekleme
INSERT INTO "EquipmentTypes" ("name", "description", "userId", "createdAt", "updatedAt")
VALUES 
    ('Vinç', 'Ağır yük kaldırma ekipmanları', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Kazıcı', 'Toprak kazı makineleri', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Matkap', 'Delme ve sondaj ekipmanları', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 10. Equipment Tablosuna Kayıt Ekleme
INSERT INTO "Equipment" ("name", "EquipmentTypeId", "serial_number", "purchase_date", "purchase_price", "daily_rental_cost", "condition", "location", "userId", "createdAt", "updatedAt")
VALUES 
    ('Kule Vinç KV-2024', 1, 'SN-VNC-001', '2023-05-10', 450000.00, 2500.00, 'Mükemmel', 'Lale Sitesi Şantiyesi', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Ekskavatör CAT 320', 2, 'SN-EKS-002', '2023-06-15', 350000.00, 2000.00, 'İyi', 'Papatya Plaza Şantiyesi', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Hilti Matkap TE-70', 3, 'SN-MTK-003', '2024-01-05', 8500.00, 150.00, 'Mükemmel', 'Depo', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11. ProjectMaterial Ekleme (Projelerde Kullanılan Malzemeler)
INSERT INTO "ProjectMaterial" ("ProjectId", "MaterialId", "quantity_used", "unit_price_at_time", "date_used", "createdAt", "updatedAt")
VALUES 
    (1, 1, 15.5, 2500.00, '2024-12-10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 2, 8.2, 15000.00, '2024-12-11', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 3, 45, 450.00, '2024-12-12', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, 25.0, 2500.00, '2024-12-05', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 12. ProjectEquipment Ekleme (Projelerde Kullanılan Ekipmanlar)
INSERT INTO "ProjectEquipment" ("ProjectId", "EquipmentId", "start_date", "end_date", "daily_cost", "total_days", "createdAt", "updatedAt")
VALUES 
    (1, 1, '2024-01-15', NULL, 2500.00, 335, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 2, '2023-11-10', NULL, 2000.00, 403, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 3, '2024-03-01', '2024-03-15', 150.00, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 13. Expenses Tablosuna Kayıt Ekleme (Harcamalar)
INSERT INTO "Expenses" ("ProjectId", "category", "description", "amount", "expense_date", "payment_method", "status", "userId", "createdAt", "updatedAt")
VALUES 
    (1, 'Maaş', 'Ocak 2024 işçi maaşları', 125000.00, '2024-01-31', 'Havale', 'Ödendi', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Malzeme', 'Çimento ve demir alımı', 246000.00, '2024-12-10', 'Kredi Kartı', 'Ödendi', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Ekipman', 'Vinç kiralama - Aralık', 75000.00, '2024-12-01', 'Havale', 'Onaylandı', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Ulaşım', 'İşçi servisi - Mart', 8500.00, '2024-03-15', 'Nakit', 'Beklemede', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Yemek', 'Şantiye yemek hizmeti', 45000.00, '2024-12-14', 'Havale', 'Ödendi', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 14. Documents Tablosuna Kayıt Ekleme
INSERT INTO "Documents" ("ProjectId", "title", "type", "file_name", "upload_date", "uploaded_by", "status", "createdAt", "updatedAt")
VALUES 
    (1, 'İnşaat Ruhsatı', 'Ruhsat', 'lale_sitesi_ruhsat.pdf', CURRENT_TIMESTAMP, 1, 'Aktif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Mimari Proje', 'Plan', 'mimari_plan_v2.dwg', CURRENT_TIMESTAMP, 1, 'Aktif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'İş Sözleşmesi', 'Sözleşme', 'papatya_sozlesme.pdf', CURRENT_TIMESTAMP, 2, 'Aktif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 15. AuditLogs Tablosuna Kayıt Ekleme
INSERT INTO "AuditLogs" ("userId", "userName", "action", "tableName", "recordId", "changes", "timestamp", "createdAt")
VALUES 
    (1, 'Ahmet Yılmaz', 'CREATE', 'Projects', 1, 'Yeni proje oluşturuldu: Lale Sitesi İnşaatı', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Ahmet Yılmaz', 'UPDATE', 'Expenses', 5, 'Harcama durumu: Beklemede -> Ödendi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Mehmet Kaya', 'DELETE', 'Employees', 10, 'Çalışan silindi: ID 10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- UPDATE EXAMPLES (Veri Güncelleme)
-- ============================================

-- 1. Proje Durumunu Güncelleme
UPDATE "Projects" 
SET "status" = 'Tamamlandı', 
    "end_date" = '2024-12-15',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 2;

-- 2. Çalışan Ücretini Artırma
UPDATE "Employees" 
SET "daily_rate" = "daily_rate" * 1.10,  -- %10 zam
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "RoleId" = 3;  -- İşçi pozisyonundaki tüm çalışanlar

-- 3. Malzeme Stok Güncelleme
UPDATE "Materials" 
SET "stock_quantity" = "stock_quantity" - 15.5,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 1;  -- Kullanılan çimento miktarı kadar azalt

-- 4. Harcama Durumu Güncelleme
UPDATE "Expenses" 
SET "status" = 'Ödendi',
    "payment_method" = 'Havale',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'Onaylandı' AND "ProjectId" = 1;

-- 5. Çalışan Proje Ataması Değiştirme
UPDATE "Employees" 
SET "ProjectId" = 2,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 3 AND "status" = 'aktif';

-- 6. Ekipman Durumu Güncelleme (Bakıma Alma)
UPDATE "Equipment" 
SET "condition" = 'Bakımda',
    "isAvailable" = false,
    "last_maintenance_date" = CURRENT_DATE,
    "next_maintenance_date" = CURRENT_DATE + INTERVAL '90 days',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 2;

-- 7. Tedarikçi Değerlendirmesi Güncelleme
UPDATE "Suppliers" 
SET "rating" = 5,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Çimento A.Ş.';

-- 8. Toplu Yoklama Güncelleme (Mesai Saati Ekleme)
UPDATE "Attendances" 
SET "overtime_hours" = 2.0,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "date" = '2024-12-15' 
  AND "status" = 'Geldi' 
  AND "ProjectId" = 1;

-- 9. Döküman Durumu Güncelleme (Arşive Alma)
UPDATE "Documents" 
SET "status" = 'Arşiv',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "upload_date" < CURRENT_DATE - INTERVAL '2 years';

-- 10. Rol Günlük Ücret Güncelleme
UPDATE "Roles" 
SET "default_daily_rate" = "default_daily_rate" + 100,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" IN ('Mühendis', 'Usta');

-- ============================================
-- DELETE EXAMPLES (Veri Silme)
-- ============================================

-- 1. Belirli Bir Projeyi Silme
DELETE FROM "Projects" 
WHERE "id" = 999 AND "status" = 'İptal';

-- 2. Eski Audit Loglarını Silme (1 yıldan eski)
DELETE FROM "AuditLogs" 
WHERE "timestamp" < CURRENT_DATE - INTERVAL '1 year';

-- 3. Pasif Çalışanları Silme
DELETE FROM "Employees" 
WHERE "status" = 'pasif' AND "isActive" = false;

-- 4. İptal Edilmiş Harcamaları Silme
DELETE FROM "Expenses" 
WHERE "status" = 'İptal' 
  AND "expense_date" < CURRENT_DATE - INTERVAL '6 months';

-- 5. Belirli Tarihten Önceki Yoklama Kayıtlarını Silme
DELETE FROM "Attendances" 
WHERE "date" < '2023-01-01';

-- 6. Stokta Olmayan ve Kullanılmayan Malzemeleri Silme
DELETE FROM "Materials" 
WHERE "stock_quantity" = 0 
  AND "id" NOT IN (SELECT DISTINCT "MaterialId" FROM "ProjectMaterial");

-- 7. Kullanılmayan Tedarikçileri Silme
DELETE FROM "Suppliers" 
WHERE "isActive" = false 
  AND "id" NOT IN (SELECT DISTINCT "SupplierId" FROM "Materials" WHERE "SupplierId" IS NOT NULL);

-- 8. Süresi Dolmuş Dökümanları Silme
DELETE FROM "Documents" 
WHERE "status" = 'Süresi Dolmuş' 
  AND "expiry_date" < CURRENT_DATE - INTERVAL '1 year';

-- 9. Tamamlanmış Projelerden Eski Ekipman Atamalarını Silme
DELETE FROM "ProjectEquipment" 
WHERE "end_date" < CURRENT_DATE - INTERVAL '2 years'
  AND "ProjectId" IN (SELECT "id" FROM "Projects" WHERE "status" = 'Tamamlandı');

-- 10. Belirli Bir Kullanıcının Tüm Rollerini Silme (Cascade ile ilişkili kayıtlar da silinir)
-- DELETE FROM "Users" WHERE "id" = 99;  -- Bu örnek dikkatli kullanılmalı

-- ============================================
-- COMPLEX DML EXAMPLES (Karmaşık İşlemler)
-- ============================================

-- 1. Bir projenin toplam harcamasını UPDATE ile güncelleme
UPDATE "Projects" p
SET "budget" = (
    SELECT COALESCE(SUM(e."amount"), 0)
    FROM "Expenses" e
    WHERE e."ProjectId" = p."id"
),
"updatedAt" = CURRENT_TIMESTAMP
WHERE p."id" = 1;

-- 2. Malzeme kullanımından sonra stok güncelleme ve ProjectMaterial ekleme (Transaction benzeri)
-- Önce ProjectMaterial'a kayıt ekle
INSERT INTO "ProjectMaterial" ("ProjectId", "MaterialId", "quantity_used", "unit_price_at_time", "date_used")
VALUES (1, 1, 10.0, 2500.00, CURRENT_DATE);

-- Sonra stoktan düş
UPDATE "Materials" 
SET "stock_quantity" = "stock_quantity" - 10.0,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 1;

-- 3. Toplu maaş ödemesi ekleme (her aktif çalışan için)
INSERT INTO "Expenses" ("ProjectId", "category", "description", "amount", "expense_date", "status", "userId")
SELECT 
    e."ProjectId",
    'Maaş',
    CONCAT(e."first_name", ' ', e."last_name", ' - Aralık 2024 Maaşı'),
    e."daily_rate" * 30,  -- 30 günlük maaş
    CURRENT_DATE,
    'Beklemede',
    e."userId"
FROM "Employees" e
WHERE e."isActive" = true AND e."status" = 'aktif';

-- 4. Minimum stok altındaki malzemeleri belirten kayıt ekleme
INSERT INTO "AuditLogs" ("userId", "userName", "action", "tableName", "recordId", "changes", "timestamp")
SELECT 
    1,
    'Sistem',
    'CREATE',
    'Materials',
    m."id",
    CONCAT('Minimum stok uyarısı: ', m."name", ' - Mevcut: ', m."stock_quantity", ', Min: ', m."minimum_stock"),
    CURRENT_TIMESTAMP
FROM "Materials" m
WHERE m."stock_quantity" < m."minimum_stock";

-- ============================================
-- TRANSACTION EXAMPLE (İşlem Örneği)
-- ============================================

BEGIN;

-- Yeni proje oluştur
INSERT INTO "Projects" ("name", "city", "district", "budget", "status", "start_date", "userId")
VALUES ('Test Proje', 'İstanbul', 'Kadıköy', 1000000, 'Planlama', CURRENT_DATE, 1)
RETURNING "id";

-- Varsayalım ki yukarıdaki INSERT sonucu id = 100 döndü

-- Projeye çalışan ata
UPDATE "Employees" 
SET "ProjectId" = 100
WHERE "id" IN (1, 2, 3);

-- Audit log kaydet
INSERT INTO "AuditLogs" ("userId", "userName", "action", "tableName", "recordId", "changes")
VALUES (1, 'Ahmet Yılmaz', 'CREATE', 'Projects', 100, 'Test Proje oluşturuldu ve 3 çalışan atandı');

COMMIT;
-- Hata olursa: ROLLBACK;

-- ============================================
-- BAŞARIYLA TAMAMLANDI
-- Toplam 50+ DML Örneği
-- ============================================
