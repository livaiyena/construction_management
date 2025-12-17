# İNŞAAT YÖNETİM SİSTEMİ - PROJE AMACI VE KAPSAM

## 🎯 PROJE AMACI

İnşaat Yönetim Sistemi, inşaat şantiyelerinin günlük operasyonlarını dijital ortamda yönetmek, verimliliği artırmak ve maliyet kontrolünü sağlamak amacıyla geliştirilmiş kapsamlı bir web tabanlı yönetim sistemidir.

---

## 📋 PROJENİN TEMEL HEDEFLERİ

### 1. **Dijital Dönüşüm**
- Kağıt bazlı iş süreçlerini dijital ortama taşımak
- Manuel kayıt tutma işlemlerini otomatikleştirmek
- Veri kaybını önlemek ve bilgi güvenliğini sağlamak
- Gerçek zamanlı veri erişimi sunmak

### 2. **Maliyet Yönetimi**
- Proje bütçelerini etkin şekilde takip etmek
- Harcamaları kategorize ederek analiz yapabilmek
- Bütçe aşımlarını önceden tespit edebilmek
- Finansal raporlama süreçlerini hızlandırmak

### 3. **İnsan Kaynakları Yönetimi**
- Çalışan kayıtlarını merkezi bir sistemde tutmak
- Günlük yoklama ve devam takibi yapmak
- Çalışma saatlerini ve mesai sürelerini kaydetmek
- Rol bazlı ücret ve maaş hesaplamaları yapmak

### 4. **Stok ve Envanter Kontrolü**
- Malzeme stoklarını gerçek zamanlı takip etmek
- Minimum stok seviyelerinde uyarı almak
- Tedarikçi performansını değerlendirmek
- Malzeme kullanım geçmişini kaydetmek

### 5. **Ekipman Yönetimi**
- İnşaat ekipmanlarının kullanım durumunu izlemek
- Bakım tarihlerini planlamak ve takip etmek
- Ekipman maliyetlerini hesaplamak
- Ekipman verimliliğini analiz etmek

### 6. **Raporlama ve Analiz**
- Detaylı SQL tabanlı raporlar üretmek
- Proje performansını ölçmek
- Trend analizleri yapmak
- Karar destek sistemleri sağlamak

---

## 🏗️ PROJENİN KAPSAMI

### **A. Kullanıcı Yönetimi Modülü**

**Özellikler:**
- Kullanıcı kaydı ve giriş sistemi
- JWT token tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (admin, manager)
- Kullanıcı profil yönetimi
- Şifre sıfırlama mekanizması

**Veritabanı:**
- Users tablosu
- Şifrelemeli veri saklama
- Email uniqueness kontrolü

---

### **B. Proje Yönetimi Modülü**

**Özellikler:**
- Yeni proje oluşturma (ad, lokasyon, bütçe, tarih)
- Proje durumu takibi (Planlama, Devam Ediyor, Tamamlandı, Askıda)
- Proje bütçesi ve harcama karşılaştırması
- Proje başlangıç ve bitiş tarihleri
- Şehir ve ilçe bazlı filtreleme

**Veritabanı:**
- Projects tablosu
- Foreign key: userId
- Indexler: status, start_date, city

**Kullanım Senaryoları:**
- Şantiye müdürü yeni proje açar
- Proje bilgilerini günceller
- Proje durumunu değiştirir
- Bütçe kullanımını kontrol eder

---

### **C. Çalışan Yönetimi Modülü**

**Özellikler:**
- Çalışan kayıt sistemi (ad, soyad, iletişim bilgileri)
- Rol/pozisyon ataması (Mühendis, Usta, İşçi, vb.)
- Projeye atama mekanizması
- Günlük ücret tanımlama
- Aktif/pasif durum yönetimi

**Veritabanı:**
- Employees tablosu
- Roles tablosu
- Foreign keys: RoleId, ProjectId, userId

**Kullanım Senaryoları:**
- Yeni çalışan kaydı
- Çalışanı projeye atama
- Ücret güncelleme
- Rol değiştirme

