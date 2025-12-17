# VIEW VE STORED PROCEDURE DOKÜMANTASYONU

## VIEW (Görünüm) Nedir?

**VIEW**, veritabanında saklanan sanal bir tablodur. Fiziksel olarak veri saklamaz, sadece bir SQL sorgusunun adlandırılmış halidir. Her sorgulandığında dinamik olarak çalışır ve güncel veriyi döndürür.

### Avantajları:
1. **Karmaşık Sorguları Basitleştirir**: Çok tablolu JOIN'leri tek bir VIEW olarak kullanırız
2. **Güvenlik**: Hassas kolonları gizleyerek sadece gerekli verileri gösterir
3. **Tutarlılık**: Aynı sorgu her yerde aynı şekilde çalışır
4. **Güncel Veri**: Her sorgulandığında gerçek veriden üretilir

## STORED PROCEDURE (Saklı Yordam) Nedir?

**STORED PROCEDURE**, veritabanında önceden derlenmiş ve kaydedilmiş SQL kodlarıdır. Parametreler alabilir, koşullar içerebilir ve karmaşık işlemleri tek bir çağrıda yapar.

### Avantajları:
1. **Performans**: Önceden derlendiği için hızlıdır
2. **Güvenlik**: SQL Injection saldırılarından korur
3. **İş Mantığı**: Karmaşık hesaplamaları veritabanı seviyesinde yapar
4. **Ağ Trafiği**: Tek bir çağrıda çok iş yapar
5. **Tekrar Kullanılabilirlik**: Bir kez yazılır, her yerden çağrılır

---

## PROJE'DE OLUŞTURULAN VIEW'LER

### 1. vw_employee_project_performance

**Açıklama**: Çalışanların proje bazında performans analizi

**Kolonlar**:
- employee_id: Çalışan ID
- employee_name: Çalışan adı soyadı
- role_name: Çalışanın rolü (Roles tablosundan)
- project_id: Proje ID
- project_name: Proje adı
- total_attendance_days: Toplam devam günü sayısı
- total_worked_hours: Toplam çalışma saati
- total_overtime_hours: Toplam fazla mesai saati
- avg_daily_hours: Günlük ortalama çalışma saati
- present_days: Geldiği gün sayısı
- absent_days: Gelmediği gün sayısı
- attendance_percentage: Devam yüzdesi

**Kullanım Örneği**:
```sql
-- Tüm çalışanların performansını listele
SELECT * FROM "vw_employee_project_performance";

-- Devam yüzdesi düşük çalışanları bul
SELECT employee_name, project_name, attendance_percentage 
FROM "vw_employee_project_performance"
WHERE attendance_percentage < 80
ORDER BY attendance_percentage ASC;
```

**Gerçek Sonuç**:
```
employee_name  | role_name               | project_name             | attendance_percentage
---------------|-------------------------|--------------------------|----------------------
Eren Aksoy     | Yardımcı İşçi           | İstanbul Hastane İnşaatı | 70.00
Özge Bayram    | Güvenlik Görevlisi      | Antalya Otel Kompleksi   | 73.33
```

---

### 2. vw_project_cost_summary

**Açıklama**: Projelerin maliyet özeti ve bütçe kullanım analizi

**Kolonlar**:
- project_id: Proje ID
- project_name: Proje adı
- budget: Proje bütçesi
- status: Proje durumu
- total_expenses: Toplam harcama
- labor_cost: İşçilik maliyeti
- material_cost: Malzeme maliyeti
- remaining_budget: Kalan bütçe
- budget_usage_percentage: Bütçe kullanım yüzdesi

**Kullanım Örneği**:
```sql
-- Tüm projelerin maliyet özetini listele
SELECT * FROM "vw_project_cost_summary";

-- Bütçesi kritik seviyede olan projeleri bul
SELECT project_name, budget, total_expenses, budget_usage_percentage
FROM "vw_project_cost_summary"
WHERE budget_usage_percentage > 80
ORDER BY budget_usage_percentage DESC;
```

**Gerçek Sonuç**:
```
project_name              | budget        | total_expenses | budget_usage_percentage
--------------------------|---------------|----------------|------------------------
İzmir Fabrika Binası      | 28000000.00   | 1643996.00     | 5.87
Bursa Spor Kompleksi      | 42000000.00   | 1380112.00     | 3.29
Ankara Plaza İş Merkezi   | 45000000.00   | 1349747.00     | 3.00
```

---

## PROJE'DE OLUŞTURULAN STORED PROCEDURE'LER

### 1. sp_monthly_attendance_report(p_year, p_month)

