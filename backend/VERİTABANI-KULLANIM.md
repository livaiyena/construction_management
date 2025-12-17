# Veritabanı Yönetimi - Kullanım Kılavuzu

## 🗄️ Veritabanı Scriptleri

### 1. Veritabanı Sıfırlama (Reset)

Veritabanındaki **TÜM VERİLERİ** silmek ve ID sıralarını sıfırlamak için:

```bash
cd backend
node resetDb-raw.js
```

veya

```bash
npm run db:reset
```

⚠️ **UYARI:** Bu işlem geri alınamaz! Tüm veriler silinecektir.

---

### 2. Veri Yükleme (Seed)

Veritabanına örnek verileri yüklemek için:

```bash
cd backend
node seed-raw.js
```

veya

```bash
npm run db:seed
```

#### Seed Verisi İçeriği:
- **3** Kullanıcı (admin@insaat.com, proje@insaat.com, muhasebe@insaat.com)
- **20** Farklı İş Rolü
- **10** Proje (İstanbul, Ankara, İzmir, Bursa, Antalya)
- **10** Tedarikçi
- **12** Malzeme Kategorisi
- **51** Malzeme (Çimento, demir, boya, seramik, elektrik, vb.)
- **7** Ekipman Tipi
- **29** Ekipman (Vinç, ekskavatör, jeneratör, vb.)
- **120** Çalışan
- **3,600** Yoklama Kaydı (Son 30 gün x 120 çalışan)
- **300-500** Harcama Kaydı
- **60+** Proje-Malzeme İlişkisi
- **30+** Proje-Ekipman İlişkisi

**TOPLAM:** ~5,000+ kayıt

⏱️ **Süre:** 1-2 dakika

---

### 3. Tam Sıfırlama ve Yeniden Yükleme (Fresh)

Veritabanını sıfırla ve yeni verilerle doldur:

```bash
npm run db:fresh
```

Bu komut sırayla şunları yapar:
1. Tüm verileri siler
2. ID sıralarını sıfırlar
3. Yeni seed verilerini yükler

---

## 🔐 Giriş Bilgileri

Seed sonrası kullanabileceğiniz kullanıcılar:

| Email | Şifre | Rol |
|-------|-------|-----|
| admin@insaat.com | admin123 | Admin |
| proje@insaat.com | admin123 | Admin |
| muhasebe@insaat.com | admin123 | Admin |

---

## 📊 Veri Detayları

### Projeler
- **Aktif Projeler:** 6 adet (Devam Ediyor)
- **Planlanan:** 2 adet
- **Tamamlanan:** 1 adet
- **Askıda:** 1 adet

### Malzemeler
Gerçekçi stok miktarları ve fiyatlarla:
- Kaba Yapı (Çimento, tuğla, beton)
- İnşaat Demiri (8mm'den 20mm'ye)
- Sıva & Alçı
- Boya & Vernik
- Seramik & Fayans
- Elektrik Malzemeleri
- Sıhhi Tesisat
- Yalıtım
- Hırdavat
- Ahşap
- Çatı
- Doğrama

### Ekipmanlar
- Ağır İş Makineleri (Ekskavatör, Dozer, Vinç)
- El Aletleri (Matkap, Kırıcı, Testere)
- Jeneratör & Kompresör
- Nakliye Araçları (Kamyon, Forklift)
- İskele Sistemleri
- Beton Ekipmanları
- Ölçüm Cihazları

### Çalışanlar
- 120 çalışan farklı rollerde
- Gerçekçi Türkçe isimler
- Rastgele atanmış projeler
- Farklı günlük ücretler
- Son 2 yıl içinde işe başlama tarihleri

### Yoklamalar
- Son 30 gün için her çalışan
- Hafta içi %90 gelme oranı
- Hafta sonu %20 gelme oranı
- %5 izinli durumu
- Rastgele mesai saatleri (8-10 saat)

### Harcamalar
- Her proje için 30-50 harcama
- Son 90 gün içinde
- 8 farklı kategori
- Gerçekçi tutarlar
- Farklı ödeme yöntemleri

---

## 🛠️ Sorun Giderme

### Hata: "relation does not exist"
Schema dosyasını çalıştırın:
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/schema.sql
```

### Hata: "insert or update on table violates foreign key constraint"
Önce reset, sonra seed çalıştırın:
```bash
npm run db:fresh
```

### Seed çok yavaş çalışıyor
Normal! 3,600+ yoklama kaydı ekleniyor. 1-2 dakika bekleyin.

---

## 📝 Notlar

- Tüm scriptler **PostgreSQL** ile çalışır
- Raw SQL kullanılır (Sequelize ORM yok)
- bcryptjs ile şifrelenmiş kullanıcılar
- Tüm ID'ler otomatik artan (SERIAL)
- Timestamp'ler PostgreSQL NOW() ile otomatik

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Veritabanını sıfırla ve doldur
cd backend
npm run db:fresh

# 2. Backend'i başlat
npm run dev

# 3. Frontend'i başlat (başka terminalde)
cd ..
npm run dev

# 4. Tarayıcıda aç
http://localhost:5173

# 5. Giriş yap
Email: admin@insaat.com
Şifre: admin123
```

---

**Hazırlayan:** İnşaat Yönetim Sistemi Ekibi  
**Tarih:** 17 Aralık 2025  
**Versiyon:** 2.0 (Gelişmiş Seed)