---

### **D. Yoklama Sistemi Modülü**

**Özellikler:**
- Günlük çalışan devam kaydı
- Durum seçenekleri: Geldi, Gelmedi, İzinli, Raporlu
- Çalışma saati kaydı (normal + mesai)
- Proje bazlı yoklama
- Tarih bazlı arama ve filtreleme

**Veritabanı:**
- Attendances tablosu
- Unique constraint: (EmployeeId, ProjectId, date)
- CHECK constraints: saat kontrolü (0-24)

**Kullanım Senaryoları:**
- Sabah yoklama alınır
- Mesai saatleri kaydedilir
- İzin bildirimleri yapılır
- Aylık devam raporları alınır

---

### **E. Harcama Yönetimi Modülü**

**Özellikler:**
- Harcama kaydı (kategori, tutar, tarih)
- Kategorizasyon: Maaş, Malzeme, Ekipman, Ulaşım, Yemek, vb.
- Ödeme yöntemi takibi
- Onay süreci (Beklemede, Onaylandı, Ödendi, İptal)
- Fatura/fiş numarası kaydı

**Veritabanı:**
- Expenses tablosu
- Foreign key: ProjectId (opsiyonel - genel giderler için)
- ENUM constraint: status
- CHECK constraint: amount >= 0

**Kullanım Senaryoları:**
- Malzeme alımı kaydedilir
- Maaş ödemesi girilir
- Harcama onaylanır
- Kategori bazlı analiz yapılır

---

### **F. Malzeme Yönetimi Modülü**

**Özellikler:**
- Malzeme kataloğu oluşturma
- Kategorizasyon (Çimento, Demir, Boya, vb.)
- Stok takibi (mevcut, minimum seviye)
- Birim fiyat yönetimi
- Tedarikçi ilişkilendirmesi
- Minimum stok uyarıları

**Veritabanı:**
- Materials tablosu
- MaterialCategories tablosu
- Suppliers tablosu
- Foreign keys: MaterialCategoryId, SupplierId

**Kullanım Senaryoları:**
- Yeni malzeme eklenir
- Stok güncellenir
- Minimum stok uyarısı alınır
- Tedarikçi performansı değerlendirilir

---

### **G. Ekipman Yönetimi Modülü**

**Özellikler:**
- Ekipman envanteri (Vinç, Kazıcı, Matkap, vb.)
- Tür kategorileri
- Seri numarası takibi
- Satın alma ve kiralama bilgileri
- Bakım tarihi yönetimi
- Konum takibi
- Müsaitlik durumu

**Veritabanı:**
- Equipment tablosu
- EquipmentTypes tablosu
- ENUM constraint: condition

**Kullanım Senaryoları:**
- Yeni ekipman kaydı
- Bakım planlaması
- Ekipman projeye atanır
- Bakım geçmişi görüntülenir

---

### **H. Proje-Malzeme İlişki Modülü**

**Özellikler:**
- Projelerde kullanılan malzemelerin kaydı
- Kullanım miktarı takibi
- O anki fiyat kaydı (fiyat değişimi için)
- Tarihsel veri saklama

**Veritabanı:**
- ProjectMaterial junction table
- Foreign keys: ProjectId, MaterialId

**Kullanım Senaryoları:**
- Projede malzeme kullanılır
- Stok otomatik azalır
- Kullanım geçmişi tutulur
- Maliyet hesaplanır

---

### **I. Proje-Ekipman İlişki Modülü**

**Özellikler:**
- Projelerde kullanılan ekipmanların kaydı
- Başlangıç ve bitiş tarihleri
- Günlük maliyet hesabı
- Toplam kullanım günü

**Veritabanı:**
- ProjectEquipment junction table
- Foreign keys: ProjectId, EquipmentId

**Kullanım Senaryoları:**
- Ekipman projeye atanır
- Kullanım süresi kaydedilir
- Maliyet hesaplanır
- Ekipman serbest bırakılır

