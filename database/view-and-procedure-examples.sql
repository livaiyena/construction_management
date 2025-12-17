-- ============================================
-- VIEW VE STORED PROCEDURE KULLANIM ÖRNEKLERİ
-- ============================================

-- ============================================
-- VIEW KULLANIM ÖRNEKLERİ
-- ============================================

-- ÖRNEK 1: Çalışan Performans Görünümünden Veri Çekme
-- Soru: Tüm çalışanların proje bazında performans bilgilerini listele
SELECT * FROM "vw_employee_project_performance" LIMIT 5;

-- Cevap (Gerçek Sonuç):
-- employee_id | employee_name  | role_name               | project_id | project_name              | total_attendance_days | total_worked_hours | total_overtime_hours | avg_daily_hours | present_days | absent_days | attendance_percentage
-- ------------|----------------|-------------------------|------------|---------------------------|-----------------------|--------------------|----------------------|-----------------|--------------|-------------|----------------------
-- 1           | Eren Aksoy     | Yardımcı İşçi           | 6          | İstanbul Hastane İnşaatı  | 30                    | 191.00             | 0.00                 | 6.37            | 21           | 9           | 70.00
-- 2           | Özge Bayram    | Güvenlik Görevlisi      | 5          | Antalya Otel Kompleksi    | 30                    | 185.00             | 0.00                 | 6.17            | 22           | 7           | 73.33

-- ÖRNEK 2: Belirli Bir Çalışanın Performansını Görüntüleme
-- Soru: ID'si 1 olan çalışanın tüm projelerdeki performansını göster
SELECT 
    employee_name,
    role_name,
    project_name,
    total_worked_hours,
    attendance_percentage
FROM "vw_employee_project_performance"
WHERE employee_id = 1;

-- Cevap (Gerçek Sonuç):
-- employee_name | role_name      | project_name             | total_worked_hours | attendance_percentage
-- --------------|----------------|--------------------------|-------------------|----------------------
-- Eren Aksoy    | Yardımcı İşçi  | İstanbul Hastane İnşaatı | 191.00            | 70.00

-- ÖRNEK 3: En Yüksek Performanslı Çalışanları Listeleme
-- Soru: Devam yüzdesi %90'ın üzerinde olan çalışanları listele
SELECT 
    employee_name,
    position,
    project_name,
    attendance_percentage,
    total_worked_hours
FROM "vw_employee_project_performance"
WHERE attendance_percentage >= 90
ORDER BY attendance_percentage DESC, total_worked_hours DESC;

-- ÖRNEK 4: Proje Maliyet Görünümünden Veri Çekme
-- Soru: Tüm projelerin maliyet özetini listele
SELECT * FROM "vw_project_cost_summary";

-- Cevap (Örnek):
-- project_id | project_name | budget    | status    | total_expenses | labor_cost | material_cost | remaining_budget | budget_usage_percentage
-- -----------|--------------|-----------|-----------|----------------|------------|---------------|-----------------|------------------------
-- 15         | Test Proje   | 500000.00 | Aktif     | 125000.00      | 45000.00   | 80000.00      | 375000.00       | 25.00

-- ÖRNEK 5: Bütçesi Kritik Seviyede Olan Projeleri Bulma
-- Soru: Bütçesinin %80'ini kullanmış projeleri listele
SELECT 
    project_name,
    budget,
    total_expenses,
    remaining_budget,
    budget_usage_percentage
FROM "vw_project_cost_summary"
WHERE budget_usage_percentage >= 80
ORDER BY budget_usage_percentage DESC;

-- ÖRNEK 6: Proje Maliyet Dağılımı Analizi
-- Soru: İşçilik ve malzeme maliyetlerinin toplam harcamaya oranını göster
SELECT 
    project_name,
    total_expenses,
    labor_cost,
    material_cost,
    ROUND((labor_cost / NULLIF(total_expenses, 0)) * 100, 2) AS labor_percentage,
    ROUND((material_cost / NULLIF(total_expenses, 0)) * 100, 2) AS material_percentage
FROM "vw_project_cost_summary"
WHERE total_expenses > 0;

-- ============================================
-- STORED PROCEDURE KULLANIM ÖRNEKLERİ
-- ============================================

-- ÖRNEK 1: Aylık Yoklama Raporu Çalıştırma
-- Soru: 2025 yılı Aralık ayı için yoklama raporu oluştur
SELECT * FROM sp_monthly_attendance_report(2025, 12);

-- Cevap (Örnek):
-- employee_id | employee_name    | position | total_days | present_days | absent_days | sick_leave_days | excused_days | total_worked_hours | total_overtime_hours | attendance_rate
-- ------------|------------------|----------|------------|--------------|-------------|-----------------|--------------|-------------------|---------------------|----------------
-- 114         | Ebru Özkan       | İşçi     | 5          | 4            | 1           | 0               | 0            | 32.00             | 0.00                | 80.00
-- 121         | Doğukan Yılmaz   | Mühendis | 5          | 4            | 1           | 0               | 0            | 32.00             | 2.00                | 80.00

