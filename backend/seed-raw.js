// Geliştirilmiş Raw SQL Seed Script - İnşaat Yönetim Sistemi
// Çok daha fazla gerçekçi veri içerir
const { query } = require('./config/db-raw');
const bcrypt = require('bcryptjs');

// Türkçe isim listeleri
const firstNames = [
    'Ahmet', 'Mehmet', 'Ali', 'Veli', 'Hasan', 'Hüseyin', 'İbrahim', 'Mustafa', 'Ömer', 'Yusuf',
    'Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Merve', 'Esra', 'Seda', 'Büşra', 'Nur', 'Ebru',
    'Can', 'Cem', 'Eren', 'Barış', 'Burak', 'Emre', 'Deniz', 'Murat', 'Onur', 'Serkan',
    'Aslı', 'Burcu', 'Derya', 'Gizem', 'Selin', 'Pelin', 'Dilşad', 'Nazlı', 'Ece', 'Özge'
];

const lastNames = [
    'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan',
    'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat',
    'Erdoğan', 'Güneş', 'Acar', 'Aksoy', 'Avcı', 'Bayram', 'Çakır', 'Duman', 'Erdem', 'Güler'
];

async function seed() {
    try {
        console.log('\n🌱 GELİŞMİŞ SEED İŞLEMİ BAŞLATILIYOR...\n');
        console.log('⏰ Bu işlem 1-2 dakika sürebilir...\n');

        // 1. KULLANICILAR (Users)
        console.log('👤 1/13 - Kullanıcılar ekleniyor...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const userIds = [];
        const adminUser = await query(
            'INSERT INTO "Users" ("name", "email", "password", "role", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
            ['Admin Yönetici', 'admin@insaat.com', hashedPassword, 'admin']
        );
        userIds.push(adminUser.rows[0].id);

        const user2 = await query(
            'INSERT INTO "Users" ("name", "email", "password", "role", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
            ['Proje Müdürü', 'proje@insaat.com', hashedPassword, 'admin']
        );
        userIds.push(user2.rows[0].id);

        const user3 = await query(
            'INSERT INTO "Users" ("name", "email", "password", "role", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
            ['Muhasebe Şefi', 'muhasebe@insaat.com', hashedPassword, 'admin']
        );
        userIds.push(user3.rows[0].id);

        console.log(`   ✅ ${userIds.length} kullanıcı eklendi\n`);

        // 2. ROLLER (Roles)
        console.log('📋 2/13 - Roller ekleniyor...');
        const roles = [
            { name: 'Şantiye Şefi', rate: 1500 },
            { name: 'İnşaat Mühendisi', rate: 1400 },
            { name: 'Mimar', rate: 1350 },
            { name: 'Elektrik Mühendisi', rate: 1300 },
            { name: 'Makine Mühendisi', rate: 1300 },
            { name: 'Usta Başı', rate: 1100 },
            { name: 'Kalıp Ustası', rate: 950 },
            { name: 'Demir Ustası', rate: 900 },
            { name: 'Elektrik Ustası', rate: 850 },
            { name: 'Sıhhi Tesisat Ustası', rate: 850 },
            { name: 'Boya Ustası', rate: 800 },
            { name: 'Alçı Ustası', rate: 800 },
            { name: 'Seramik Ustası', rate: 780 },
            { name: 'İş Makinesi Operatörü', rate: 950 },
            { name: 'Vinç Operatörü', rate: 1000 },
            { name: 'Forklift Operatörü', rate: 750 },
            { name: 'Kaynakçı', rate: 850 },
            { name: 'Düz İşçi', rate: 650 },
            { name: 'Yardımcı İşçi', rate: 550 },
            { name: 'Güvenlik Görevlisi', rate: 600 }
        ];

        const roleIds = [];
        for (const role of roles) {
            const result = await query(
                'INSERT INTO "Roles" ("name", "default_daily_rate", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
                [role.name, role.rate, userIds[0]]
            );
            roleIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${roleIds.length} rol eklendi\n`);

        // 3. PROJELER (Projects)
        console.log('🏗️  3/13 - Projeler ekleniyor...');
        const projects = [
            { name: 'Vadi İstanbul Lüks Konutları', city: 'İstanbul', district: 'Sarıyer', address: 'Ayazağa Mah. Cendere Cad. No:109', budget: 85000000, status: 'Devam Ediyor', start: '2024-03-01', end: '2026-06-30' },
            { name: 'Ankara Plaza İş Merkezi', city: 'Ankara', district: 'Çankaya', address: 'Kızılay Meydanı No:45', budget: 45000000, status: 'Devam Ediyor', start: '2024-06-15', end: '2025-12-31' },
            { name: 'İzmir Sahil AVM', city: 'İzmir', district: 'Konak', address: 'Kordon Boyu No:234', budget: 95000000, status: 'Devam Ediyor', start: '2023-09-01', end: '2025-08-30' },
            { name: 'Bursa Residence Projesi', city: 'Bursa', district: 'Nilüfer', address: 'Üniversite Cad. No:67', budget: 38000000, status: 'Planlama', start: '2025-02-01', end: '2026-10-15' },
            { name: 'Antalya Otel Kompleksi', city: 'Antalya', district: 'Konyaaltı', address: 'Sahil Yolu No:890', budget: 120000000, status: 'Devam Ediyor', start: '2024-01-10', end: '2025-11-30' },
            { name: 'İstanbul Hastane İnşaatı', city: 'İstanbul', district: 'Ümraniye', address: 'Çakmak Mah. No:45', budget: 210000000, status: 'Devam Ediyor', start: '2023-05-01', end: '2025-12-31' },
            { name: 'Ankara Toplu Konut', city: 'Ankara', district: 'Keçiören', address: 'Yeni Mahalle Bulvarı', budget: 55000000, status: 'Planlama', start: '2025-04-01', end: '2027-03-31' },
            { name: 'İzmir Fabrika Binası', city: 'İzmir', district: 'Bornova', address: 'Sanayi Sitesi 5. Cad.', budget: 28000000, status: 'Askıda', start: '2024-08-01', end: '2025-06-30' },
            { name: 'Bursa Spor Kompleksi', city: 'Bursa', district: 'Osmangazi', address: 'Stadyum Cad. No:12', budget: 42000000, status: 'Tamamlandı', start: '2023-01-15', end: '2024-11-30' },
            { name: 'Antalya Villa Sitesi', city: 'Antalya', district: 'Muratpaşa', address: 'Lara Bölgesi', budget: 67000000, status: 'Devam Ediyor', start: '2024-05-01', end: '2025-09-30' }
        ];

        const projectIds = [];
        for (const proj of projects) {
            const result = await query(
                'INSERT INTO "Projects" ("name", "city", "district", "address", "budget", "status", "start_date", "end_date", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
                [proj.name, proj.city, proj.district, proj.address, proj.budget, proj.status, proj.start, proj.end, userIds[0]]
            );
            projectIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${projectIds.length} proje eklendi\n`);

        // 4. TEDARİKÇİLER (Suppliers)
        console.log('🏪 4/13 - Tedarikçiler ekleniyor...');
        const suppliers = [
            { name: 'Çimsa Çimento A.Ş.', contact: 'Ahmet Çimentocu', phone: '0216 555 0101', email: 'satis@cimsa.com.tr', address: 'İstanbul Sanayi Bölgesi', tax: '1234567890', rating: 5 },
            { name: 'Kardemir Demir Çelik A.Ş.', contact: 'Mehmet Demirci', phone: '0312 555 0202', email: 'siparis@kardemir.com', address: 'Karabük OSB', tax: '2345678901', rating: 5 },
            { name: 'Tekno Boya San. Tic.', contact: 'Ayşe Boyacı', phone: '0232 555 0303', email: 'bilgi@teknoboya.com', address: 'İzmir Ticaret Merkezi', tax: '3456789012', rating: 4 },
            { name: 'Yapı Malzemeleri Ltd.', contact: 'Veli Yapıcı', phone: '0224 555 0404', email: 'info@yapimalzeme.com', address: 'Bursa İnegöl', tax: '4567890123', rating: 4 },
            { name: 'Elektrosan Elektrik', contact: 'Fatma Elektrikçi', phone: '0242 555 0505', email: 'satis@elektrosan.com', address: 'Antalya Serbest Bölge', tax: '5678901234', rating: 5 },
            { name: 'Mega Hırdavat A.Ş.', contact: 'Ali Hırdavatçı', phone: '0216 555 0606', email: 'irtibat@megahirdavat.com', address: 'İstanbul Pendik', tax: '6789012345', rating: 3 },
            { name: 'İnşaat Demiri Deposu', contact: 'Hasan Demirci', phone: '0312 555 0707', email: 'depo@insaatdemir.com', address: 'Ankara Siteler', tax: '7890123456', rating: 4 },
            { name: 'Premium Seramik', contact: 'Zeynep Seramikçi', phone: '0232 555 0808', email: 'musteri@premiumseramik.com', address: 'İzmir Kemalpaşa', tax: '8901234567', rating: 5 },
            { name: 'Doğrama Dünyası', contact: 'Can Doğramacı', phone: '0216 555 0909', email: 'bilgi@dogramaci.com', address: 'İstanbul Kartal', tax: '9012345678', rating: 4 },
            { name: 'Yalıtım Teknolojileri', contact: 'Deniz Yalıtımcı', phone: '0224 555 1010', email: 'destek@yalitim.com', address: 'Bursa Nilüfer OSB', tax: '0123456789', rating: 4 }
        ];

        const supplierIds = [];
        for (const sup of suppliers) {
            const result = await query(
                'INSERT INTO "Suppliers" ("name", "contact_person", "phone", "email", "address", "tax_number", "rating", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id',
                [sup.name, sup.contact, sup.phone, sup.email, sup.address, sup.tax, sup.rating, userIds[0]]
            );
            supplierIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${supplierIds.length} tedarikçi eklendi\n`);

        // 5. MALZEME KATEGORİLERİ
        console.log('📦 5/13 - Malzeme kategorileri ekleniyor...');
        const categories = [
            { name: 'Kaba Yapı Malzemeleri', desc: 'Çimento, kum, çakıl, beton, tuğla' },
            { name: 'İnşaat Demiri', desc: 'Nervürlü demir, filmaşin, hasır' },
            { name: 'Sıva & Alçı', desc: 'Dış cephe sıvası, iç cephe sıvası, alçı' },
            { name: 'Boya & Vernik', desc: 'İç cephe, dış cephe, ahşap boyaları' },
            { name: 'Seramik & Fayans', desc: 'Yer seramiği, duvar fayansı, porselen' },
            { name: 'Elektrik Malzemeleri', desc: 'Kablo, pano, anahtar, priz, sigorta' },
            { name: 'Sıhhi Tesisat', desc: 'Boru, vana, musluk, radyatör' },
            { name: 'Yalıtım Malzemeleri', desc: 'Isı, su, ses yalıtımı' },
            { name: 'Hırdavat', desc: 'Çivi, vida, somun, cıvata, matkap uçları' },
            { name: 'Ahşap Malzemeler', desc: 'Kereste, lamine, kontrplak' },
            { name: 'Çatı Malzemeleri', desc: 'Kiremit, oluk, çatı örtüsü' },
            { name: 'Doğrama', desc: 'PVC, alüminyum kapı-pencere' }
        ];

        const categoryIds = [];
        for (const cat of categories) {
            const result = await query(
                'INSERT INTO "MaterialCategories" ("name", "description", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
                [cat.name, cat.desc, userIds[0]]
            );
            categoryIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${categoryIds.length} kategori eklendi\n`);

        // 6. MALZEMELER (Materials) - 60+ adet
        console.log('🧱 6/13 - Malzemeler ekleniyor...');
        const materials = [
            // Kaba Yapı (0)
            { name: 'Çimento CEM I 42.5 (50kg çuval)', cat: 0, unit: 'çuval', price: 145, stock: 2500, min: 200, supplier: 0 },
            { name: 'Hazır Beton C30/37', cat: 0, unit: 'm³', price: 850, stock: 0, min: 0, supplier: 0 },
            { name: 'Yıkanmış Kum', cat: 0, unit: 'm³', price: 380, stock: 150, min: 20, supplier: 0 },
            { name: 'Çakıl 1-3 cm', cat: 0, unit: 'm³', price: 420, stock: 120, min: 20, supplier: 0 },
            { name: 'Briket Tuğla 13.5', cat: 0, unit: 'adet', price: 9.50, stock: 25000, min: 2000, supplier: 0 },
            { name: 'Gaz Beton 60cm', cat: 0, unit: 'adet', price: 85, stock: 3500, min: 300, supplier: 0 },
            // Demir (1)
            { name: 'Nervürlü Demir 8mm', cat: 1, unit: 'kg', price: 28.50, stock: 5000, min: 500, supplier: 1 },
            { name: 'Nervürlü Demir 10mm', cat: 1, unit: 'kg', price: 27.80, stock: 8000, min: 800, supplier: 1 },
            { name: 'Nervürlü Demir 12mm', cat: 1, unit: 'kg', price: 27.50, stock: 12000, min: 1000, supplier: 1 },
            { name: 'Nervürlü Demir 14mm', cat: 1, unit: 'kg', price: 27.20, stock: 6000, min: 600, supplier: 1 },
            { name: 'Nervürlü Demir 16mm', cat: 1, unit: 'kg', price: 27, stock: 4500, min: 500, supplier: 1 },
            { name: 'İnşaat Demiri 20mm', cat: 1, unit: 'kg', price: 26.80, stock: 3000, min: 300, supplier: 1 },
            { name: 'Hasır Demir 150x150 Ø8', cat: 1, unit: 'm²', price: 95, stock: 800, min: 100, supplier: 1 },
            // Sıva Alçı (2)
            { name: 'Dış Cephe Sıvası (25kg)', cat: 2, unit: 'çuval', price: 180, stock: 600, min: 50, supplier: 0 },
            { name: 'İç Cephe Saten Alçı (25kg)', cat: 2, unit: 'çuval', price: 165, stock: 850, min: 80, supplier: 0 },
            { name: 'Alçı Sıva Köşebent', cat: 2, unit: 'adet', price: 8.50, stock: 500, min: 50, supplier: 5 },
            // Boya (3)
            { name: 'Plastik İç Cephe Boyası 20kg (Beyaz)', cat: 3, unit: 'kova', price: 1850, stock: 180, min: 20, supplier: 2 },
            { name: 'Silikonlu Dış Cephe Boyası 20kg', cat: 3, unit: 'kova', price: 2400, stock: 120, min: 15, supplier: 2 },
            { name: 'Astar Boya 20kg', cat: 3, unit: 'kova', price: 950, stock: 200, min: 25, supplier: 2 },
            { name: 'Sentetik Boya 2.5L', cat: 3, unit: 'teneke', price: 420, stock: 85, min: 10, supplier: 2 },
            // Seramik (4)
            { name: 'Yer Seramiği 60x60 (1.Kalite)', cat: 4, unit: 'm²', price: 185, stock: 450, min: 50, supplier: 7 },
            { name: 'Banyo Fayansı 30x60', cat: 4, unit: 'm²', price: 165, stock: 380, min: 40, supplier: 7 },
            { name: 'Porselen Seramik 80x80', cat: 4, unit: 'm²', price: 320, stock: 220, min: 25, supplier: 7 },
            { name: 'Seramik Yapıştırıcı 25kg', cat: 4, unit: 'çuval', price: 125, stock: 400, min: 40, supplier: 7 },
            { name: 'Derz Dolgu 5kg', cat: 4, unit: 'paket', price: 85, stock: 250, min: 30, supplier: 7 },
            // Elektrik (5)
            { name: 'NYM Kablo 3x1.5mm', cat: 5, unit: 'metre', price: 18.50, stock: 3500, min: 300, supplier: 4 },
            { name: 'NYM Kablo 3x2.5mm', cat: 5, unit: 'metre', price: 28, stock: 2800, min: 250, supplier: 4 },
            { name: 'NYM Kablo 3x4mm', cat: 5, unit: 'metre', price: 42, stock: 1500, min: 150, supplier: 4 },
            { name: 'Elektrik Panosu 24 Sigortalık', cat: 5, unit: 'adet', price: 850, stock: 45, min: 5, supplier: 4 },
            { name: 'Otomatik Sigorta 16A', cat: 5, unit: 'adet', price: 48, stock: 280, min: 30, supplier: 4 },
            { name: 'Priz Beyaz', cat: 5, unit: 'adet', price: 12.50, stock: 650, min: 50, supplier: 4 },
            { name: 'Anahtar Beyaz', cat: 5, unit: 'adet', price: 15, stock: 720, min: 60, supplier: 4 },
            // Tesisat (6)
            { name: 'PPR Boru 20mm', cat: 6, unit: 'metre', price: 22, stock: 1800, min: 150, supplier: 3 },
            { name: 'PPR Boru 25mm', cat: 6, unit: 'metre', price: 32, stock: 1500, min: 120, supplier: 3 },
            { name: 'PPR Dirsek 20mm', cat: 6, unit: 'adet', price: 5.50, stock: 850, min: 80, supplier: 3 },
            { name: 'Musluk Bataryası Banyo', cat: 6, unit: 'adet', price: 380, stock: 95, min: 10, supplier: 3 },
            { name: 'Klozet Takımı', cat: 6, unit: 'takım', price: 1250, stock: 68, min: 8, supplier: 3 },
            // Yalıtım (7)
            { name: 'Cam Yünü 5cm (Rulo)', cat: 7, unit: 'rulo', price: 185, stock: 320, min: 30, supplier: 9 },
            { name: 'XPS Yalıtım Levhası 5cm', cat: 7, unit: 'm²', price: 95, stock: 450, min: 50, supplier: 9 },
            { name: 'Su Yalıtım Membranı', cat: 7, unit: 'm²', price: 42, stock: 680, min: 60, supplier: 9 },
            // Hırdavat (8)
            { name: 'Çivi 2.5"', cat: 8, unit: 'kg', price: 48, stock: 250, min: 25, supplier: 5 },
            { name: 'Vida 5x50mm (100 adet)', cat: 8, unit: 'paket', price: 35, stock: 180, min: 20, supplier: 5 },
            { name: 'Dübel 8mm (100 adet)', cat: 8, unit: 'paket', price: 28, stock: 220, min: 25, supplier: 5 },
            { name: 'Matkap Ucu Seti 13 Parça', cat: 8, unit: 'set', price: 185, stock: 45, min: 5, supplier: 5 },
            // Ahşap (9)
            { name: 'Lamine Parke AC4 8mm', cat: 9, unit: 'm²', price: 125, stock: 850, min: 80, supplier: 3 },
            { name: 'Kontrplak 18mm', cat: 9, unit: 'levha', price: 380, stock: 180, min: 20, supplier: 3 },
            { name: 'Kereste 5x10 cm', cat: 9, unit: 'metre', price: 85, stock: 450, min: 40, supplier: 3 },
            // Çatı (10)
            { name: 'Kiremit Marssilya', cat: 10, unit: 'adet', price: 12.50, stock: 3500, min: 300, supplier: 0 },
            { name: 'Çatı Oluk 3m', cat: 10, unit: 'adet', price: 95, stock: 120, min: 15, supplier: 8 },
            // Doğrama (11)
            { name: 'PVC Pencere 100x120cm', cat: 11, unit: 'adet', price: 1450, stock: 85, min: 10, supplier: 8 },
            { name: 'Çelik Kapı 90x200cm', cat: 11, unit: 'adet', price: 2850, stock: 48, min: 5, supplier: 8 }
        ];

        const materialIds = [];
        for (const mat of materials) {
            const result = await query(
                'INSERT INTO "Materials" ("name", "MaterialCategoryId", "unit", "unit_price", "stock_quantity", "minimum_stock", "SupplierId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id',
                [mat.name, categoryIds[mat.cat], mat.unit, mat.price, mat.stock, mat.min, supplierIds[mat.supplier], userIds[0]]
            );
            materialIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${materialIds.length} malzeme eklendi\n`);

        // 7. EKİPMAN TİPLERİ
        console.log('🔧 7/13 - Ekipman tipleri ekleniyor...');
        const equipTypes = [
            { name: 'Ağır İş Makinesi', desc: 'Ekskavatör, dozer, greyder, vinç' },
            { name: 'Elektrikli El Aletleri', desc: 'Matkap, taşlama, kırıcı, testere' },
            { name: 'Jeneratör & Kompresör', desc: 'Elektrik ve hava üretim sistemleri' },
            { name: 'Nakliye Araçları', desc: 'Kamyon, forklift, transpalet' },
            { name: 'İskele Sistemleri', desc: 'Çelik iskele, alüminyum iskele' },
            { name: 'Beton Ekipmanları', desc: 'Mikser, pompa, vibratör' },
            { name: 'Ölçüm Cihazları', desc: 'Lazer, nivo, teodolit' }
        ];

        const equipTypeIds = [];
        for (const et of equipTypes) {
            const result = await query(
                'INSERT INTO "EquipmentTypes" ("name", "description", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
                [et.name, et.desc, userIds[0]]
            );
            equipTypeIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${equipTypeIds.length} ekipman tipi eklendi\n`);

        // 8. EKİPMANLAR - 30+ adet
        console.log('🏗️  8/13 - Ekipmanlar ekleniyor...');
        const equipment = [
            // Ağır İş Makineleri
            { name: 'Komatsu PC240 Ekskavatör', type: 0, serial: 'EXC-2024-001', price: 4500000, daily: 8500, condition: 'İyi', date: '2023-06-15' },
            { name: 'Caterpillar D6 Dozer', type: 0, serial: 'DOZ-2024-002', price: 5200000, daily: 9000, condition: 'Mükemmel', date: '2023-08-20' },
            { name: 'Liebherr 110EC-B6 Kule Vinç', type: 0, serial: 'VNC-2023-101', price: 8500000, daily: 15000, condition: 'İyi', date: '2022-11-10' },
            { name: 'JCB 3CX Bekoloder', type: 0, serial: 'BEK-2024-055', price: 2800000, daily: 6500, condition: 'İyi', date: '2024-01-05' },
            { name: 'Hyundai HL757 Yükleyici', type: 0, serial: 'YKL-2023-033', price: 3200000, daily: 7000, condition: 'Orta', date: '2023-04-12' },
            { name: 'Volvo EC220 Ekskavatör', type: 0, serial: 'EXC-2023-088', price: 4200000, daily: 8000, condition: 'İyi', date: '2023-07-18' },
            // El Aletleri
            { name: 'Bosch GBH 5-40 DCE Kırıcı', type: 1, serial: 'KRC-2024-201', price: 15500, daily: 350, condition: 'Mükemmel', date: '2024-02-20' },
            { name: 'Hilti TE 3000-AVR Kırıcı', type: 1, serial: 'KRC-2024-202', price: 18000, daily: 400, condition: 'İyi', date: '2024-03-10' },
            { name: 'Makita HR4013C Matkap', type: 1, serial: 'MTK-2024-301', price: 8500, daily: 200, condition: 'Mükemmel', date: '2024-01-15' },
            { name: 'DeWalt DWE305 Tilki Kuyruğu', type: 1, serial: 'TLK-2024-401', price: 4200, daily: 120, condition: 'İyi', date: '2024-02-05' },
            { name: 'Bosch GWS 22-180 Taşlama', type: 1, serial: 'TSL-2024-501', price: 3800, daily: 100, condition: 'İyi', date: '2024-01-25' },
            { name: 'Hilti WSR 1400-PE Testere', type: 1, serial: 'TST-2024-601', price: 6500, daily: 150, condition: 'Mükemmel', date: '2024-03-01' },
            // Jeneratör & Kompresör
            { name: 'Perkins 100 kVA Jeneratör', type: 2, serial: 'JEN-2023-701', price: 450000, daily: 2500, condition: 'İyi', date: '2023-05-15' },
            { name: 'Cummins 200 kVA Jeneratör', type: 2, serial: 'JEN-2023-702', price: 850000, daily: 4500, condition: 'Mükemmel', date: '2023-06-20' },
            { name: 'Atlas Copco XAHS347 Kompresör', type: 2, serial: 'KMP-2024-801', price: 380000, daily: 2000, condition: 'İyi', date: '2024-01-10' },
            { name: 'Ingersoll Rand P185 Kompresör', type: 2, serial: 'KMP-2023-802', price: 320000, daily: 1800, condition: 'Orta', date: '2023-09-05' },
            // Nakliye
            { name: 'Mercedes Atego 1224 Kamyon', type: 3, serial: 'KMY-34-ABC-123', price: 2800000, daily: 5000, condition: 'İyi', date: '2023-03-15' },
            { name: 'Ford Cargo 1833DC Kamyon', type: 3, serial: 'KMY-06-XYZ-456', price: 2500000, daily: 4500, condition: 'İyi', date: '2023-07-20' },
            { name: 'Toyota 02-8FD25 Forklift 2.5 Ton', type: 3, serial: 'FRK-2024-901', price: 380000, daily: 1500, condition: 'Mükemmel', date: '2024-02-10' },
            { name: 'Mitsubishi FD35NT Forklift 3.5 Ton', type: 3, serial: 'FRK-2023-902', price: 450000, daily: 1800, condition: 'İyi', date: '2023-10-12' },
            // İskele
            { name: 'Çelik İskele Seti 1000m²', type: 4, serial: 'ISK-2023-001', price: 850000, daily: 3000, condition: 'İyi', date: '2023-04-01' },
            { name: 'Alüminyum İskele Seti 500m²', type: 4, serial: 'ISK-2024-002', price: 650000, daily: 2500, condition: 'Mükemmel', date: '2024-01-20' },
            // Beton
            { name: 'Schwing S32X Beton Pompası', type: 5, serial: 'BTP-2023-101', price: 3500000, daily: 12000, condition: 'İyi', date: '2023-05-10' },
            { name: 'Putzmeister BSF 36.16H Pompa', type: 5, serial: 'BTP-2023-102', price: 3800000, daily: 13000, condition: 'Mükemmel', date: '2023-06-15' },
            { name: 'Collomix XM2-650 Mikser', type: 5, serial: 'MXR-2024-201', price: 12500, daily: 250, condition: 'İyi', date: '2024-01-05' },
            { name: 'Wacker Neuson IREN38 Vibratör', type: 5, serial: 'VBR-2024-301', price: 8500, daily: 180, condition: 'Mükemmel', date: '2024-02-15' },
            // Ölçüm
            { name: 'Leica TS06 Total Station', type: 6, serial: 'OLC-2023-401', price: 185000, daily: 800, condition: 'Mükemmel', date: '2023-08-10' },
            { name: 'Topcon DL-503 Dijital Nivo', type: 6, serial: 'OLC-2024-402', price: 65000, daily: 350, condition: 'İyi', date: '2024-01-20' },
            { name: 'Bosch GLM 250 VF Lazer Metre', type: 6, serial: 'OLC-2024-403', price: 8500, daily: 150, condition: 'Mükemmel', date: '2024-03-05' }
        ];

        const equipmentIds = [];
        for (const eq of equipment) {
            const result = await query(
                'INSERT INTO "Equipment" ("name", "EquipmentTypeId", "serial_number", "purchase_price", "daily_rental_cost", "condition", "isAvailable", "purchase_date", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
                [eq.name, equipTypeIds[eq.type], eq.serial, eq.price, eq.daily, eq.condition, true, eq.date, userIds[0]]
            );
            equipmentIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${equipmentIds.length} ekipman eklendi\n`);

        // 9. ÇALIŞANLAR (Employees) - 120 kişi
        console.log('👷 9/13 - Çalışanlar ekleniyor...');
        const employeeIds = [];
        const totalEmployees = 120;

        for (let i = 0; i < totalEmployees; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const roleId = roleIds[Math.floor(Math.random() * roleIds.length)];
            const projectId = projectIds[Math.floor(Math.random() * Math.min(6, projectIds.length))];
            
            const hireDate = new Date();
            hireDate.setDate(hireDate.getDate() - Math.floor(Math.random() * 730));
            const hireDateStr = hireDate.toISOString().split('T')[0];
            
            const roleResult = await query('SELECT default_daily_rate FROM "Roles" WHERE id = $1', [roleId]);
            const dailyRate = roleResult.rows[0].default_daily_rate;
            
            const result = await query(
                'INSERT INTO "Employees" ("first_name", "last_name", "phone", "email", "daily_rate", "hire_date", "status", "RoleId", "ProjectId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id',
                [
                    firstName,
                    lastName,
                    `05${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
                    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@insaat.com`,
                    dailyRate + Math.floor(Math.random() * 200) - 100,
                    hireDateStr,
                    'aktif',
                    roleId,
                    projectId,
                    userIds[0]
                ]
            );
            employeeIds.push(result.rows[0].id);
        }
        console.log(`   ✅ ${employeeIds.length} çalışan eklendi\n`);

        // 10. YOKLAMA KAYITLARI (Attendances) - Son 7 gün (bugünden itibaren)
        console.log('📅 10/13 - Yoklama kayıtları ekleniyor (son 7 gün)...');
        let attendanceCount = 0;

        for (let day = 0; day < 7; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            for (const empId of employeeIds) {
                const shouldAttend = isWeekend ? Math.random() > 0.8 : Math.random() > 0.1;
                
                let status, hours;
                if (shouldAttend) {
                    if (Math.random() < 0.05) {
                        status = 'İzinli';
                        hours = 0;
                    } else {
                        status = 'Geldi';
                        hours = [8, 8, 8, 8, 8, 9, 9, 10][Math.floor(Math.random() * 8)];
                    }
                } else {
                    status = 'Gelmedi';
                    hours = 0;
                }

                const empProj = await query('SELECT "ProjectId" FROM "Employees" WHERE id = $1', [empId]);
                const projId = empProj.rows[0].ProjectId;

                await query(
                    'INSERT INTO "Attendances" ("EmployeeId", "ProjectId", "date", "status", "worked_hours", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
                    [empId, projId, dateStr, status, hours, userIds[0]]
                );
                attendanceCount++;
            }

            if ((day + 1) % 3 === 0 || day === 6) {
                console.log(`   📊 ${day + 1}/7 gün tamamlandı (${attendanceCount} kayıt)`);
            }
        }
        console.log(`   ✅ ${attendanceCount} yoklama kaydı eklendi\n`);

        // 11. HARCAMALAR (Expenses)
        console.log('💰 11/13 - Harcamalar ekleniyor...');
        const expenseCategories = ['Malzeme', 'İşçilik', 'Ekipman Kiralama', 'Ulaşım', 'Yemek', 'Sigorta', 'Vergi', 'Diğer'];
        const paymentMethods = ['Nakit', 'Banka Transferi', 'Kredi Kartı', 'Çek'];
        let expenseCount = 0;

        for (const projId of projectIds) {
            const numExpenses = 30 + Math.floor(Math.random() * 21);
            
            for (let i = 0; i < numExpenses; i++) {
                const daysAgo = Math.floor(Math.random() * 90);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                const dateStr = date.toISOString().split('T')[0];
                
                const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                
                let amount;
                switch (category) {
                    case 'Malzeme': amount = 5000 + Math.floor(Math.random() * 95000); break;
                    case 'İşçilik': amount = 20000 + Math.floor(Math.random() * 180000); break;
                    case 'Ekipman Kiralama': amount = 10000 + Math.floor(Math.random() * 90000); break;
                    case 'Yemek': amount = 2000 + Math.floor(Math.random() * 8000); break;
                    default: amount = 1000 + Math.floor(Math.random() * 19000);
                }
                
                const descriptions = {
                    'Malzeme': ['Çimento alımı', 'Demir tedariki', 'Boya ve malzeme', 'Seramik alımı', 'Elektrik malzemeleri'],
                    'İşçilik': ['Haftalık maaş ödemesi', 'Aylık bordro', 'Mesai ücreti', 'Prim ödemesi'],
                    'Ekipman Kiralama': ['Vinç kiralama', 'Ekskavatör kiralama', 'İskele kiralama', 'Jeneratör kiralama'],
                    'Ulaşım': ['Nakliye ücreti', 'Yakıt gideri', 'Araç kiralama'],
                    'Yemek': ['Personel yemeği', 'Catering hizmeti'],
                    'Sigorta': ['İş güvenliği sigortası', 'Sosyal güvenlik primi'],
                    'Vergi': ['KDV ödemesi', 'Stopaj ödemesi'],
                    'Diğer': ['Çeşitli giderler', 'Ofis malzemeleri', 'Temizlik']
                };
                
                const descList = descriptions[category] || ['Genel gider'];
                const description = descList[Math.floor(Math.random() * descList.length)];
                
                await query(
                    'INSERT INTO "Expenses" ("ProjectId", "category", "description", "amount", "expense_date", "payment_method", "status", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
                    [projId, category, description, amount, dateStr, method, 'Ödendi', userIds[0]]
                );
                expenseCount++;
            }
        }
        console.log(`   ✅ ${expenseCount} harcama kaydı eklendi\n`);

        // 12. PROJE-MALZEME İLİŞKİLERİ
        console.log('📦 12/13 - Proje malzeme atamaları yapılıyor...');
        let projMatCount = 0;
        
        for (let i = 0; i < Math.min(6, projectIds.length); i++) {
            const numMaterials = 10 + Math.floor(Math.random() * 11);
            const selectedMaterials = [...materialIds]
                .sort(() => 0.5 - Math.random())
                .slice(0, numMaterials);
            
            for (const matId of selectedMaterials) {
                const quantity = 10 + Math.floor(Math.random() * 490);
                const assignDate = new Date();
                assignDate.setDate(assignDate.getDate() - Math.floor(Math.random() * 60));
                
                await query(
                    'INSERT INTO "ProjectMaterial" ("ProjectId", "MaterialId", "quantity_used", "date_used", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
                    [projectIds[i], matId, quantity, assignDate.toISOString().split('T')[0]]
                );
                projMatCount++;
            }
        }
        console.log(`   ✅ ${projMatCount} proje-malzeme ilişkisi eklendi\n`);

        // 13. PROJE-EKİPMAN İLİŞKİLERİ
        console.log('🏗️  13/13 - Proje ekipman atamaları yapılıyor...');
        let projEqCount = 0;
        
        for (let i = 0; i < Math.min(6, projectIds.length); i++) {
            const numEquipment = 5 + Math.floor(Math.random() * 6);
            const selectedEquipment = [...equipmentIds]
                .sort(() => 0.5 - Math.random())
                .slice(0, numEquipment);
            
            for (const eqId of selectedEquipment) {
                const assignDate = new Date();
                assignDate.setDate(assignDate.getDate() - Math.floor(Math.random() * 60));
                
                await query(
                    'INSERT INTO "ProjectEquipment" ("ProjectId", "EquipmentId", "start_date", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
                    [projectIds[i], eqId, assignDate.toISOString().split('T')[0]]
                );
                projEqCount++;
            }
        }
        console.log(`   ✅ ${projEqCount} proje-ekipman ilişkisi eklendi\n`);

        // ÖZET
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║     ✅ SEED İŞLEMİ TAMAMLANDI!           ║');
        console.log('╚════════════════════════════════════════════╝\n');
        console.log('📊 VERİ ÖZETİ:');
        console.log('─────────────────────────────────────────────');
        console.log(`   👤 Kullanıcılar: ${userIds.length}`);
        console.log(`   📋 Roller: ${roleIds.length}`);
        console.log(`   🏗️  Projeler: ${projectIds.length}`);
        console.log(`   🏪 Tedarikçiler: ${supplierIds.length}`);
        console.log(`   📦 Malzeme Kategorileri: ${categoryIds.length}`);
        console.log(`   🧱 Malzemeler: ${materialIds.length}`);
        console.log(`   🔧 Ekipman Tipleri: ${equipTypeIds.length}`);
        console.log(`   🏗️  Ekipmanlar: ${equipmentIds.length}`);
        console.log(`   👷 Çalışanlar: ${employeeIds.length}`);
        console.log(`   📅 Yoklama Kayıtları: ${attendanceCount.toLocaleString('tr-TR')}`);
        console.log(`   💰 Harcamalar: ${expenseCount}`);
        console.log(`   🔗 Proje-Malzeme: ${projMatCount}`);
        console.log(`   🔗 Proje-Ekipman: ${projEqCount}`);
        console.log('─────────────────────────────────────────────');
        const total = userIds.length + roleIds.length + projectIds.length + supplierIds.length + 
                      categoryIds.length + materialIds.length + equipTypeIds.length + equipmentIds.length + 
                      employeeIds.length + attendanceCount + expenseCount + projMatCount + projEqCount;
        console.log(`\n   📊 TOPLAM: ${total.toLocaleString('tr-TR')} kayıt\n`);
        console.log('🎉 Veritabanınız kullanıma hazır!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed hatası:', error);
        console.error('Detay:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Seed'i çalıştır
seed();
