# İNŞAAT YÖNETİM SİSTEMİ - NORMALİZASYON SÜRECİ

## 📚 VERİTABANI NORMALİZASYON ANALİZİ

Bu belge, İnşaat Yönetim Sistemi veritabanının normalizasyon sürecini ve her tablonun hangi normal forma (NF) uyduğunu detaylı olarak açıklamaktadır.

---

## 🎯 NORMALİZASYON NEDİR?

Normalizasyon, veritabanı tasarımında veri tekrarını (redundancy) azaltmak ve veri bütünlüğünü (integrity) sağlamak için tabloları düzenleme sürecidir.

### Normal Form Seviyeleri:
1. **1NF (First Normal Form):** Atomik değerler, tekrarlayan gruplar yok
2. **2NF (Second Normal Form):** 1NF + Kısmi bağımlılık yok
3. **3NF (Third Normal Form):** 2NF + Geçişli bağımlılık yok
4. **BCNF (Boyce-Codd Normal Form):** 3NF + Her belirleyici aday anahtardır

---

## 📊 TABLOLARIN NORMALİZASYON ANALİZİ

### 1. **Users Tablosu**

**Mevcut Yapı:**
```
Users (id, name, email, password, role, createdAt, updatedAt)
Primary Key: id
```

**Normal Form Analizi:**

✅ **1NF:** 
- Tüm alanlar atomiktir (bölünemez)
- Tekrarlayan gruplar yok
- Her satır benzersiz (Primary Key: id)

✅ **2NF:**
- Primary Key tek alandan oluşuyor (id)
- Kısmi bağımlılık olmaz (composite key yok)
- Tüm alanlar tamamen id'ye bağımlı

✅ **3NF:**
- Geçişli bağımlılık yok
- name, email, password, role doğrudan id'ye bağımlı
- Başka bir non-key attribute üzerinden bağımlılık yok

✅ **BCNF:**
- Her belirleyici (id) aday anahtardır
- email UNIQUE olduğu için alternatif aday anahtar
- Anomali yok

**Sonuç:** Users tablosu **BCNF** standardındadır.

---

### 2. **Projects Tablosu**

**Mevcut Yapı:**
```
Projects (id, name, city, district, address, budget, status, start_date, end_date, userId)
Primary Key: id
Foreign Key: userId → Users(id)
```

**Normal Form Analizi:**

✅ **1NF:**
- Tüm alanlar atomik
- Tekrarlayan gruplar yok (city, district ayrı alanlar)

✅ **2NF:**
- Tek alan primary key (id)
- Kısmi bağımlılık yok

✅ **3NF:**
- Geçişli bağımlılık kontrolü:
  - city, district ayrı tutulmuş (şehir → ilçe bağımlılığı kırılmış)
  - userId doğrudan Projects'e bağlı

✅ **BCNF:**
- Her belirleyici aday anahtar
- Anomali yok

**Normalizasyon Kararı:**
- Şehir ve ilçe bilgileri ayrı tabloya alınabilirdi (Locations tablosu)
- Ancak performans ve basitlik için denormalize bırakıldı
- Bu bir **bilinçli tasarım kararıdır**

**Sonuç:** Projects tablosu **BCNF** standardındadır.

---

### 3. **Roles Tablosu**

**Mevcut Yapı:**
```
Roles (id, name, default_daily_rate, userId)
Primary Key: id
Unique: name
Foreign Key: userId → Users(id)
```

**Normal Form Analizi:**

✅ **1NF:** Atomik değerler

✅ **2NF:** Tek alan PK, kısmi bağımlılık yok

✅ **3NF:** 
- name ve default_daily_rate doğrudan id'ye bağlı
- Geçişli bağımlılık yok

✅ **BCNF:**
- id ve name her ikisi de aday anahtar
- Anomali yok

**Sonuç:** Roles tablosu **BCNF** standardındadır.

---

### 4. **Employees Tablosu**

**Başlangıç Yapısı (Normalizasyon Öncesi):**
```
Employees_Initial (id, first_name, last_name, email, phone, address, 
                   hire_date, daily_rate, status, role_name, role_daily_rate,
                   project_name, project_city, userId)
```

**Sorunlar:**
- Rol bilgileri (role_name, role_daily_rate) tekrar ediyor → 2NF ihlali
- Proje bilgileri (project_name, project_city) tekrar ediyor → 2NF ihlali

**1. Adım: 2NF'ye Çıkarma**
- Rol bilgilerini ayrı tabloya al → **Roles** tablosu oluşturuldu
- Proje bilgilerini ayrı tabloya al → **Projects** tablosu oluşturuldu

