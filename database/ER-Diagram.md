# İNŞAAT YÖNETİM SİSTEMİ - ER (Entity Relationship) DİYAGRAMI

## 📊 VERİTABANI MİMARİSİ VE İLİŞKİLER

Bu belge, İnşaat Yönetim Sistemi'nin veritabanı tablolarını ve aralarındaki ilişkileri detaylı olarak açıklamaktadır.

---

## 🗂️ TABLOLAR VE ALAN DETAYLARI

### 1. **Users** (Kullanıcılar)
**Amaç:** Sisteme giriş yapan kullanıcıları saklar

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Kullanıcı adı |
| email | VARCHAR(255) | Email (UNIQUE) |
| password | VARCHAR(255) | Hashlenmiş şifre |
| role | VARCHAR(50) | Kullanıcı rolü (admin, manager) |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **1:N** → Projects (Bir kullanıcının birden çok projesi olabilir)
- **1:N** → Employees (Bir kullanıcının birden çok çalışanı olabilir)
- **1:N** → Roles (Bir kullanıcının birden çok rol tanımı olabilir)
- **1:N** → Documents (Bir kullanıcı birden çok döküman yükleyebilir)
- **1:N** → AuditLogs (Bir kullanıcının birden çok işlem kaydı olabilir)

---

### 2. **Projects** (Projeler)
**Amaç:** İnşaat projelerini yönetir

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Proje adı |
| city | VARCHAR(100) | Şehir |
| district | VARCHAR(100) | İlçe |
| address | TEXT | Detaylı adres |
| budget | DECIMAL(15,2) | Proje bütçesi |
| status | VARCHAR(50) | Durum (Planlama, Devam Ediyor, Tamamlandı) |
| start_date | DATE | Başlangıç tarihi |
| end_date | DATE | Bitiş tarihi |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her proje bir kullanıcıya ait)
- **1:N** → Employees (Bir projede birden çok çalışan olabilir)
- **1:N** → Attendances (Bir projenin birden çok yoklama kaydı olabilir)
- **1:N** → Expenses (Bir projenin birden çok harcaması olabilir)
- **1:N** → Documents (Bir projenin birden çok dökümanı olabilir)
- **N:M** → Materials (ProjectMaterial üzerinden Many-to-Many)
- **N:M** → Equipment (ProjectEquipment üzerinden Many-to-Many)

---

### 3. **Roles** (İş Pozisyonları/Meslekler)
**Amaç:** Çalışan pozisyonlarını tanımlar

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(100) | Pozisyon adı (UNIQUE) |
| default_daily_rate | DECIMAL(10,2) | Varsayılan günlük ücret |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her rol bir kullanıcıya ait)
- **1:N** → Employees (Bir rolde birden çok çalışan olabilir)

---

### 4. **Employees** (Çalışanlar)
**Amaç:** Şantiye çalışanlarını yönetir

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| first_name | VARCHAR(100) | Ad |
| last_name | VARCHAR(100) | Soyad |
| email | VARCHAR(255) | Email |
| phone | VARCHAR(20) | Telefon |
| address | TEXT | Adres |
| hire_date | DATE | İşe başlama tarihi |
| daily_rate | DECIMAL(10,2) | Günlük ücret |
| status | VARCHAR(50) | Durum (aktif, pasif) |
| isActive | BOOLEAN | Aktiflik durumu |
| RoleId | INTEGER | Foreign Key → Roles |
| ProjectId | INTEGER | Foreign Key → Projects |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her çalışan bir kullanıcıya ait)
- **N:1** → Roles (Her çalışanın bir rolü var)
- **N:1** → Projects (Her çalışan bir projeye atanabilir)
- **1:N** → Attendances (Bir çalışanın birden çok yoklama kaydı olabilir)

---

### 5. **Attendances** (Yoklama Kayıtları)
**Amaç:** Günlük çalışan devam kayıtlarını tutar

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| EmployeeId | INTEGER | Foreign Key → Employees |
| ProjectId | INTEGER | Foreign Key → Projects |
| date | DATE | Yoklama tarihi |
| status | ENUM | Durum (Geldi, Gelmedi, İzinli, Raporlu) |
| worked_hours | DECIMAL(5,2) | Çalışılan saat |
| overtime_hours | DECIMAL(5,2) | Mesai saati |
| notes | TEXT | Notlar |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**Constraint:** UNIQUE (EmployeeId, ProjectId, date) - Aynı çalışan aynı projede aynı gün tekrar yoklama alamaz

