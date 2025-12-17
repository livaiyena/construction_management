-- ============================================
-- İNŞAAT YÖNETİM SİSTEMİ
-- SQL SORGULARI (SELECT, JOIN, GROUP BY, HAVING)
-- Final Rapor için En Az 10 Farklı SQL Sorgusu
-- ============================================

-- ============================================
-- SORGU 1: PROJE BAZLI TOPLAM HARCAMA ANALİZİ
-- JOIN, SUM, GROUP BY, HAVING kullanımı
-- ============================================
-- Açıklama: Her projenin toplam harcamasını ve harcama sayısını listeler
-- Sadece harcaması olan projeleri gösterir (HAVING ile filtreleme)

SELECT 
    p."id" AS "proje_id",
    p."name" AS "proje_adi",
    p."city" AS "sehir",
    p."district" AS "ilce",
    p."budget" AS "butce",
    COUNT(e."id") AS "harcama_sayisi",
    COALESCE(SUM(e."amount"), 0) AS "toplam_harcama",
    (p."budget" - COALESCE(SUM(e."amount"), 0)) AS "kalan_butce",
    ROUND(
        CAST((COALESCE(SUM(e."amount"), 0) / NULLIF(p."budget", 0)) * 100 AS NUMERIC), 
        2
    ) AS "butce_kullanim_yuzdesi"
FROM "Projects" p
LEFT JOIN "Expenses" e ON p."id" = e."ProjectId"
GROUP BY p."id", p."name", p."city", p."district", p."budget"
HAVING COUNT(e."id") > 0
ORDER BY "toplam_harcama" DESC;


-- ============================================
-- SORGU 2: KATEGORİ BAZLI HARCAMA İSTATİSTİKLERİ
-- GROUP BY, HAVING, Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
-- ============================================
-- Açıklama: Harcama kategorilerine göre istatistikler
-- Toplam tutarı 1000 TL üzeri olan kategorileri gösterir

SELECT 
    "category" AS "kategori",
    COUNT(*) AS "islem_sayisi",
    SUM("amount") AS "toplam_tutar",
    ROUND(CAST(AVG("amount") AS NUMERIC), 2) AS "ortalama_tutar",
    MIN("amount") AS "min_tutar",
    MAX("amount") AS "max_tutar"
FROM "Expenses"
GROUP BY "category"
HAVING SUM("amount") > 1000
ORDER BY "toplam_tutar" DESC;


-- ============================================
-- SORGU 3: ÇALIŞAN YOKLAMA İSTATİSTİKLERİ
-- Multiple JOIN, COUNT, CASE WHEN, GROUP BY
-- ============================================
-- Açıklama: Her çalışanın yoklama istatistiklerini detaylı şekilde gösterir
-- Rol bilgisi ve çalışma istatistikleri ile birlikte

SELECT 
    e."id" AS "calisan_id",
    CONCAT(e."first_name", ' ', e."last_name") AS "calisan_adi",
    COALESCE(r."name", 'Belirtilmemiş') AS "pozisyon",
    e."daily_rate" AS "gunluk_ucret",
    COUNT(CASE WHEN a."status" = 'Geldi' THEN 1 END) AS "geldi_gun",
    COUNT(CASE WHEN a."status" = 'Gelmedi' THEN 1 END) AS "gelmedi_gun",
    COUNT(CASE WHEN a."status" = 'İzinli' THEN 1 END) AS "izinli_gun",
    COUNT(CASE WHEN a."status" = 'Raporlu' THEN 1 END) AS "raporlu_gun",
    COUNT(a."id") AS "toplam_kayit",
    COALESCE(SUM(a."worked_hours"), 0) AS "toplam_calisma_saati",
    COALESCE(SUM(a."overtime_hours"), 0) AS "toplam_mesai_saati",
    ROUND(
        CAST((COUNT(CASE WHEN a."status" = 'Geldi' THEN 1 END) * 100.0 / NULLIF(COUNT(a."id"), 0)) AS NUMERIC),
        2
    ) AS "devam_yuzdesi"
FROM "Employees" e
LEFT JOIN "Roles" r ON e."RoleId" = r."id"
LEFT JOIN "Attendances" a ON e."id" = a."EmployeeId"
GROUP BY e."id", e."first_name", e."last_name", r."name", e."daily_rate"
HAVING COUNT(a."id") > 0
ORDER BY "geldi_gun" DESC;