**2. Adım: Foreign Key İlişkileri**
```
Employees (id, first_name, last_name, email, phone, address, 
           hire_date, daily_rate, status, isActive, 
           RoleId, ProjectId, userId)
Primary Key: id
Foreign Keys: 
  - RoleId → Roles(id)
  - ProjectId → Projects(id)
  - userId → Users(id)
```

**Normal Form Analizi:**

✅ **1NF:** Atomik değerler

✅ **2NF:** 
- Kısmi bağımlılık yok
- Rol ve proje bilgileri foreign key ile referans ediliyor

✅ **3NF:**
- Geçişli bağımlılık yok
- daily_rate çalışana özel (rol ücreti Roles tablosunda)

✅ **BCNF:**
- Anomali yok

**Sonuç:** Employees tablosu **BCNF** standardındadır.

**Normalizasyon Kazanımları:**
- Rol bilgisi değiştiğinde tek yerden güncellenebilir
- Proje bilgisi değiştiğinde tek yerden güncellenebilir
- Veri tekrarı minimize edildi

---

### 5. **Attendances Tablosu**

**Mevcut Yapı:**
```
Attendances (id, EmployeeId, ProjectId, date, status, 
             worked_hours, overtime_hours, notes, userId)
Primary Key: id
Unique Constraint: (EmployeeId, ProjectId, date)
Foreign Keys: EmployeeId → Employees(id)
              ProjectId → Projects(id)
              userId → Users(id)
```

**Normal Form Analizi:**

✅ **1NF:** Atomik değerler

✅ **2NF:**
- Composite unique constraint var ama primary key tek alan (id)
- Functional dependency: (EmployeeId, ProjectId, date) → (status, worked_hours, overtime_hours)
- Kısmi bağımlılık yok

✅ **3NF:**
- Tüm non-key attributelar direkt olarak primary key'e bağımlı
- Geçişli bağımlılık yok

✅ **BCNF:**
- (EmployeeId, ProjectId, date) bir aday anahtar (unique constraint)
- id de bir aday anahtar (primary key)
- Her ikisi de belirleyici
- Anomali yok

**Sonuç:** Attendances tablosu **BCNF** standardındadır.

---

### 6. **Materials Tablosu**

**Başlangıç Yapısı (Normalizasyon Öncesi):**
```
Materials_Initial (id, name, category_name, unit, unit_price, stock_quantity,
                   minimum_stock, supplier_name, supplier_phone, userId)
```

**Sorunlar:**
- Kategori bilgileri (category_name) tekrar ediyor → 2NF ihlali
- Tedarikçi bilgileri (supplier_name, supplier_phone) tekrar ediyor → 2NF ihlali

**Normalizasyon Adımları:**

**1. Adım:** Kategorileri ayır
```
MaterialCategories (id, name, description, userId)
```

**2. Adım:** Tedarikçileri ayır
```
Suppliers (id, name, contact_person, phone, email, address, tax_number, 
           payment_terms, rating, isActive, userId)
```

**3. Adım:** Materials tablosunu düzenle
```
Materials (id, name, MaterialCategoryId, unit, unit_price, 
           stock_quantity, minimum_stock, SupplierId, description, userId)
Foreign Keys:
  - MaterialCategoryId → MaterialCategories(id)
  - SupplierId → Suppliers(id)
```

**Normal Form Analizi:**

✅ **1NF:** Atomik değerler

✅ **2NF:** 
- Kategori ve tedarikçi bilgileri ayrı tablolarda
- Kısmi bağımlılık yok

✅ **3NF:**
- Geçişli bağımlılık yok
- Her attribute doğrudan id'ye bağlı

✅ **BCNF:**
- Anomali yok

**Sonuç:** Materials tablosu **BCNF** standardındadır.

**Normalizasyon Kazanımları:**
- Bir kategori adı değiştiğinde tek yerden güncellenir
- Bir tedarikçi bilgisi değiştiğinde tek yerden güncellenir
- Aynı tedarikçiden alınan malzemeler için bilgi tekrarı yok

---

### 7. **Equipment Tablosu**

**Normalizasyon:** Materials tablosu ile benzer süreç

**Başlangıç:**
```
Equipment_Initial (id, name, equipment_type_name, serial_number, ...)
```

**Sorun:** Ekipman türü bilgileri tekrar ediyor

**Çözüm:**
```
EquipmentTypes (id, name, description, userId)
Equipment (id, name, EquipmentTypeId, serial_number, ...)
```

**Sonuç:** Equipment tablosu **BCNF** standardındadır.

---

### 8. **ProjectMaterial Tablosu (Many-to-Many Junction Table)**

**Başlangıç Yaklaşımı (Normalizasyon Öncesi):**
```
Projects (id, name, ..., materials_used)
// materials_used: "Çimento:10ton, Demir:5ton, Boya:20adet"
```

