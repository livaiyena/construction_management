# İnşaat Yönetim Sistemi 🏗️

Modern inşaat projelerini, çalışanları, masrafları ve yoklama kayıtlarını yönetmek için geliştirilmiş **full-stack web uygulaması** - Raw SQL ile güçlendirilmiş.

> **Final Rapor:** [FINAL-RAPOR.md](FINAL-RAPOR.md) dosyasını mutlaka okuyun! 📚

## 🎯 Proje Özellikleri

### ✨ Temel Özellikler
- **Proje Yönetimi**: 15 tablo ile tam entegre proje takibi
- **Çalışan Yönetimi**: Rol bazlı çalışan sistemi
- **Masraf Takibi**: Kategorilendirilmiş harcama yönetimi
- **Yoklama Sistemi**: Günlük devam kaydı ve mesai takibi
- **SQL Raporları**: 16 farklı analitik rapor (JOIN, GROUP BY, HAVING)
- **Dashboard**: Gerçek zamanlı istatistikler ve grafikler

### 🏆 Final Rapor Şartları

| Şart | Dosya | Durum |
|------|-------|-------|
| a) Proje Amacı | [database/Proje-Amaci.md](database/Proje-Amaci.md) | ✅ |
| b) Tablo ve İlişkiler | 15 tablo, 18 ilişki | ✅ |
| c) ER Diyagramı | [database/ER-Diagram.md](database/ER-Diagram.md) | ✅ |
| d) DDL Kodları | [database/schema.sql](database/schema.sql) | ✅ 500+ satır |
| e) Normalizasyon | [database/Normalizasyon.md](database/Normalizasyon.md) | ✅ BCNF |
| f) DML Kodları | [database/dml-examples.sql](database/dml-examples.sql) | ✅ 50+ örnek |
| g) SQL Sorguları (10+) | [database/queries.sql](database/queries.sql) | ✅ 16 sorgu |
| h) Arayüz | React UI - 11 sayfa | ✅ |
| i) SQL DB Kullanımı | PostgreSQL + Raw SQL | ✅ |

## 🛠️ Teknoloji Yığını

### Backend
- **Veritabanı:** PostgreSQL 13+ (Neon.tech Cloud)
- **SQL Method:** **Raw SQL** (pg kütüphanesi - ORM YOK!)
- **Server:** Node.js + Express.js
- **Auth:** JWT (JSON Web Token)
- **Şifreleme:** bcrypt.js

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React

## 📋 Gereksinimler

- Node.js v16+
- PostgreSQL 13+
- npm veya yarn

## 🛠️ Kurulum

### 1. Veritabanını Oluşturun

```bash
# PostgreSQL'e bağlanın
psql -U postgres

# Yeni veritabanı oluşturun
CREATE DATABASE insaat_yonetim;

# Veritabanına bağlanın
\c insaat_yonetim

# Şemayı yükleyin
\i database/schema.sql

# Örnek veri yükleyin (opsiyonel)
\i database/dml-examples.sql
```

### 2. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun ve düzenleyin
DB_HOST=your-neon-host
DB_PORT=5432
DB_USER=your-username
DB_PASS=your-password
DB_NAME=insaat_yonetim
JWT_SECRET=your-secret-key-here
PORT=5000
```

### 3. Frontend Kurulumu

```bash
# Ana dizinde
npm install
```

### 4. Sunucuları Başlatın

**Backend:**
```bash
cd backend
npm run dev   # Geliştirme modu (nodemon)
# veya
npm start     # Prodüksiyon modu
```

**Frontend:** (Yeni terminal)
```bash
npm run dev
```

Backend: `http://localhost:5000`  
Frontend: `http://localhost:5173`

### 5. Hızlı Başlangıç (Windows)

```bash
baslat.bat  # Hem frontend hem backend'i başlatır
```

## 📊 Veritabanı Yapısı