**Açıklama**: Belirli bir ay için tüm çalışanların yoklama raporu

**Parametreler**:
- p_year (INTEGER): Yıl (örn. 2025)
- p_month (INTEGER): Ay (1-12 arası)

**Dönen Kolonlar**:
- employee_id: Çalışan ID
- employee_name: Çalışan adı
- emp_position: Çalışanın pozisyonu
- total_days: Toplam kayıtlı gün
- present_days: Geldiği gün sayısı
- absent_days: Gelmediği gün sayısı
- sick_leave_days: İzinli gün sayısı
- excused_days: Mazeretli gün sayısı
- total_worked_hours: Toplam çalışma saati
- total_overtime_hours: Toplam fazla mesai
- attendance_rate: Devam oranı (%)

**Kullanım Örneği**:
```sql
-- 2025 Aralık ayı raporu
SELECT * FROM sp_monthly_attendance_report(2025, 12);

-- Devam oranı düşük çalışanları bul
SELECT employee_name, emp_position, present_days, absent_days, attendance_rate
FROM sp_monthly_attendance_report(2025, 12)
WHERE attendance_rate < 80;
```

---

### 2. sp_budget_alert_projects(p_threshold_percentage)

**Açıklama**: Bütçe kullanımı belirli eşiği aşan projeleri listeler

**Parametreler**:
- p_threshold_percentage (NUMERIC): Eşik yüzdesi (varsayılan 80)

**Dönen Kolonlar**:
- project_id: Proje ID
- project_name: Proje adı
- budget: Bütçe
- total_expenses: Toplam harcama
- remaining_budget: Kalan bütçe
- usage_percentage: Kullanım yüzdesi
- alert_level: Uyarı seviyesi (DÜŞÜK/ORTA/YÜKSEK/KRİTİK)

**Kullanım Örneği**:
```sql
-- Varsayılan %80 eşik ile
SELECT * FROM sp_budget_alert_projects();

-- Özel eşik: %70'i aşan projeler
SELECT * FROM sp_budget_alert_projects(70);

-- Sadece kritik projeleri göster
SELECT project_name, budget, total_expenses, alert_level
FROM sp_budget_alert_projects(80)
WHERE alert_level IN ('KRİTİK', 'YÜKSEK');
```

---

## SONUÇ

Bu projede 2 adet **VIEW** ve 2 adet **STORED PROCEDURE** oluşturulmuştur:

**VIEW'ler**:
1. `vw_employee_project_performance` - Çalışan performans analizi
2. `vw_project_cost_summary` - Proje maliyet özeti

**Stored Procedure'ler**:
1. `sp_monthly_attendance_report(yıl, ay)` - Aylık yoklama raporu
2. `sp_budget_alert_projects(eşik)` - Bütçe uyarı raporu

**Dosya Konumları**:
- Schema: `database/schema.sql` (satır 450+)
- Örnekler: `database/view-and-procedure-examples.sql`
- Test: `backend/test-views-only.js`
- **Backend API**: `backend/routes-raw/reports.js` (satır 366+)
- **Frontend**: `src/pages/Reports.jsx` - Raporlar sayfası

---

## ARAYÜZ KULLANIMI

VIEW ve STORED PROCEDURE'ler **Raporlar** sayfasında kullanılır:

### Nasıl Erişilir?
1. Uygulamayı çalıştırın: `npm run dev` (frontend) ve `.\baslat.bat` (backend)
2. Tarayıcıda: http://localhost:5173
3. Sol menüden **"Raporlar"** sayfasına tıklayın
4. Rapor listesinden yeşil arka planlı olanları seçin:
   - 📊 VIEW: Çalışan Performans Raporu
   - 📊 VIEW: Proje Maliyet Analizi  
   - ⚙️ PROCEDURE: Aralık 2025 Yoklama
   - ⚙️ PROCEDURE: Bütçe Uyarı Raporu

### API Endpoint'leri
```javascript
// VIEW'ler
GET /api/reports/employee-performance
GET /api/reports/project-cost-analysis

// STORED PROCEDURE'ler
GET /api/reports/monthly-attendance/:year/:month
GET /api/reports/budget-alerts?threshold=80
```

### Örnek Kullanım
```bash
# Çalışan performans raporu
curl http://localhost:5000/api/reports/employee-performance

# Aralık 2025 yoklama raporu
curl http://localhost:5000/api/reports/monthly-attendance/2025/12

# Bütçe uyarıları (%70 eşik)
curl http://localhost:5000/api/reports/budget-alerts?threshold=70
```