**İlişkiler:**
- **N:1** → Employees (Her yoklama bir çalışana ait)
- **N:1** → Projects (Her yoklama bir projeye ait)
- **N:1** → Users (Her yoklama bir kullanıcı tarafından oluşturulur)

---

### 6. **Suppliers** (Tedarikçiler)
**Amaç:** Malzeme ve ekipman tedarikçilerini yönetir

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Tedarikçi adı |
| contact_person | VARCHAR(100) | Yetkili kişi |
| phone | VARCHAR(20) | Telefon |
| email | VARCHAR(255) | Email |
| address | TEXT | Adres |
| tax_number | VARCHAR(50) | Vergi numarası |
| payment_terms | VARCHAR(255) | Ödeme koşulları |
| rating | INTEGER | Değerlendirme (1-5) |
| isActive | BOOLEAN | Aktiflik durumu |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her tedarikçi bir kullanıcıya ait)
- **1:N** → Materials (Bir tedarikçinin birden çok malzemesi olabilir)

---

### 7. **MaterialCategories** (Malzeme Kategorileri)
**Amaç:** Malzemeleri kategorize eder

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(100) | Kategori adı (UNIQUE) |
| description | TEXT | Açıklama |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her kategori bir kullanıcıya ait)
- **1:N** → Materials (Bir kategoride birden çok malzeme olabilir)

---

### 8. **Materials** (Malzemeler)
**Amaç:** İnşaat malzemelerini ve stok takibini yapar

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Malzeme adı |
| MaterialCategoryId | INTEGER | Foreign Key → MaterialCategories |
| unit | VARCHAR(50) | Birim (kg, ton, m³, adet) |
| unit_price | DECIMAL(10,2) | Birim fiyat |
| stock_quantity | DECIMAL(10,2) | Mevcut stok |
| minimum_stock | DECIMAL(10,2) | Minimum stok seviyesi |
| SupplierId | INTEGER | Foreign Key → Suppliers |
| description | TEXT | Açıklama |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her malzeme bir kullanıcıya ait)
- **N:1** → MaterialCategories (Her malzeme bir kategoriye ait)
- **N:1** → Suppliers (Her malzemenin bir tedarikçisi olabilir)
- **N:M** → Projects (ProjectMaterial üzerinden Many-to-Many)

---

### 9. **EquipmentTypes** (Ekipman Türleri)
**Amaç:** Ekipmanları kategorize eder

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(100) | Tür adı (UNIQUE) |
| description | TEXT | Açıklama |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her tür bir kullanıcıya ait)
- **1:N** → Equipment (Bir türde birden çok ekipman olabilir)

---

### 10. **Equipment** (Ekipmanlar)
**Amaç:** İnşaat ekipmanlarını ve bakım takibini yapar

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Ekipman adı |
| EquipmentTypeId | INTEGER | Foreign Key → EquipmentTypes |
| serial_number | VARCHAR(100) | Seri numarası (UNIQUE) |
| purchase_date | DATE | Satın alma tarihi |
| purchase_price | DECIMAL(10,2) | Satın alma fiyatı |
| daily_rental_cost | DECIMAL(10,2) | Günlük kiralama maliyeti |
| condition | ENUM | Durum (Mükemmel, İyi, Orta, Kötü, Bakımda) |
| last_maintenance_date | DATE | Son bakım tarihi |
| next_maintenance_date | DATE | Sonraki bakım tarihi |
| location | VARCHAR(255) | Konum |
| isAvailable | BOOLEAN | Müsaitlik durumu |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her ekipman bir kullanıcıya ait)
- **N:1** → EquipmentTypes (Her ekipman bir türe ait)
- **N:M** → Projects (ProjectEquipment üzerinden Many-to-Many)

---

### 11. **ProjectMaterial** (Proje-Malzeme İlişkisi)
**Amaç:** Projelerde kullanılan malzemeleri takip eder (Many-to-Many Junction Table)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| ProjectId | INTEGER | Foreign Key → Projects |
| MaterialId | INTEGER | Foreign Key → Materials |
| quantity_used | DECIMAL(10,2) | Kullanılan miktar |
| unit_price_at_time | DECIMAL(10,2) | O anki birim fiyat |
| date_used | DATE | Kullanım tarihi |
| notes | TEXT | Notlar |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Projects (Her kayıt bir projeye ait)
- **N:1** → Materials (Her kayıt bir malzemeye ait)

---

