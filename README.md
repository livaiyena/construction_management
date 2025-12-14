# İnşaat Yönetim Sistemi

Modern inşaat projelerini, çalışanları, masrafları ve yoklama kayıtlarını yönetmek için geliştirilmiş full-stack web uygulaması.

## 🚀 Özellikler

- **Proje Yönetimi**: Projeleri oluştur, düzenle, takip et
- **Çalışan Yönetimi**: Çalışanları ve rollerini yönet
- **Masraf Takibi**: Proje masraflarını kategorize et ve izle
- **Yoklama Sistemi**: Çalışan devam kayıtlarını tut
- **SQL Raporları**: 12 farklı analitik rapor
- **Dashboard**: Gerçek zamanlı istatistikler ve grafikler

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- PostgreSQL (v13 veya üzeri) - Neon.tech önerilir
- npm veya yarn

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd insaat-yonetim-frontend
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
```

**ÖNEMLİ**: Proje paylaşımlı Neon.tech veritabanı kullanır. `.env` dosyası repository'de mevcuttur ve herkes aynı veritabanına bağlanır. Verileri silmemeye özen gösterin!

### 3. Frontend Kurulumu

```bash
# Ana klasöre dönün
cd ..

# Bağımlılıkları yükleyin
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

Backend şu adreste çalışacak: `http://localhost:5000`

**Frontend:**
Yeni bir terminal açın:
```bash
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173`

## 📱 Kullanım

### İlk Giriş

1. Kayıt ol sayfasından yeni hesap oluşturun
2. Giriş yapın
3. Dashboard'dan sisteme erişin

### Hızlı Başlangıç (Windows)

```bash
baslat.bat
```

Bu script hem frontend hem backend'i aynı anda başlatır.

## 🗂️ Proje Yapısı

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