-- ============================================
-- SORGU 4: PROJE DETAY RAPORU (Tek Proje)
-- Complex JOIN, Subquery simulation, Multiple aggregations
-- ============================================
-- Açıklama: Belirli bir projenin tüm detaylarını gösterir
-- Parametrik sorgu: :projectId yerine gerçek ID kullanılır

SELECT 
    p."id",
    p."name" AS "proje_adi",
    p."city" || ' / ' || p."district" AS "lokasyon",
    p."address" AS "adres",
    p."budget" AS "butce",
    p."start_date" AS "baslangic_tarihi",
    p."end_date" AS "bitis_tarihi",
    p."status" AS "durum",
    COUNT(DISTINCT e."id") AS "calisan_sayisi",
    COUNT(DISTINCT ex."id") AS "harcama_sayisi",
    COALESCE(SUM(ex."amount"), 0) AS "toplam_harcama",
    (p."budget" - COALESCE(SUM(ex."amount"), 0)) AS "kalan_butce",
    ROUND(
        CAST((COALESCE(SUM(ex."amount"), 0) / NULLIF(p."budget", 0) * 100) AS NUMERIC),
        2
    ) AS "butce_kullanim_orani"
FROM "Projects" p
LEFT JOIN "Employees" e ON p."id" = e."ProjectId"
LEFT JOIN "Expenses" ex ON p."id" = ex."ProjectId"
WHERE p."id" = 1  -- Örnek: 1 numaralı proje
GROUP BY p."id", p."name", p."city", p."district", p."address", p."budget", p."start_date", p."end_date", p."status";


-- ============================================
-- SORGU 5: AYLIK HARCAMA TRENDİ
-- Date Functions, GROUP BY with date formatting, ORDER BY
-- ============================================
-- Açıklama: Son 6 ayın aylık harcama istatistiklerini gösterir

SELECT 
    TO_CHAR("expense_date", 'YYYY-MM') AS "ay",
    TO_CHAR("expense_date", 'Month YYYY') AS "ay_adi",
    COUNT(*) AS "islem_sayisi",
    SUM("amount") AS "toplam_tutar",
    ROUND(CAST(AVG("amount") AS NUMERIC), 2) AS "ortalama_tutar",
    MIN("amount") AS "minimum_tutar",
    MAX("amount") AS "maksimum_tutar"
FROM "Expenses"
WHERE "expense_date" >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY TO_CHAR("expense_date", 'YYYY-MM'), TO_CHAR("expense_date", 'Month YYYY')
ORDER BY "ay" DESC;


-- ============================================
-- SORGU 6: EN AKTİF ÇALIŞANLAR
-- Subquery, ORDER BY, LIMIT, Percentage calculation
-- ============================================
-- Açıklama: En çok çalışan (devam oranı yüksek) ilk 10 çalışanı listeler

SELECT 
    e."id",
    CONCAT(e."first_name", ' ', e."last_name") AS "ad_soyad",
    e."phone" AS "telefon",
    r."name" AS "pozisyon",
    COUNT(a."id") AS "yoklama_kayit_sayisi",
    COUNT(CASE WHEN a."status" = 'Geldi' THEN 1 END) AS "geldi_sayisi",
    ROUND(
        CAST((COUNT(CASE WHEN a."status" = 'Geldi' THEN 1 END) * 100.0 / NULLIF(COUNT(a."id"), 0)) AS NUMERIC),
        2
    ) AS "devam_orani",
    COALESCE(SUM(a."worked_hours"), 0) AS "toplam_calisma_saati"
FROM "Employees" e
LEFT JOIN "Roles" r ON e."RoleId" = r."id"
LEFT JOIN "Attendances" a ON e."id" = a."EmployeeId"
WHERE e."isActive" = true
GROUP BY e."id", e."first_name", e."last_name", e."phone", r."name"
HAVING COUNT(a."id") > 0
ORDER BY "devam_orani" DESC, "toplam_calisma_saati" DESC
LIMIT 10;


-- ============================================
-- SORGU 7: ROL BAZLI MAAŞ ANALİZİ VE MALİYET TAHMİNİ
-- JOIN, GROUP BY, Complex calculations
-- ============================================
-- Açıklama: Her rol için aylık maliyet tahmini ve çalışan sayısı