### 12. **ProjectEquipment** (Proje-Ekipman İlişkisi)
**Amaç:** Projelerde kullanılan ekipmanları takip eder (Many-to-Many Junction Table)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| ProjectId | INTEGER | Foreign Key → Projects |
| EquipmentId | INTEGER | Foreign Key → Equipment |
| start_date | DATE | Başlangıç tarihi |
| end_date | DATE | Bitiş tarihi |
| daily_cost | DECIMAL(10,2) | Günlük maliyet |
| total_days | INTEGER | Toplam gün |
| notes | TEXT | Notlar |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Projects (Her kayıt bir projeye ait)
- **N:1** → Equipment (Her kayıt bir ekipmana ait)

---

### 13. **Expenses** (Harcamalar)
**Amaç:** Proje harcamalarını ve genel giderleri yönetir

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| ProjectId | INTEGER | Foreign Key → Projects (opsiyonel) |
| category | VARCHAR(100) | Kategori (Maaş, Malzeme, Ekipman, vb.) |
| description | TEXT | Açıklama |
| amount | DECIMAL(10,2) | Tutar |
| expense_date | DATE | Harcama tarihi |
| payment_method | VARCHAR(50) | Ödeme yöntemi |
| receipt_number | VARCHAR(100) | Fiş/Fatura numarası |
| paid_to | VARCHAR(255) | Kime ödendi |
| approved_by | VARCHAR(100) | Kim onayladı |
| status | ENUM | Durum (Beklemede, Onaylandı, Ödendi, İptal) |
| userId | INTEGER | Foreign Key → Users |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Users (Her harcama bir kullanıcıya ait)
- **N:1** → Projects (Her harcama bir projeye ait olabilir)

---

### 14. **Documents** (Dökümanlar)
**Amaç:** Proje dökümanlarını yönetir

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| ProjectId | INTEGER | Foreign Key → Projects (opsiyonel) |
| title | VARCHAR(255) | Başlık |
| type | VARCHAR(100) | Tip (Sözleşme, Ruhsat, Plan, vb.) |
| file_path | VARCHAR(500) | Dosya yolu |
| file_name | VARCHAR(255) | Dosya adı |
| file_size | INTEGER | Dosya boyutu (bytes) |
| upload_date | TIMESTAMP | Yüklenme tarihi |
| expiry_date | DATE | Geçerlilik sonu |
| description | TEXT | Açıklama |
| uploaded_by | INTEGER | Foreign Key → Users |
| version | VARCHAR(20) | Versiyon |
| status | ENUM | Durum (Aktif, Arşiv, Süresi Dolmuş) |
| createdAt | TIMESTAMP | Oluşturulma zamanı |
| updatedAt | TIMESTAMP | Güncellenme zamanı |

**İlişkiler:**
- **N:1** → Projects (Her döküman bir projeye ait olabilir)
- **N:1** → Users (Her dökümanı bir kullanıcı yükler)

---

### 15. **AuditLogs** (Sistem Logları)
**Amaç:** Sistem işlemlerini ve kullanıcı aktivitelerini kaydeder

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| userId | INTEGER | Foreign Key → Users |
| userName | VARCHAR(255) | Kullanıcı adı |
| action | ENUM | İşlem (CREATE, UPDATE, DELETE, LOGIN, LOGOUT) |
| tableName | VARCHAR(100) | Tablo adı |
| recordId | INTEGER | Kayıt ID |
| changes | TEXT | Değişiklik detayları |
| ipAddress | VARCHAR(50) | IP adresi |
| userAgent | TEXT | User Agent |
| timestamp | TIMESTAMP | İşlem zamanı |
| createdAt | TIMESTAMP | Oluşturulma zamanı |

**İlişkiler:**
- **N:1** → Users (Her log bir kullanıcıya ait)

---

## 🔗 İLİŞKİ ÖZETİ

### One-to-Many (1:N) İlişkiler:
1. **Users → Projects** (1 kullanıcı, N proje)
2. **Users → Employees** (1 kullanıcı, N çalışan)
3. **Users → Roles** (1 kullanıcı, N rol)
4. **Users → Documents** (1 kullanıcı, N döküman)
5. **Users → AuditLogs** (1 kullanıcı, N log)
6. **Projects → Employees** (1 proje, N çalışan)
7. **Projects → Attendances** (1 proje, N yoklama)
8. **Projects → Expenses** (1 proje, N harcama)
9. **Projects → Documents** (1 proje, N döküman)
10. **Roles → Employees** (1 rol, N çalışan)
11. **Employees → Attendances** (1 çalışan, N yoklama)
12. **Suppliers → Materials** (1 tedarikçi, N malzeme)
13. **MaterialCategories → Materials** (1 kategori, N malzeme)
14. **EquipmentTypes → Equipment** (1 tür, N ekipman)