---

### **J. Döküman Yönetimi Modülü**

**Özellikler:**
- Proje dökümanları yükleme
- Döküman tipleri: Sözleşme, Ruhsat, Plan, Fatura, Rapor
- Versiyon takibi
- Geçerlilik tarihi yönetimi
- Durum yönetimi (Aktif, Arşiv, Süresi Dolmuş)

**Veritabanı:**
- Documents tablosu
- Foreign keys: ProjectId, uploaded_by

**Kullanım Senaryoları:**
- Ruhsat yüklenir
- İmzalı sözleşme kaydedilir
- Geçerlilik tarihi kontrol edilir
- Arşive taşınır

---

### **K. Denetim ve Log Sistemi**

**Özellikler:**
- Tüm sistem işlemlerinin kaydı
- Kullanıcı aktivite takibi
- İşlem türleri: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- IP adresi ve user agent kaydı
- Tarihsel veri koruma

**Veritabanı:**
- AuditLogs tablosu
- Kasıtlı denormalizasyon (userName)

**Kullanım Senaryoları:**
- Sistem işlemleri loglanır
- Kullanıcı girişleri kaydedilir
- Veri değişiklikleri izlenir
- Denetim raporları alınır

---

### **L. Raporlama ve Analiz Modülü**

**Özellikler:**
- 16+ farklı SQL raporu
- Proje bazlı harcama analizi
- Kategori bazlı istatistikler
- Çalışan performans raporları
- Aylık/haftalık trend analizleri
- Stok durum raporları
- Tedarikçi performans analizi

**SQL Sorguları:**
- SELECT, JOIN, LEFT JOIN, INNER JOIN
- GROUP BY, HAVING
- Aggregate functions: COUNT, SUM, AVG, MIN, MAX
- Date functions
- CASE WHEN yapıları
- Subqueries ve complex calculations

---

## 🎨 KULLANICI ARAYÜZLERİ

### **1. Login Sayfası**
- Email ve şifre girişi
- JWT token üretimi
- Hata mesajları

### **2. Dashboard (Kontrol Paneli)**
- Özet istatistikler (kartlar)
- Grafik ve chartlar (PieChart, BarChart, LineChart)
- Aktif proje listesi
- Son işlemler
- Bildirim sistemi

### **3. Projeler Sayfası**
- Proje listesi (tablo)
- Yeni proje ekleme (modal)
- Proje düzenleme
- Proje silme
- Durum filtreleme

### **4. Çalışanlar Sayfası (Team)**
- Çalışan listesi
- Rol bazlı filtreleme
- Yeni çalışan ekleme
- Çalışan düzenleme
- Projeye atama

### **5. Yoklama Sayfası**
- Tarih seçici
- Çalışan listesi
- Durum seçimi (radio buttons)
- Çalışma saati girişi
- Toplu kayıt

### **6. Harcamalar Sayfası**
- Harcama listesi
- Kategori filtreleme
- Yeni harcama ekleme
- Durum güncelleme
- Toplam hesaplama

### **7. Envanter Sayfası**
- Malzeme listesi
- Stok durumu gösterimi
- Uyarı işaretleri (düşük stok)
- Kategori filtreleme

### **8. Ekipman Sayfası**
- Ekipman listesi
- Durum gösterimi
- Bakım tarihleri
- Müsaitlik durumu

### **9. Raporlar Sayfası**
- Rapor seçim menüsü
- Parametreli sorgular
- Tablo görünümü
- Excel export özelliği

### **10. Ayarlar Sayfası**
- Kullanıcı profili
- Sistem ayarları
- Kategori yönetimi
- Rol yönetimi

### **11. Sistem Logları Sayfası**
- Log listesi
- Filtreleme (kullanıcı, işlem türü, tarih)
- Detay görüntüleme

---

## 💻 TEKNİK ALTYAPI