### Tablolar (15 adet)
1. **Users** - Sistem kullanıcıları
2. **Projects** - İnşaat projeleri
3. **Roles** - Çalışan pozisyonları
4. **Employees** - Şantiye çalışanları
5. **Attendances** - Yoklama kayıtları
6. **Suppliers** - Tedarikçiler
7. **MaterialCategories** - Malzeme kategorileri
8. **Materials** - İnşaat malzemeleri
9. **EquipmentTypes** - Ekipman türleri
10. **Equipment** - İnşaat ekipmanları
11. **ProjectMaterial** - Proje-Malzeme ilişkisi (Junction)
12. **ProjectEquipment** - Proje-Ekipman ilişkisi (Junction)
13. **Expenses** - Harcamalar
14. **Documents** - Dökümanlar
15. **AuditLogs** - Sistem işlem logları

### İlişkiler
- **1:N İlişkiler:** 16 adet
- **N:M İlişkiler:** 2 adet (Junction tables ile)
- **BCNF Normalizasyon:** %93 başarı

Detaylı bilgi: [database/ER-Diagram.md](database/ER-Diagram.md)

## 📁 Proje Yapısı

```
insaat-yonetim-frontend/
├── backend/                 # Backend API
│   ├── config/             # Veritabanı konfigürasyonu
│   ├── models/             # Sequelize modelleri
│   ├── routes/             # API route'ları
│   ├── middleware/         # JWT auth middleware
│   ├── server.js           # Express sunucu
│   ├── sync.js             # Tablo oluşturma
│   └── seed.js             # Örnek veri yükleme
├── src/                    # Frontend (React + Vite)
│   ├── components/         # React bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   ├── context/            # Context API
│   ├── services/           # API servisleri
│   └── main.jsx            # Giriş noktası
├── .env.example            # Örnek environment dosyası
└── README.md               # Bu dosya
```

## 🔧 Teknolojiler

### Backend
- **Node.js + Express**: REST API
- **PostgreSQL + Sequelize**: ORM ve veritabanı
- **JWT**: Authentication
- **bcryptjs**: Şifre hashleme

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Recharts**: Grafikler
- **React Router**: Routing

## 📊 SQL Raporları

Sistem 12 farklı SQL raporu içerir:

1. **Proje Masrafları**: Her projenin toplam masrafları
2. **Kategoriye Göre Masraf**: Masraf kategorilerinin dağılımı
3. **Çalışan Yoklama İstatistikleri**: Çalışan devam durumu
4. **Aylık Masraf Analizi**: Aylık masraf trendleri
5. **En Aktif Çalışanlar**: Devam oranına göre sıralama
6. **Rol Maaş Analizi**: Rollerin maliyet analizi
7. **Bekleyen Masraflar**: Onay bekleyen masraflar
8. **Proje Performansı**: Bütçe kullanım analizi
9. **Haftalık Yoklama**: Haftalık devam istatistikleri
10. **En Pahalı Projeler**: Masraf sıralaması
11. **Çalışan Maliyet Raporu**: Çalışan bazlı maliyet

## 🔐 Güvenlik

- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- PostgreSQL SSL bağlantısı
- **Paylaşımlı veritabanı** - Herkes aynı verilere erişir

## ⚠️ Veritabanı Yönetimi

Veritabanı **paylaşımlıdır**. Lütfen:
- ❌ `sync.js` çalıştırmayın (tüm tablolar silinir!)
- ❌ `seed.js` çalıştırmayın (veriler üzerine yazar!)
- ✅ Sadece okuma ve test amaçlı kullanın
- ✅ Kendi test verilerinizi ekleyebilirsiniz

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altındadır.

## 👨‍💻 Geliştirici

Doğukan - İnşaat Yönetim Sistemi

## 🐛 Sorun Bildirme

Sorunları [Issues](https://github.com/yourusername/insaat-yonetim/issues) bölümünden bildirebilirsiniz.

---

**Not**: Production'a almadan önce `.env` dosyasındaki `JWT_SECRET` değerini mutlaka değiştirin ve güçlü bir şifre kullanın!