SELECT 
    r."name" AS "pozisyon",
    COALESCE(r."default_daily_rate", 0) AS "varsayilan_gunluk_ucret",
    COUNT(CASE WHEN e."isActive" = true THEN 1 END) AS "aktif_calisan_sayisi",
    ROUND(CAST(COALESCE(r."default_daily_rate", 0) * 30 AS NUMERIC), 2) AS "aylik_maliyet_kisi_basina",
    ROUND(
        CAST(COALESCE(r."default_daily_rate", 0) * 30 * COUNT(CASE WHEN e."isActive" = true THEN 1 END) AS NUMERIC),
        2
    ) AS "toplam_aylik_maliyet"
FROM "Roles" r
LEFT JOIN "Employees" e ON r."id" = e."RoleId"
GROUP BY r."id", r."name", r."default_daily_rate"
ORDER BY "toplam_aylik_maliyet" DESC;


-- ============================================
-- SORGU 8: GECİKEN ÖDEMELER VE ÖNCELİK SEVİYESİ
-- WHERE conditions, CASE WHEN, Date calculations
-- ============================================
-- Açıklama: Beklemede veya onaylanmış ama ödenmemiş harcamaları listeler
-- Gecikme süresine göre öncelik seviyesi atar

SELECT 
    e."id",
    e."description" AS "aciklama",
    e."amount" AS "tutar",
    e."category" AS "kategori",
    e."expense_date" AS "harcama_tarihi",
    e."status" AS "durum",
    p."name" AS "proje_adi",
    (CURRENT_DATE - e."expense_date") AS "geciken_gun",
    CASE 
        WHEN (CURRENT_DATE - e."expense_date") > 30 THEN 'KRİTİK'
        WHEN (CURRENT_DATE - e."expense_date") > 15 THEN 'UYARI'
        ELSE 'NORMAL'
    END AS "oncelik_seviyesi"
FROM "Expenses" e
INNER JOIN "Projects" p ON e."ProjectId" = p."id"
WHERE e."status" IN ('Beklemede', 'Onaylandı')
    AND (CURRENT_DATE - e."expense_date") <= 45
    AND (CURRENT_DATE - e."expense_date") > 7
ORDER BY "geciken_gun" DESC
LIMIT 20;


-- ============================================
-- SORGU 9: PROJE PERFORMANS KARŞILAŞTIRMASI
-- Multiple aggregations, Complex calculations, Percentage
-- ============================================
-- Açıklama: Tüm projelerin performansını bütçe kullanımı ve ekip büyüklüğü ile karşılaştırır

SELECT 
    p."name" AS "proje_adi",
    p."status" AS "durum",
    CAST(COALESCE(p."budget", 0) AS NUMERIC) AS "butce",
    CAST(COALESCE(SUM(e."amount"), 0) AS NUMERIC) AS "toplam_harcama",
    CASE 
        WHEN COALESCE(p."budget", 0) > 0 THEN 
            ROUND((CAST(COALESCE(SUM(e."amount"), 0) AS NUMERIC) / CAST(p."budget" AS NUMERIC)) * 100, 2)
        ELSE 0
    END AS "butce_kullanim_yuzde",
    COUNT(DISTINCT emp."id") AS "ekip_buyuklugu",
    COUNT(DISTINCT e."id") AS "harcama_islem_sayisi",
    CASE 
        WHEN p."status" = 'Tamamlandı' THEN 'Tamamlandı'
        WHEN p."start_date" > CURRENT_DATE THEN 'Henüz Başlamadı'
        WHEN p."end_date" < CURRENT_DATE THEN 'Gecikmiş'
        ELSE 'Zamanında'
    END AS "zaman_durumu"
FROM "Projects" p
LEFT JOIN "Expenses" e ON p."id" = e."ProjectId"
LEFT JOIN "Employees" emp ON p."id" = emp."ProjectId" AND emp."isActive" = true
GROUP BY p."id", p."name", p."status", p."budget", p."start_date", p."end_date"
ORDER BY "toplam_harcama" DESC;


-- ============================================
-- SORGU 10: HAFTALIK YOKLAMA ÖZETİ
-- Date functions, Aggregation by week, Percentage
-- ============================================
-- Açıklama: Son 8 haftanın haftalık yoklama istatistiklerini gösterir