**Sorunlar:**
- Atomik değil (1NF ihlali)
- Malzeme bazlı sorgu yapılamaz
- Malzeme bilgisi tekrar ediyor

**Normalizasyon Adımları:**

**1. Adım:** Many-to-Many ilişki için junction table
```
ProjectMaterial (id, ProjectId, MaterialId, quantity_used, 
                 unit_price_at_time, date_used, notes)
Primary Key: id
Foreign Keys: 
  - ProjectId → Projects(id)
  - MaterialId → Materials(id)
```

**Normal Form Analizi:**

✅ **1NF:** Her alan atomik

✅ **2NF:**
- quantity_used, unit_price_at_time, date_used hepsi (ProjectId, MaterialId) composite key'ine bağlı
- Kısmi bağımlılık yok

✅ **3NF:**
- Geçişli bağımlılık yok
- unit_price_at_time: O anki fiyatı saklamak için (historical data)

✅ **BCNF:**
- (ProjectId, MaterialId, date_used) aday anahtar olabilir
- id de aday anahtar
- Anomali yok

**Sonuç:** ProjectMaterial tablosu **BCNF** standardındadır.

**Normalizasyon Kazanımları:**
- Bir proje birden fazla malzeme kullanabilir
- Bir malzeme birden fazla projede kullanılabilir
- Her kullanım kaydı ayrı tutulur (historical tracking)
- Fiyat değişimlerini takip edebilir (unit_price_at_time)

---

### 9. **ProjectEquipment Tablosu**

**Normalizasyon:** ProjectMaterial ile benzer mantık

**Sonuç:** ProjectEquipment tablosu **BCNF** standardındadır.

---

### 10. **Expenses Tablosu**

**Mevcut Yapı:**
```
Expenses (id, ProjectId, category, description, amount, expense_date,
          payment_method, receipt_number, paid_to, approved_by, status, userId)
```

**Normal Form Analizi:**

✅ **1NF:** Atomik değerler

✅ **2NF:** Kısmi bağımlılık yok

✅ **3NF:**
- category: ENUM veya VARCHAR (kategoriler ayrı tablo olabilir ama çok dinamik olduğu için VARCHAR tercih edildi)
- Geçişli bağımlılık yok

✅ **BCNF:**
- Anomali yok

**Tasarım Kararı:**
- `category` ayrı tabloya alınabilirdi (ExpenseCategories)
- Ancak kategoriler çok sık değişiyor ve projeden projeye farklılık gösteriyor
- Esneklik için VARCHAR olarak bırakıldı
- Bu bir **bilinçli denormalizasyon** örneğidir

**Sonuç:** Expenses tablosu **BCNF** standardındadır (bilinçli denormalizasyon ile).

---

### 11. **Documents Tablosu**

**Mevcut Yapı:**
```
Documents (id, ProjectId, title, type, file_path, file_name, file_size,
           upload_date, expiry_date, description, uploaded_by, version, status)
```

**Normal Form Analizi:**

✅ **1NF, 2NF, 3NF, BCNF:** Tüm standartları karşılıyor

**Tasarım Kararı:**
- `type` ayrı tabloya alınabilirdi ama dinamik olduğu için VARCHAR
- `uploaded_by` → Users foreign key ile referans (normalizasyon)

**Sonuç:** Documents tablosu **BCNF** standardındadır.

---

### 12. **AuditLogs Tablosu**

**Mevcut Yapı:**
```
AuditLogs (id, userId, userName, action, tableName, recordId, 
           changes, ipAddress, userAgent, timestamp)
```

**Özel Durum: Denormalizasyon**
- `userName` alanı normalde gereksiz (userId üzerinden Users.name çekilebilir)
- Ancak **audit log** olduğu için kullanıcı adı silinse bile logda kalmalı
- Bu bir **bilinçli denormalizasyon** örneğidir

**Normal Form Analizi:**

✅ **1NF, 2NF:** Karşılıyor

⚠️ **3NF:** 
- userName, userId üzerinden Users.name'e geçişli bağımlı
- ANCAK bu kasıtlı yapılmış (audit trail için)

**Sonuç:** AuditLogs tablosu **2NF** standardındadır (kasıtlı olarak).

**Denormalizasyon Nedeni:**
- Audit log değişmemeli (immutable)
- Kullanıcı silinse bile log kaydı kalmalı
- Historical accuracy için gerekli

---

## 📈 NORMALİZASYON SÜRECİ ÖZETİ

### ÖNCE (Normalizasyon Öncesi):