-- ÖRNEK 2: Kasım Ayı Yoklama Raporu
-- Soru: 2025 yılı Kasım ayı yoklama istatistiklerini getir
SELECT 
    employee_name,
    position,
    present_days,
    absent_days,
    total_worked_hours,
    attendance_rate
FROM sp_monthly_attendance_report(2025, 11)
WHERE attendance_rate < 80;

-- ÖRNEK 3: Fazla Mesai Analizi
-- Soru: Aralık ayında en çok fazla mesai yapan çalışanları listele
SELECT 
    employee_name,
    position,
    total_overtime_hours,
    total_worked_hours
FROM sp_monthly_attendance_report(2025, 12)
WHERE total_overtime_hours > 0
ORDER BY total_overtime_hours DESC;

-- ÖRNEK 4: Bütçe Uyarı Raporu Çalıştırma (Varsayılan %80 Eşik)
-- Soru: Bütçesinin %80'ini kullanmış projeleri listele
SELECT * FROM sp_budget_alert_projects();

-- Cevap (Örnek):
-- project_id | project_name    | budget    | total_expenses | remaining_budget | usage_percentage | alert_level
-- -----------|-----------------|-----------|----------------|------------------|-----------------|------------
-- 12         | Kritik Proje    | 200000.00 | 195000.00      | 5000.00          | 97.50           | YÜKSEK

-- ÖRNEK 5: Bütçe Uyarı Raporu (Özel Eşik %70)
-- Soru: Bütçesinin %70'ini kullanmış projeleri listele
SELECT 
    project_name,
    budget,
    total_expenses,
    remaining_budget,
    usage_percentage,
    alert_level
FROM sp_budget_alert_projects(70)
ORDER BY usage_percentage DESC;

-- ÖRNEK 6: Kritik Projeleri Filtreleme
-- Soru: Sadece kritik ve yüksek uyarı seviyesindeki projeleri göster
SELECT 
    project_name,
    total_expenses,
    remaining_budget,
    usage_percentage,
    alert_level
FROM sp_budget_alert_projects(80)
WHERE alert_level IN ('KRİTİK', 'YÜKSEK')
ORDER BY usage_percentage DESC;

-- ============================================
-- GELİŞMİŞ SORGULAR - VIEW VE PROCEDURE BİRLEŞİMİ
-- ============================================

-- ÖRNEK 7: Çalışan Performansı ve Aylık Rapor Karşılaştırması
-- Soru: Aralık ayı raporu ile genel performansı karşılaştır
WITH monthly_report AS (
    SELECT * FROM sp_monthly_attendance_report(2025, 12)
)
SELECT 
    vw.employee_name,
    vw.project_name,
    vw.attendance_percentage AS overall_attendance,
    mr.attendance_rate AS december_attendance,
    mr.total_overtime_hours AS december_overtime
FROM "vw_employee_project_performance" vw
LEFT JOIN monthly_report mr ON vw.employee_id = mr.employee_id
WHERE mr.employee_id IS NOT NULL
ORDER BY vw.employee_name;

-- ÖRNEK 8: Bütçe ve Performans Çapraz Analizi
-- Soru: Yüksek bütçe kullanımı olan projelerdeki çalışan performanslarını göster
WITH budget_alerts AS (
    SELECT * FROM sp_budget_alert_projects(80)
)
SELECT 
    ba.project_name,
    ba.usage_percentage,
    ba.alert_level,
    vw.employee_name,
    vw.position,
    vw.total_worked_hours,
    vw.attendance_percentage
FROM budget_alerts ba
JOIN "vw_employee_project_performance" vw ON ba.project_id = vw.project_id
WHERE ba.alert_level IN ('YÜKSEK', 'KRİTİK')
ORDER BY ba.usage_percentage DESC, vw.total_worked_hours DESC;

-- ============================================
-- AÇIKLAMALAR VE ÖRNEKLER
-- ============================================

/*
VIEW AVANTAJLARI:
1. Karmaşık JOIN'leri basitleştirir
2. Güvenlik sağlar (hassas kolonları gizler)
3. Veri tutarlılığı (her zaman güncel veri)
4. Kod tekrarını önler

STORED PROCEDURE AVANTAJLARI:
1. Performans artışı (derlenmiş kod)
2. Ağ trafiğini azaltır
3. İş mantığını merkezileştirir
4. Parametrik sorgular
5. Güvenlik (SQL injection'dan korunma)

KULLANIM SENARYOları:
- vw_employee_project_performance: Yönetici panoları, performans değerlendirmeleri
- vw_project_cost_summary: Mali raporlama, bütçe takibi
- sp_monthly_attendance_report: Bordro hazırlama, devam çizelgeleri
- sp_budget_alert_projects: Erken uyarı sistemi, yönetici bildirimleri
*/