SELECT 
    TO_CHAR("date", 'IYYY-IW') AS "hafta",
    TO_CHAR("date", 'DD Month YYYY') AS "hafta_baslangic",
    COUNT(*) AS "toplam_kayit",
    COUNT(CASE WHEN "status" = 'Geldi' THEN 1 END) AS "geldi_sayisi",
    COUNT(CASE WHEN "status" = 'Gelmedi' THEN 1 END) AS "gelmedi_sayisi",
    COUNT(CASE WHEN "status" IN ('İzinli', 'Raporlu') THEN 1 END) AS "izin_sayisi",
    ROUND(
        CAST((COUNT(CASE WHEN "status" = 'Geldi' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) AS NUMERIC),
        2
    ) AS "devam_yuzdesi"
FROM "Attendances"
WHERE "date" >= CURRENT_DATE - INTERVAL '8 weeks'
GROUP BY TO_CHAR("date", 'IYYY-IW'), TO_CHAR("date", 'DD Month YYYY')
ORDER BY "hafta" DESC;


-- ============================================
-- SORGU 11: EN PAHALI PROJELER (TOP 5)
-- Nested aggregation, TOP N with LIMIT
-- ============================================
-- Açıklama: En çok harcama yapılan ilk 5 projeyi gösterir

SELECT 
    p."id",
    p."name" AS "proje_adi",
    p."budget" AS "butce",
    COALESCE(SUM(e."amount"), 0) AS "toplam_harcama",
    COUNT(e."id") AS "harcama_sayisi",
    ROUND(
        CAST((COALESCE(SUM(e."amount"), 0) / NULLIF(COUNT(e."id"), 0)) AS NUMERIC),
        2
    ) AS "ortalama_harcama"
FROM "Projects" p
LEFT JOIN "Expenses" e ON p."id" = e."ProjectId"
GROUP BY p."id", p."name", p."budget"
HAVING COALESCE(SUM(e."amount"), 0) > 0
ORDER BY "toplam_harcama" DESC
LIMIT 5;


-- ============================================
-- SORGU 12: ÇALIŞAN MALİYET RAPORU
-- Complex calculation with multiple tables, worked days
-- ============================================
-- Açıklama: Her çalışanın toplam maliyetini ve çalışma istatistiklerini gösterir

SELECT 
    e."id",
    CONCAT(e."first_name", ' ', e."last_name") AS "calisan_adi",
    r."name" AS "pozisyon",
    CAST(COALESCE(e."daily_rate", r."default_daily_rate", 0) AS NUMERIC) AS "gunluk_ucret",
    COUNT(CASE WHEN a."status" = 'Geldi' THEN 1 END) AS "calisilangun_sayisi",
    CAST(COALESCE(SUM(a."worked_hours"), 0) AS NUMERIC) AS "toplam_saat",
    ROUND(
        CAST(COALESCE(e."daily_rate", r."default_daily_rate", 0) * 
             COUNT(CASE WHEN a."status" = 'Geldi' THEN 1 END) AS NUMERIC),
        2
    ) AS "toplam_maliyet"
FROM "Employees" e
INNER JOIN "Roles" r ON e."RoleId" = r."id"
LEFT JOIN "Attendances" a ON e."id" = a."EmployeeId"
WHERE e."isActive" = true
GROUP BY e."id", e."first_name", e."last_name", r."name", e."daily_rate", r."default_daily_rate"
HAVING COUNT(CASE WHEN a."status" = 'Geldi' THEN 1 END) > 0
ORDER BY "toplam_maliyet" DESC;


-- ============================================
-- SORGU 13: MALZEME STOK DURUM RAPORU
-- LEFT JOIN, WHERE, Complex conditions
-- ============================================
-- Açıklama: Malzeme stoklarını ve tedarikçi bilgilerini gösterir
-- Minimum stok altındaki malzemeleri vurgular

SELECT 
    m."id",
    m."name" AS "malzeme_adi",
    mc."name" AS "kategori",
    m."unit" AS "birim",
    m."stock_quantity" AS "mevcut_stok",
    m."minimum_stock" AS "minimum_stok",
    (m."stock_quantity" - m."minimum_stock") AS "stok_farki",
    CASE 
        WHEN m."stock_quantity" < m."minimum_stock" THEN 'UYARI: Stok Azaldı'
        WHEN m."stock_quantity" < (m."minimum_stock" * 1.5) THEN 'DİKKAT: Stok Azalıyor'
        ELSE 'Normal'
    END AS "stok_durumu",
    m."unit_price" AS "birim_fiyat",
    s."name" AS "tedarikci",
    s."phone" AS "tedarikci_telefon"
FROM "Materials" m
LEFT JOIN "MaterialCategories" mc ON m."MaterialCategoryId" = mc."id"
LEFT JOIN "Suppliers" s ON m."SupplierId" = s."id"
ORDER BY "stok_farki" ASC;


-- ============================================
-- SORGU 14: EKİPMAN KULLANIM VE BAKIM RAPORU
-- Multiple JOIN, Date calculations, Status check
-- ============================================
-- Açıklama: Ekipmanların kullanım durumu ve bakım tarihleri

SELECT 
    eq."id",
    eq."name" AS "ekipman_adi",
    et."name" AS "ekipman_tipi",
    eq."condition" AS "durum",
    eq."isAvailable" AS "musait_mi",
    eq."last_maintenance_date" AS "son_bakim",
    eq."next_maintenance_date" AS "sonraki_bakim",
    CASE 
        WHEN eq."next_maintenance_date" < CURRENT_DATE THEN 'BAKIMA GİRMELİ'
        WHEN eq."next_maintenance_date" < CURRENT_DATE + INTERVAL '30 days' THEN 'YAKIN ZAMANDA BAKIM'
        ELSE 'Normal'
    END AS "bakim_durumu",
    COUNT(pe."id") AS "kullanildigi_proje_sayisi",
    COALESCE(SUM(pe."total_days"), 0) AS "toplam_kullanim_gun"
FROM "Equipment" eq
LEFT JOIN "EquipmentTypes" et ON eq."EquipmentTypeId" = et."id"
LEFT JOIN "ProjectEquipment" pe ON eq."id" = pe."EquipmentId"
GROUP BY eq."id", eq."name", et."name", eq."condition", eq."isAvailable", 
         eq."last_maintenance_date", eq."next_maintenance_date"
ORDER BY "bakim_durumu", eq."name";


-- ============================================
-- SORGU 15: TEDARİKÇİ PERFORMANS ANALİZİ
-- Complex JOIN, Aggregation, Rating analysis
-- ============================================
-- Açıklama: Tedarikçilerin sağladığı malzeme sayısı ve değerlendirmeleri

SELECT 
    s."id",
    s."name" AS "tedarikci_adi",
    s."contact_person" AS "yetkili_kisi",
    s."phone" AS "telefon",
    s."rating" AS "degerlendirme",
    COUNT(DISTINCT m."id") AS "saglanan_malzeme_sayisi",
    COUNT(DISTINCT pm."ProjectId") AS "katildigi_proje_sayisi",
    COALESCE(SUM(pm."quantity_used" * pm."unit_price_at_time"), 0) AS "toplam_satis_degeri",
    s."payment_terms" AS "odeme_kosullari",
    CASE 
        WHEN s."rating" >= 4 THEN 'Mükemmel'
        WHEN s."rating" >= 3 THEN 'İyi'
        ELSE 'Orta'
    END AS "performans_seviyesi"
FROM "Suppliers" s
LEFT JOIN "Materials" m ON s."id" = m."SupplierId"
LEFT JOIN "ProjectMaterial" pm ON m."id" = pm."MaterialId"
WHERE s."isActive" = true
GROUP BY s."id", s."name", s."contact_person", s."phone", s."rating", s."payment_terms"
ORDER BY "toplam_satis_degeri" DESC;


-- ============================================
-- BONUS SORGU 16: SİSTEM KULLANICI AKTİVİTE ANALİZİ
-- Complex aggregation from audit logs
-- ============================================
-- Açıklama: Kullanıcıların sistem üzerindeki işlem istatistikleri

SELECT 
    u."id",
    u."name" AS "kullanici_adi",
    u."role" AS "rol",
    COUNT(al."id") AS "toplam_islem",
    COUNT(CASE WHEN al."action" = 'CREATE' THEN 1 END) AS "olusturma",
    COUNT(CASE WHEN al."action" = 'UPDATE' THEN 1 END) AS "guncelleme",
    COUNT(CASE WHEN al."action" = 'DELETE' THEN 1 END) AS "silme",
    COUNT(CASE WHEN al."action" = 'LOGIN' THEN 1 END) AS "giris_sayisi",
    MAX(al."timestamp") AS "son_islem_zamani"
FROM "Users" u
LEFT JOIN "AuditLogs" al ON u."id" = al."userId"
GROUP BY u."id", u."name", u."role"
ORDER BY "toplam_islem" DESC;


-- ============================================
-- BAŞARIYLA TAMAMLANDI
-- Toplam 16 Farklı SQL Sorgusu
-- İçerik: SELECT, JOIN, LEFT JOIN, INNER JOIN, GROUP BY, 
--         HAVING, ORDER BY, LIMIT, CASE WHEN, Aggregate Functions,
--         Date Functions, Subqueries, Complex Calculations
-- ============================================