**Tek Tablo Yaklaşımı:**
```
ConstructionProjects (
  project_id, project_name, project_city, project_district,
  employee_name, employee_role, employee_daily_rate,
  material_name, material_quantity, supplier_name, supplier_phone,
  equipment_name, equipment_type, expense_amount, expense_category
)
```

**Sorunlar:**
- Aşırı veri tekrarı (redundancy)
- Güncelleme anomalisi (bir bilgi 100 yerde değişmeli)
- Silme anomalisi (çalışan silinince proje bilgisi de gidebilir)
- Ekleme anomalisi (proje olmadan çalışan eklenemez)

---

### SONRA (Normalizasyon Sonrası):

**15 Tablo:**
1. Users
2. Projects
3. Roles
4. Employees
5. Attendances
6. Suppliers
7. MaterialCategories
8. Materials
9. EquipmentTypes
10. Equipment
11. ProjectMaterial (junction)
12. ProjectEquipment (junction)
13. Expenses
14. Documents
15. AuditLogs

**Kazanımlar:**
✅ Veri tekrarı minimize edildi
✅ Güncelleme anomalisi çözüldü
✅ Silme anomalisi çözüldü
✅ Ekleme anomalisi çözüldü
✅ Veri bütünlüğü sağlandı
✅ Performans optimize edildi (indexler ile)

---

## 🎯 NORMAL FORM DAĞILIMI

| Tablo | 1NF | 2NF | 3NF | BCNF | Açıklama |
|-------|-----|-----|-----|------|----------|
| Users | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| Projects | ✅ | ✅ | ✅ | ✅ | Bilinçli denormalizasyon (city/district) |
| Roles | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| Employees | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| Attendances | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| Suppliers | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| MaterialCategories | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| Materials | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| EquipmentTypes | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| Equipment | ✅ | ✅ | ✅ | ✅ | Tam normalizasyon |
| ProjectMaterial | ✅ | ✅ | ✅ | ✅ | Junction table |
| ProjectEquipment | ✅ | ✅ | ✅ | ✅ | Junction table |
| Expenses | ✅ | ✅ | ✅ | ✅ | Bilinçli denormalizasyon (category) |
| Documents | ✅ | ✅ | ✅ | ✅ | Bilinçli denormalizasyon (type) |
| AuditLogs | ✅ | ✅ | ⚠️ | ⚠️ | Kasıtlı denormalizasyon (userName) |

**Genel Değerlendirme:**
- 14 tablo **BCNF** standardında
- 1 tablo kasıtlı olarak **2NF** (AuditLogs - historical accuracy için)
- Toplam başarı oranı: **%93 BCNF**

---

## 💡 BİLİNÇLİ DENORMALİZASYON KARARLARI

### 1. Projects.city ve Projects.district
**Neden ayrı tablo yok?**
- Performans: Her sorguda JOIN yapmak yerine direkt erişim
- Basitlik: Şehir-ilçe ilişkisi sabit
- Esneklik: Özgür metin girişi mümkün

**Alternatif:**
```sql
Cities (id, name)
Districts (id, name, city_id)
Projects (..., district_id)
```
**Tercih edilen:** Mevcut yapı (performans vs basitlik)

---

### 2. Expenses.category ve Documents.type
**Neden ENUM yeya ayrı tablo yok?**
- Dinamiklik: Her projede farklı kategoriler olabilir
- Esneklik: Kullanıcı yeni kategori ekleyebilmeli
- Basitlik: Statik liste gereksiz kısıtlama

**Alternatif:**
```sql
ExpenseCategories (id, name, userId)
Expenses (..., category_id)
```
**Tercih edilen:** VARCHAR (esneklik için)

---

### 3. AuditLogs.userName
**Neden userName saklanıyor?**
- Immutability: Audit log değişmemeli
- Historical accuracy: Kullanıcı silinse bile isim kalmalı
- Compliance: Denetim gereklilikleri

**Sonuç:** Bu denormalizasyon **zorunludur**.

---

## 📚 SONUÇ

İnşaat Yönetim Sistemi veritabanı:

✅ **Başarılı normalizasyon:** 14/15 tablo BCNF standardında
✅ **Bilinçli tasarım kararları:** Performans ve esneklik dengelendi
✅ **Veri bütünlüğü:** Foreign key constraints ile sağlandı
✅ **Veri tekrarı:** Minimize edildi
✅ **Sorgu performansı:** Indexler ile optimize edildi
✅ **Bakım kolaylığı:** Modüler yapı
✅ **Ölçeklenebilirlik:** Kolay genişletilebilir

**Final Değerlendirme:** Veritabanı **profesyonel standartlarda** tasarlanmıştır.

---

**Belge Tarihi:** 17 Aralık 2025  
**Hazırlayan:** Dogukan  
**Veritabanı:** PostgreSQL 13+