### Many-to-Many (N:M) İlişkiler:
1. **Projects ↔ Materials** (ProjectMaterial junction table üzerinden)
2. **Projects ↔ Equipment** (ProjectEquipment junction table üzerinden)

---

## 📈 GÖRSEL SUNUM

### Basitleştirilmiş ER Diyagramı (Metin Formatı):

```
                                    ┌──────────┐
                                    │  Users   │
                                    └────┬─────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ↓                    ↓                    ↓
              ┌──────────┐         ┌──────────┐        ┌──────────┐
              │ Projects │         │Employees │        │  Roles   │
              └────┬─────┘         └────┬─────┘        └────┬─────┘
                   │                    │                    │
        ┌──────────┼──────────┐         │                    │
        │          │          │         │                    │
        ↓          ↓          ↓         ↓                    ↓
   ┌────────┐ ┌────────┐ ┌──────────┐  └───────────────────┘
   │Expenses│ │Documents│ │Attendance│
   └────────┘ └────────┘ └──────────┘

   ┌──────────┐          ┌─────────────┐         ┌──────────┐
   │Suppliers │──────────│ Materials   │─────────│MaterialCat│
   └──────────┘          └──────┬──────┘         └──────────┘
                                │
                                │ (Many-to-Many)
                                │
                         ┌──────┴───────┐
                         │ProjectMaterial│
                         └──────────────┘

   ┌──────────┐          ┌─────────────┐         ┌──────────┐
   │EquipType │──────────│ Equipment   │         │ Projects │
   └──────────┘          └──────┬──────┘         └──────────┘
                                │
                                │ (Many-to-Many)
                                │
                         ┌──────┴────────┐
                         │ProjectEquipment│
                         └───────────────┘
```

### Kardinalite Gösterimi:
- **1** ────── **N** : One-to-Many (Bir-Çok)
- **N** ────── **M** : Many-to-Many (Çok-Çok)

---

## 🎯 ÖZEL KISITLAMALAR (CONSTRAINTS)

1. **UNIQUE Constraints:**
   - Users.email
   - Roles.name
   - MaterialCategories.name
   - EquipmentTypes.name
   - Equipment.serial_number
   - Attendances (EmployeeId, ProjectId, date) - Composite Unique

2. **CHECK Constraints:**
   - Attendances.worked_hours: 0-24 arası
   - Attendances.overtime_hours: 0-24 arası
   - Suppliers.rating: 1-5 arası
   - Materials.stock_quantity: >= 0
   - Expenses.amount: >= 0

3. **ENUM Constraints:**
   - Attendances.status: {'Geldi', 'Gelmedi', 'İzinli', 'Raporlu'}
   - Equipment.condition: {'Mükemmel', 'İyi', 'Orta', 'Kötü', 'Bakımda'}
   - Expenses.status: {'Beklemede', 'Onaylandı', 'Ödendi', 'İptal'}
   - Documents.status: {'Aktif', 'Arşiv', 'Süresi Dolmuş'}
   - AuditLogs.action: {'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'}

---

## 📊 İNDEXLER

Her tabloda performans optimizasyonu için indexler oluşturulmuştur:

- Primary Key indexleri (otomatik)
- Foreign Key indexleri
- Sık sorgulanan alanlar için indexler (status, date, name, vb.)
- Composite indexler (birden fazla alan kombinasyonu)

**Örnek:**
```sql
CREATE INDEX idx_projects_status ON Projects(status);
CREATE INDEX idx_employees_name ON Employees(first_name, last_name);
CREATE UNIQUE INDEX idx_attendance_unique ON Attendances(EmployeeId, ProjectId, date);
```

---

## 🔐 REFERANS BÜTÜNLÜĞÜ

Tüm Foreign Key'ler için CASCADE ve SET NULL kuralları tanımlanmıştır:

- **ON DELETE CASCADE:** Ana kayıt silindiğinde bağlı kayıtlar da silinir
  - Users → Projects, Employees, Roles
  - Projects → Attendances, Expenses, Documents
  
- **ON DELETE SET NULL:** Ana kayıt silindiğinde bağlı alanlar NULL olur
  - Roles → Employees
  - Suppliers → Materials

---

**Belge Tarihi:** 17 Aralık 2025  
**Veritabanı:** PostgreSQL 13+  
**Toplam Tablo Sayısı:** 15  
**Toplam İlişki Sayısı:** 16 (1:N) + 2 (N:M) = 18