### **Backend Teknolojileri:**
- **Veritabanı:** PostgreSQL 13+ (Neon.tech cloud)
- **Server:** Node.js + Express.js
- **ORM/Query:** Raw SQL (pg kütüphanesi)
- **Kimlik Doğrulama:** JWT (JSON Web Token)
- **Şifreleme:** bcrypt.js
- **CORS:** Cross-Origin Resource Sharing

### **Frontend Teknolojileri:**
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Context API
- **UI Library:** Tailwind CSS
- **İkonlar:** Lucide React
- **Grafikler:** Recharts

### **Veritabanı Mimarisi:**
- **Toplam Tablo:** 15
- **İlişki Türleri:** 1:N, N:M
- **Junction Tables:** 2 (ProjectMaterial, ProjectEquipment)
- **Indexler:** 30+ (performans optimizasyonu)
- **Constraints:** CHECK, UNIQUE, FOREIGN KEY
- **ENUM Types:** 5 (status kontrolü için)

---

## 🎯 HEDEF KİTLE

### **Birincil Kullanıcılar:**
- İnşaat şirketi sahipleri
- Şantiye müdürleri
- Proje yöneticileri
- İnşaat mühendisleri

### **İkincil Kullanıcılar:**
- Muhasebe personeli
- İnsan kaynakları yöneticileri
- Stok sorumluları
- Satın alma birimleri

---

## 📊 BEKLENEN FAYDALAR

### **Operasyonel Faydalar:**
✅ %40 zaman tasarrufu (manuel işler ortadan kalkar)
✅ %30 hata azalması (otomatik validasyon)
✅ Gerçek zamanlı veri erişimi
✅ Mobil uyumlu arayüz

### **Finansal Faydalar:**
✅ Bütçe aşımlarında %25 azalma
✅ Stok maliyetlerinde %15 tasarruf
✅ Ekipman verimliliğinde %20 artış
✅ İdari maliyetlerde %35 düşüş

### **Yönetimsel Faydalar:**
✅ Veri tabanlı karar alma
✅ Trend analizi ve öngörü
✅ Risk yönetimi
✅ Performans ölçümleme

---

## 🚀 GELECEK GELİŞTİRMELER

### **Faz 2 (Planlanan):**
- Mobil uygulama (React Native)
- QR kod ile malzeme takibi
- GPS bazlı yoklama
- WhatsApp/SMS bildirimleri
- Çok dilli destek

### **Faz 3 (Vizyon):**
- Yapay zeka destekli maliyet tahmini
- IoT sensör entegrasyonu
- Drone görüntü analizi
- Blockchain tabanlı sözleşme yönetimi

---

## 📈 BAŞARI KRİTERLERİ

✅ Tüm CRUD işlemlerinin başarıyla çalışması
✅ SQL sorgularının 2 saniyeden kısa sürede sonuç vermesi
✅ 1000+ kayıtla sorunsuz çalışma
✅ %99.9 uptime (kesintisiz çalışma)
✅ Kullanıcı memnuniyeti skoru >4/5

---

## 🎓 EĞİTİM AÇISINDAN ÖNEME

Bu proje, veritabanı yönetim sistemleri (VTYS) dersinde öğrenilen teorik bilgilerin pratiğe dökülmesi açısından kapsamlı bir örnek teşkil etmektedir:

✅ **Normalizasyon:** 1NF, 2NF, 3NF, BCNF uygulamaları
✅ **İlişki Türleri:** One-to-Many, Many-to-Many
✅ **SQL Komutları:** DDL, DML, SELECT sorguları
✅ **JOIN İşlemleri:** INNER, LEFT, Complex joins
✅ **Aggregate Functions:** COUNT, SUM, AVG, MIN, MAX
✅ **Constraints:** PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK
✅ **Indexleme:** Performans optimizasyonu
✅ **Transaction Yönetimi:** BEGIN, COMMIT, ROLLBACK

---

**Proje Başlangıç:** Aralık 2024  
**Geliştirici:** Dogukan  
**Veritabanı:** PostgreSQL 13+ (Neon.tech)  
**Lisans:** MIT  
**Versiyon:** 1.0.0
