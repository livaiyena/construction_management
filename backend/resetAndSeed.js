// Full Database Reset & Seed Script
const { sequelize } = require('./config/db');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
    try {
        console.log('\n🔥 FULL DATABASE RESET BAŞLIYOR...\n');
        
        // Bağlantı testi
        await sequelize.authenticate();
        console.log('✅ Veritabanı bağlantısı başarılı\n');

        // TÜM TABLOLARI VE CONSTRAINT'LERİ SİL
        console.log('🗑️  Tüm tablolar ve kısıtlamalar siliniyor...');
        
        // Önce tüm constraint'leri temizle
        await sequelize.query(`
            DO $$ 
            DECLARE r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        `);
        
        console.log('✅ Tüm tablolar silindi\n');

        // Modelleri içe aktar (sync'ten önce!)
        const models = require('./models');

        // TABLOLARI YENİDEN OLUŞTUR
        console.log('🔨 Tablolar yeniden oluşturuluyor...');
        await sequelize.sync({ force: true });
        console.log('✅ Tablolar oluşturuldu\n');

        const { User, Project, Employee, Role, Attendance, Expense, Supplier, Material, Equipment, Document, AuditLog } = models;

        console.log('📦 BULK INSERT başlıyor...\n');

        // ==================== 1. KULLANICILAR ====================
        console.log('👤 Kullanıcılar ekleniyor...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const users = await User.bulkCreate([
            {
                name: 'Admin User',
                email: 'admin@insaat.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            },
            {
                name: 'Ahmet Yılmaz',
                email: 'ahmet@insaat.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            }
        ]);
        console.log(`✅ ${users.length} kullanıcı eklendi\n`);

        const adminUser = users[0];
        const regularUser = users[1]; // Ahmet Yılmaz

        // ==================== 2. ROLLER ====================
        console.log('💼 Roller ekleniyor...');
        const roles = await Role.bulkCreate([
            { name: 'Şantiye Şefi', default_daily_rate: 850, description: 'Şantiye operasyonlarını yönetir', userId: adminUser.id },
            { name: 'Mimar', default_daily_rate: 750, description: 'Mimari tasarım ve uygulama', userId: adminUser.id },
            { name: 'İnşaat Mühendisi', default_daily_rate: 700, description: 'İnşaat mühendisliği hizmetleri', userId: adminUser.id },
            { name: 'Elektrik Ustası', default_daily_rate: 600, description: 'Elektrik tesisatı kurulumu', userId: adminUser.id },
            { name: 'Sıhhi Tesisat Ustası', default_daily_rate: 550, description: 'Su ve doğalgaz tesisatı', userId: adminUser.id },
            { name: 'Kalıpçı Ustası', default_daily_rate: 500, description: 'Beton kalıp işleri', userId: adminUser.id },
            { name: 'Demir Ustası', default_daily_rate: 480, description: 'İnşaat demiri bağlama', userId: adminUser.id },
            { name: 'Duvarcı', default_daily_rate: 450, description: 'Duvar örme işleri', userId: adminUser.id },
            { name: 'Sıvacı', default_daily_rate: 420, description: 'Sıva ve alçı işleri', userId: adminUser.id },
            { name: 'Boyacı', default_daily_rate: 400, description: 'İç ve dış cephe boyama', userId: adminUser.id },
            { name: 'Çatı Ustası', default_daily_rate: 520, description: 'Çatı kaplama ve onarım', userId: adminUser.id },
            { name: 'Seramik Ustası', default_daily_rate: 480, description: 'Seramik ve fayans döşeme', userId: adminUser.id },
            { name: 'Doğramacı', default_daily_rate: 460, description: 'Kapı pencere montajı', userId: adminUser.id },
            { name: 'İşçi', default_daily_rate: 350, description: 'Genel inşaat işçisi', userId: adminUser.id },
            { name: 'Güvenlik Görevlisi', default_daily_rate: 380, description: 'Şantiye güvenliği', userId: adminUser.id },
            { name: 'Temizlik Görevlisi', default_daily_rate: 320, description: 'Şantiye temizliği', userId: adminUser.id },
            { name: 'Makine Operatörü', default_daily_rate: 550, description: 'İş makinesi operatörü', userId: adminUser.id },
            { name: 'Teknisyen', default_daily_rate: 500, description: 'Teknik destek', userId: adminUser.id }
        ]);
        console.log(`✅ ${roles.length} rol eklendi\n`);

        // ==================== 3. PROJELER ====================
        console.log('🏗️  Projeler ekleniyor...');
        const projects = await Project.bulkCreate([
            {
                name: 'Lale Residence Konut Projesi',
                description: 'Kadıköy bölgesinde 8 katlı, 32 daireli lüks konut projesi. Tüm daireler deniz manzaralı.',
                city: 'İstanbul',
                district: 'Kadıköy',
                address: 'Caferağa Mahallesi, Moda Caddesi No: 45',
                budget: 18500000,
                currency: 'TRY',
                start_date: new Date('2024-06-01'),
                end_date: new Date('2026-03-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Boğaz View İş Merkezi',
                description: '20 katlı A+ ofis binası, Boğaz manzaralı, akıllı bina teknolojisi',
                city: 'İstanbul',
                district: 'Beşiktaş',
                address: 'Levent Mahallesi, Büyükdere Caddesi No: 201',
                budget: 45000000,
                currency: 'TRY',
                start_date: new Date('2024-03-15'),
                end_date: new Date('2027-12-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Sarıyer Villaları',
                description: '12 adet müstakil villa projesi, her biri 400m² kapalı alan',
                city: 'İstanbul',
                district: 'Sarıyer',
                address: 'Tarabya Mahallesi, Kireçburnu Yolu No: 34',
                budget: 28000000,
                currency: 'TRY',
                start_date: new Date('2023-09-01'),
                end_date: new Date('2025-08-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Zekeriyaköy Sitesi',
                description: '240 daireli kapalı site projesi, sosyal tesisler dahil',
                city: 'İstanbul',
                district: 'Sarıyer',
                address: 'Zekeriyaköy Mahallesi, Göksu Yolu',
                budget: 52000000,
                currency: 'TRY',
                start_date: new Date('2024-01-10'),
                end_date: new Date('2026-09-30'),
                status: 'Planlama',
                userId: adminUser.id
            },
            {
                name: 'Ataşehir AVM',
                description: 'Modern alışveriş merkezi, 150 mağaza kapasiteli',
                city: 'İstanbul',
                district: 'Ataşehir',
                address: 'Ataşehir Bulvarı No: 123',
                budget: 65000000,
                currency: 'TRY',
                start_date: new Date('2023-05-20'),
                end_date: new Date('2025-12-15'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Pendik Fabrika',
                description: 'Üretim tesisi, 15.000 m² kapalı alan',
                city: 'İstanbul',
                district: 'Pendik',
                address: 'Organize Sanayi Bölgesi',
                budget: 22000000,
                currency: 'TRY',
                start_date: new Date('2024-08-01'),
                end_date: new Date('2025-11-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Bakırköy Otel',
                description: '5 yıldızlı otel, 200 oda, konferans salonu',
                city: 'İstanbul',
                district: 'Bakırköy',
                address: 'Sahil Yolu Caddesi No: 78',
                budget: 38000000,
                currency: 'TRY',
                start_date: new Date('2023-11-10'),
                end_date: new Date('2025-06-30'),
                status: 'Tamamlandı',
                userId: adminUser.id
            },
            {
                name: 'Beylikdüzü Rezidans',
                description: '3 blok, toplam 180 daire',
                city: 'İstanbul',
                district: 'Beylikdüzü',
                address: 'Cumhuriyet Mahallesi, Marmara Caddesi',
                budget: 32000000,
                currency: 'TRY',
                start_date: new Date('2024-02-15'),
                end_date: new Date('2026-02-28'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            }
        ]);
        console.log(`✅ ${projects.length} proje eklendi\n`);

        // ==================== 4. ÇALIŞANLAR ====================
        console.log('👷 Çalışanlar ekleniyor...');
        const employees = await Employee.bulkCreate([
            // Lale Residence ekibi
            {
                first_name: 'Mehmet',
                last_name: 'Demir',
                phone: '0532 111 2233',
                email: 'mehmet.demir@example.com',
                address: 'Kadıköy, İstanbul',
                daily_rate: 850,
                hire_date: new Date('2024-05-15'),
                status: 'aktif',
                RoleId: roles[0].id,
                userId: adminUser.id
            },
            {
                first_name: 'Ayşe',
                last_name: 'Kaya',
                phone: '0534 333 4455',
                email: 'ayse.kaya@example.com',
                address: 'Sarıyer, İstanbul',
                daily_rate: 700,
                hire_date: new Date('2024-06-01'),
                status: 'aktif',
                RoleId: roles[2].id,
                userId: adminUser.id
            },
            {
                first_name: 'Hasan',
                last_name: 'Çelik',
                phone: '0537 666 7788',
                email: 'hasan.celik@example.com',
                daily_rate: 500,
                hire_date: new Date('2024-06-10'),
                status: 'aktif',
                RoleId: roles[5].id,
                userId: adminUser.id
            },
            {
                first_name: 'Emre',
                last_name: 'Aydın',
                phone: '0539 888 9900',
                daily_rate: 420,
                hire_date: new Date('2024-06-15'),
                status: 'aktif',
                RoleId: roles[8].id,
                userId: adminUser.id
            },
            {
                first_name: 'Can',
                last_name: 'Yılmaz',
                phone: '0533 222 3344',
                daily_rate: 480,
                hire_date: new Date('2024-07-01'),
                status: 'aktif',
                RoleId: roles[6].id,
                userId: adminUser.id
            },
            {
                first_name: 'Selin',
                last_name: 'Öztürk',
                phone: '0535 444 5566',
                email: 'selin.ozturk@example.com',
                daily_rate: 450,
                hire_date: new Date('2024-07-05'),
                status: 'aktif',
                RoleId: roles[7].id,
                userId: adminUser.id
            },
            
            // Boğaz View ekibi
            {
                first_name: 'Ali',
                last_name: 'Yılmaz',
                phone: '0533 222 3344',
                email: 'ali.yilmaz@example.com',
                address: 'Beşiktaş, İstanbul',
                daily_rate: 750,
                hire_date: new Date('2024-03-01'),
                status: 'aktif',
                RoleId: roles[1].id,
                userId: adminUser.id
            },
            {
                first_name: 'Fatma',
                last_name: 'Şahin',
                phone: '0535 444 5566',
                email: 'fatma.sahin@example.com',
                daily_rate: 600,
                hire_date: new Date('2024-03-15'),
                status: 'aktif',
                RoleId: roles[3].id,
                userId: adminUser.id
            },
            {
                first_name: 'Zeynep',
                last_name: 'Arslan',
                phone: '0538 777 8899',
                email: 'zeynep.arslan@example.com',
                daily_rate: 450,
                hire_date: new Date('2024-04-01'),
                status: 'aktif',
                RoleId: roles[7].id,
                userId: adminUser.id
            },
            {
                first_name: 'Burak',
                last_name: 'Koç',
                phone: '0536 555 6677',
                daily_rate: 400,
                hire_date: new Date('2024-04-10'),
                status: 'aktif',
                RoleId: roles[9].id,
                userId: adminUser.id
            },
            
            // Sarıyer Villaları ekibi
            {
                first_name: 'Mustafa',
                last_name: 'Öz',
                phone: '0536 555 6677',
                email: 'mustafa.oz@example.com',
                daily_rate: 550,
                hire_date: new Date('2023-09-05'),
                status: 'aktif',
                RoleId: roles[4].id,
                userId: adminUser.id
            },
            {
                first_name: 'Elif',
                last_name: 'Bulut',
                phone: '0532 999 0011',
                email: 'elif.bulut@example.com',
                daily_rate: 480,
                hire_date: new Date('2023-09-10'),
                status: 'aktif',
                RoleId: roles[11].id,
                userId: adminUser.id
            },
            {
                first_name: 'Ahmet',
                last_name: 'Kara',
                phone: '0534 888 7766',
                daily_rate: 520,
                hire_date: new Date('2023-09-15'),
                status: 'aktif',
                RoleId: roles[10].id,
                userId: adminUser.id
            },
            
            // Ataşehir AVM ekibi
            {
                first_name: 'Mehmet',
                last_name: 'Yıldız',
                phone: '0533 777 6655',
                email: 'mehmet.yildiz@example.com',
                daily_rate: 850,
                hire_date: new Date('2023-05-10'),
                status: 'aktif',
                RoleId: roles[0].id,
                userId: adminUser.id
            },
            {
                first_name: 'Deniz',
                last_name: 'Şen',
                phone: '0535 666 5544',
                daily_rate: 700,
                hire_date: new Date('2023-05-20'),
                status: 'aktif',
                RoleId: roles[2].id,
                userId: adminUser.id
            },
            {
                first_name: 'Kemal',
                last_name: 'Avcı',
                phone: '0536 444 3322',
                daily_rate: 600,
                hire_date: new Date('2023-06-01'),
                status: 'aktif',
                RoleId: roles[3].id,
                userId: adminUser.id
            },
            
            // Pendik Fabrika ekibi
            {
                first_name: 'Oğuz',
                last_name: 'Tekin',
                phone: '0532 333 2211',
                daily_rate: 550,
                hire_date: new Date('2024-08-05'),
                status: 'aktif',
                RoleId: roles[16].id,
                userId: adminUser.id
            },
            {
                first_name: 'Cem',
                last_name: 'Polat',
                phone: '0534 222 1100',
                daily_rate: 500,
                hire_date: new Date('2024-08-10'),
                status: 'aktif',
                RoleId: roles[17].id,
                userId: adminUser.id
            },
            
            // Beylikdüzü Rezidans ekibi
            {
                first_name: 'Serkan',
                last_name: 'Eren',
                phone: '0533 111 0099',
                email: 'serkan.eren@example.com',
                daily_rate: 850,
                hire_date: new Date('2024-02-10'),
                status: 'aktif',
                RoleId: roles[0].id,
                userId: adminUser.id
            },
            {
                first_name: 'Gizem',
                last_name: 'Korkmaz',
                phone: '0535 999 8877',
                daily_rate: 750,
                hire_date: new Date('2024-02-15'),
                status: 'aktif',
                RoleId: roles[1].id,
                userId: adminUser.id
            },
            
            // Genel işçiler
            {
                first_name: 'İbrahim',
                last_name: 'Aslan',
                phone: '0536 888 6655',
                daily_rate: 350,
                hire_date: new Date('2024-01-15'),
                status: 'aktif',
                RoleId: roles[13].id,
                userId: adminUser.id
            },
            {
                first_name: 'Yusuf',
                last_name: 'Kurt',
                phone: '0532 777 5544',
                daily_rate: 350,
                hire_date: new Date('2024-02-01'),
                status: 'aktif',
                RoleId: roles[13].id,
                userId: adminUser.id
            },
            {
                first_name: 'Hüseyin',
                last_name: 'Güneş',
                phone: '0534 666 4433',
                daily_rate: 350,
                hire_date: new Date('2024-03-01'),
                status: 'aktif',
                RoleId: roles[13].id,
                userId: adminUser.id
            },
            {
                first_name: 'Ramazan',
                last_name: 'Doğan',
                phone: '0533 555 3322',
                daily_rate: 350,
                hire_date: new Date('2024-04-01'),
                status: 'aktif',
                RoleId: roles[13].id,
                userId: adminUser.id
            },
            {
                first_name: 'Cihan',
                last_name: 'Yavuz',
                phone: '0535 444 2211',
                daily_rate: 350,
                hire_date: new Date('2024-05-01'),
                status: 'aktif',
                RoleId: roles[13].id,
                userId: adminUser.id
            },
            
            // Güvenlik ve temizlik
            {
                first_name: 'Murat',
                last_name: 'Akar',
                phone: '0536 333 1100',
                daily_rate: 380,
                hire_date: new Date('2024-01-05'),
                status: 'aktif',
                RoleId: roles[14].id,
                userId: adminUser.id
            },
            {
                first_name: 'Salih',
                last_name: 'Taş',
                phone: '0532 222 0099',
                daily_rate: 380,
                hire_date: new Date('2024-02-05'),
                status: 'aktif',
                RoleId: roles[14].id,
                userId: adminUser.id
            },
            {
                first_name: 'Ayşe',
                last_name: 'Yurt',
                phone: '0534 111 9988',
                daily_rate: 320,
                hire_date: new Date('2024-01-10'),
                status: 'aktif',
                RoleId: roles[15].id,
                userId: adminUser.id
            },
            {
                first_name: 'Hatice',
                last_name: 'Çetin',
                phone: '0533 999 7766',
                daily_rate: 320,
                hire_date: new Date('2024-02-10'),
                status: 'aktif',
                RoleId: roles[15].id,
                userId: adminUser.id
            },
            
            // Pasif çalışanlar
            {
                first_name: 'Volkan',
                last_name: 'Demirci',
                phone: '0535 888 5544',
                daily_rate: 450,
                hire_date: new Date('2023-01-15'),
                status: 'pasif',
                RoleId: roles[7].id,
                userId: adminUser.id
            },
            {
                first_name: 'Erkan',
                last_name: 'Özkaya',
                phone: '0536 777 4433',
                daily_rate: 400,
                hire_date: new Date('2023-03-20'),
                status: 'pasif',
                RoleId: roles[9].id,
                userId: adminUser.id
            }
        ]);
        console.log(`✅ ${employees.length} çalışan eklendi\n`);

        // ==================== 5. YOKLAMA ====================
        console.log('📅 Yoklamalar ekleniyor...');
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
        const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
        
        const attendanceData = [];
        
        // Bugünkü yoklamalar (30 çalışan)
        for (let i = 0; i < Math.min(30, employees.length); i++) {
            const statuses = ['Geldi', 'Geldi', 'Geldi', 'Geldi', 'İzinli', 'Gelmedi'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            attendanceData.push({
                date: today,
                status: randomStatus,
                EmployeeId: employees[i].id,
                userId: adminUser.id
            });
        }
        
        // Dünkü yoklamalar
        for (let i = 0; i < Math.min(30, employees.length); i++) {
            const statuses = ['Geldi', 'Geldi', 'Geldi', 'Geldi', 'İzinli', 'Gelmedi'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            attendanceData.push({
                date: yesterday,
                status: randomStatus,
                EmployeeId: employees[i].id,
                userId: adminUser.id
            });
        }
        
        // 2 gün önceki yoklamalar
        for (let i = 0; i < Math.min(25, employees.length); i++) {
            attendanceData.push({
                date: twoDaysAgo,
                status: 'Geldi',
                EmployeeId: employees[i].id,
                userId: adminUser.id
            });
        }
        
        // 3 gün önceki yoklamalar
        for (let i = 0; i < Math.min(25, employees.length); i++) {
            attendanceData.push({
                date: threeDaysAgo,
                status: i % 10 === 0 ? 'İzinli' : 'Geldi',
                EmployeeId: employees[i].id,
                userId: adminUser.id
            });
        }
        
        const attendances = await Attendance.bulkCreate(attendanceData);
        console.log(`✅ ${attendances.length} yoklama kaydı eklendi\n`);

        // ==================== 6. HARCAMALAR ====================
        console.log('💰 Harcamalar ekleniyor...');
        const expenses = await Expense.bulkCreate([
            // Lale Residence harcamaları
            { description: 'Demir malzeme alımı - 12mm & 16mm', amount: 125000, category: 'Malzeme', expense_date: new Date('2024-11-15'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[0].id, userId: adminUser.id },
            { description: 'Çimento ve kum toplu alımı', amount: 45000, category: 'Malzeme', expense_date: new Date('2024-11-18'), payment_method: 'Kredi Kartı', status: 'Ödendi', ProjectId: projects[0].id, userId: adminUser.id },
            { description: 'Kasım ayı işçi maaşları', amount: 180000, category: 'Maaş', expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[0].id, userId: adminUser.id },
            { description: 'Elektrik kablosu ve malzemeleri', amount: 35000, category: 'Malzeme', expense_date: new Date('2024-11-20'), payment_method: 'Nakit', status: 'Ödendi', ProjectId: projects[0].id, userId: adminUser.id },
            { description: 'Boya malzemeleri', amount: 28000, category: 'Malzeme', expense_date: new Date('2024-11-22'), payment_method: 'Nakit', status: 'Onaylandı', ProjectId: projects[0].id, userId: adminUser.id },
            { description: 'Seramik ve fayans', amount: 67000, category: 'Malzeme', expense_date: new Date('2024-10-15'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[0].id, userId: adminUser.id },
            { description: 'Vinç kiralama - Ekim ayı', amount: 42000, category: 'Ekipman', expense_date: new Date('2024-10-01'), payment_method: 'Çek', status: 'Ödendi', ProjectId: projects[0].id, userId: adminUser.id },
            
            // Boğaz View harcamaları
            { description: 'Elektrik tesisatı kurulumu', amount: 185000, category: 'Ulaşım', expense_date: new Date('2024-11-20'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[1].id, userId: adminUser.id },
            { description: 'Vinç kiralama - Kasım', amount: 55000, category: 'Ekipman', expense_date: new Date('2024-11-10'), payment_method: 'Çek', status: 'Ödendi', ProjectId: projects[1].id, userId: adminUser.id },
            { description: 'Kasım ayı işçi maaşları', amount: 320000, category: 'Maaş', expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[1].id, userId: adminUser.id },
            { description: 'Cam cephe malzemeleri', amount: 450000, category: 'Malzeme', expense_date: new Date('2024-10-25'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[1].id, userId: adminUser.id },
            { description: 'Asansör montajı', amount: 280000, category: 'Ulaşım', expense_date: new Date('2024-10-15'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[1].id, userId: adminUser.id },
            { description: 'Yangın söndürme sistemi', amount: 95000, category: 'Malzeme', expense_date: new Date('2024-11-05'), payment_method: 'Kredi Kartı', status: 'Onaylandı', ProjectId: projects[1].id, userId: adminUser.id },
            
            // Sarıyer Villaları harcamaları
            { description: 'Lüks banyo malzemeleri', amount: 120000, category: 'Malzeme', expense_date: new Date('2024-11-12'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[2].id, userId: adminUser.id },
            { description: 'Mutfak dolabı ve tezgah', amount: 85000, category: 'Malzeme', expense_date: new Date('2024-11-08'), payment_method: 'Kredi Kartı', status: 'Ödendi', ProjectId: projects[2].id, userId: adminUser.id },
            { description: 'Peyzaj çalışmaları', amount: 145000, category: 'Ulaşım', expense_date: new Date('2024-10-20'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[2].id, userId: adminUser.id },
            { description: 'Kasım ayı işçi maaşları', amount: 95000, category: 'Maaş', expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[2].id, userId: adminUser.id },
            
            // Ataşehir AVM harcamaları
            { description: 'Yapısal çelik konstrüksiyon', amount: 650000, category: 'Malzeme', expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[4].id, userId: adminUser.id },
            { description: 'HVAC sistem kurulumu', amount: 385000, category: 'Ulaşım', expense_date: new Date('2024-10-15'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[4].id, userId: adminUser.id },
            { description: 'Ekim ayı işçi maaşları', amount: 420000, category: 'Maaş', expense_date: new Date('2024-10-01'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[4].id, userId: adminUser.id },
            { description: 'Yürüyen merdiven montajı', amount: 520000, category: 'Ekipman', expense_date: new Date('2024-11-10'), payment_method: 'Havale', status: 'Onaylandı', ProjectId: projects[4].id, userId: adminUser.id },
            
            // Pendik Fabrika harcamaları
            { description: 'Endüstriyel zemin kaplama', amount: 180000, category: 'Malzeme', expense_date: new Date('2024-11-15'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[5].id, userId: adminUser.id },
            { description: 'Elektrik pano ve kablolama', amount: 95000, category: 'Malzeme', expense_date: new Date('2024-11-05'), payment_method: 'Kredi Kartı', status: 'Ödendi', ProjectId: projects[5].id, userId: adminUser.id },
            { description: 'Vinç montajı', amount: 150000, category: 'Ekipman', expense_date: new Date('2024-10-20'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[5].id, userId: adminUser.id },
            
            // Beylikdüzü Rezidans harcamaları
            { description: 'Temel kazısı ve hafriyat', amount: 220000, category: 'Ulaşım', expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[7].id, userId: adminUser.id },
            { description: 'Demir ve beton malzeme', amount: 380000, category: 'Malzeme', expense_date: new Date('2024-10-25'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[7].id, userId: adminUser.id },
            { description: 'Kasım ayı işçi maaşları', amount: 280000, category: 'Maaş', expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', ProjectId: projects[7].id, userId: adminUser.id },
            
            // Genel yönetim harcamaları
            { description: 'Ofis kira bedeli - Kasım', amount: 45000, category: 'Diğer', expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', userId: adminUser.id },
            { description: 'Araç yakıt giderleri', amount: 18500, category: 'Ulaşım', expense_date: new Date('2024-11-20'), payment_method: 'Kredi Kartı', status: 'Ödendi', userId: adminUser.id },
            { description: 'Personel yemek giderleri', amount: 32000, category: 'Yemek', expense_date: new Date('2024-11-15'), payment_method: 'Nakit', status: 'Ödendi', userId: adminUser.id }
        ]);
        console.log(`✅ ${expenses.length} harcama kaydı eklendi\n`);

        // ==================== 7. TEDARİKÇİLER ====================
        console.log('🏢 Tedarikçiler ekleniyor...');
        const suppliers = await Supplier.bulkCreate([
            {
                name: 'İnşaat Demir A.Ş.',
                contact_person: 'Ahmet Yıldız',
                phone: '0212 555 1111',
                email: 'info@insaatdemir.com',
                address: 'Kağıthane, İstanbul',
                tax_number: '1234567890',
                payment_terms: '30 gün vadeli',
                rating: 5,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Çimento & Kum Ltd.',
                contact_person: 'Mehmet Akar',
                phone: '0216 444 2222',
                email: 'satis@cimentokum.com',
                address: 'Pendik, İstanbul',
                tax_number: '0987654321',
                payment_terms: '15 gün vadeli',
                rating: 4,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Elektrik Malzemeleri San.',
                contact_person: 'Fatma Şen',
                phone: '0532 777 3333',
                email: 'info@elektrikmal.com',
                address: 'Ümraniye, İstanbul',
                tax_number: '5554443332',
                payment_terms: 'Peşin',
                rating: 5,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Bosch Tesisat Ltd.',
                contact_person: 'Kemal Demir',
                phone: '0212 888 4444',
                email: 'satis@boschtesisat.com',
                address: 'Bahçelievler, İstanbul',
                tax_number: '7778889990',
                payment_terms: '45 gün vadeli',
                rating: 5,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Cam & Alüminyum Tic.',
                contact_person: 'Zeynep Kara',
                phone: '0216 999 5555',
                email: 'info@camaluminyum.com',
                address: 'Kartal, İstanbul',
                tax_number: '3332221110',
                payment_terms: '30 gün vadeli',
                rating: 4,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Prestij Boya A.Ş.',
                contact_person: 'Hakan Arslan',
                phone: '0212 666 7777',
                email: 'siparis@prestijboya.com',
                address: 'Güngören, İstanbul',
                tax_number: '6665554443',
                payment_terms: '15 gün vadeli',
                rating: 4,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Seramik Dünyası Ltd.',
                contact_person: 'Elif Yurt',
                phone: '0216 777 8888',
                email: 'satis@seramikdunyasi.com',
                address: 'Ataşehir, İstanbul',
                tax_number: '9998887776',
                payment_terms: '30 gün vadeli',
                rating: 5,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Hilti Türkiye',
                contact_person: 'Murat Özkan',
                phone: '0212 555 9999',
                email: 'info@hilti.com.tr',
                address: 'Maslak, İstanbul',
                tax_number: '1112223334',
                payment_terms: 'Peşin',
                rating: 5,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Kale Kilit San.',
                contact_person: 'Ayşe Tekin',
                phone: '0216 444 1010',
                email: 'satis@kalekilit.com',
                address: 'Dudullu, İstanbul',
                tax_number: '4445556667',
                payment_terms: '30 gün vadeli',
                rating: 5,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Vitra Banyo',
                contact_person: 'Can Polat',
                phone: '0212 333 2020',
                email: 'info@vitra.com.tr',
                address: 'Bozüyük, Bilecik',
                tax_number: '7776665554',
                payment_terms: '45 gün vadeli',
                rating: 5,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Eca Endüstri',
                contact_person: 'Deniz Aydın',
                phone: '0216 222 3030',
                email: 'siparis@eca.com.tr',
                address: 'Gebze, Kocaeli',
                tax_number: '2223334445',
                payment_terms: '30 gün vadeli',
                rating: 4,
                isActive: true,
                userId: adminUser.id
            },
            {
                name: 'Marshall Boya',
                contact_person: 'Serkan Eren',
                phone: '0212 111 4040',
                email: 'info@marshallboya.com',
                address: 'Çerkezköy, Tekirdağ',
                tax_number: '8889990001',
                payment_terms: '15 gün vadeli',
                rating: 4,
                isActive: true,
                userId: adminUser.id
            }
        ]);
        console.log(`✅ ${suppliers.length} tedarikçi eklendi\n`);

        // ==================== 8. MALZEMELER ====================
        console.log('📦 Malzemeler ekleniyor...');
        const materials = await Material.bulkCreate([
            // İnşaat Demiri
            { name: 'Demir 8mm', category: 'İnşaat Demiri', unit: 'Ton', stock_quantity: 12.5, minimum_stock: 5, unit_price: 27500, supplier: suppliers[0].name, SupplierId: suppliers[0].id, userId: adminUser.id },
            { name: 'Demir 10mm', category: 'İnşaat Demiri', unit: 'Ton', stock_quantity: 18.2, minimum_stock: 7, unit_price: 28000, supplier: suppliers[0].name, SupplierId: suppliers[0].id, userId: adminUser.id },
            { name: 'Demir 12mm', category: 'İnşaat Demiri', unit: 'Ton', stock_quantity: 15.5, minimum_stock: 5, unit_price: 28500, supplier: suppliers[0].name, SupplierId: suppliers[0].id, userId: adminUser.id },
            { name: 'Demir 14mm', category: 'İnşaat Demiri', unit: 'Ton', stock_quantity: 9.8, minimum_stock: 4, unit_price: 28800, supplier: suppliers[0].name, SupplierId: suppliers[0].id, userId: adminUser.id },
            { name: 'Demir 16mm', category: 'İnşaat Demiri', unit: 'Ton', stock_quantity: 8.2, minimum_stock: 3, unit_price: 29200, supplier: suppliers[0].name, SupplierId: suppliers[0].id, userId: adminUser.id },
            { name: 'Demir 20mm', category: 'İnşaat Demiri', unit: 'Ton', stock_quantity: 6.5, minimum_stock: 2, unit_price: 29800, supplier: suppliers[0].name, SupplierId: suppliers[0].id, userId: adminUser.id },
            
            // Bağlayıcı Malzemeler
            { name: 'Çimento CEM I 42.5', category: 'Bağlayıcı', unit: 'Ton', stock_quantity: 85, minimum_stock: 30, unit_price: 3250, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            { name: 'Çimento CEM II', category: 'Bağlayıcı', unit: 'Ton', stock_quantity: 45, minimum_stock: 20, unit_price: 3100, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            { name: 'Beyaz Çimento', category: 'Bağlayıcı', unit: 'Ton', stock_quantity: 12, minimum_stock: 5, unit_price: 4500, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            { name: 'Alçı', category: 'Bağlayıcı', unit: 'Ton', stock_quantity: 25, minimum_stock: 10, unit_price: 1850, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            
            // Agregalar
            { name: 'İnce Kum', category: 'Agrega', unit: 'm³', stock_quantity: 180, minimum_stock: 60, unit_price: 180, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            { name: 'Kalın Kum', category: 'Agrega', unit: 'm³', stock_quantity: 120, minimum_stock: 50, unit_price: 200, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            { name: 'Çakıl 1-3cm', category: 'Agrega', unit: 'm³', stock_quantity: 95, minimum_stock: 40, unit_price: 220, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            { name: 'Çakıl 3-5cm', category: 'Agrega', unit: 'm³', stock_quantity: 65, minimum_stock: 30, unit_price: 240, supplier: suppliers[1].name, SupplierId: suppliers[1].id, userId: adminUser.id },
            
            // Elektrik Malzemeleri
            { name: 'Elektrik Kablosu 1.5mm', category: 'Elektrik', unit: 'Metre', stock_quantity: 3500, minimum_stock: 800, unit_price: 8.5, supplier: suppliers[2].name, SupplierId: suppliers[2].id, userId: adminUser.id },
            { name: 'Elektrik Kablosu 2.5mm', category: 'Elektrik', unit: 'Metre', stock_quantity: 2500, minimum_stock: 500, unit_price: 12.5, supplier: suppliers[2].name, SupplierId: suppliers[2].id, userId: adminUser.id },
            { name: 'Elektrik Kablosu 4mm', category: 'Elektrik', unit: 'Metre', stock_quantity: 1200, minimum_stock: 300, unit_price: 18.0, supplier: suppliers[2].name, SupplierId: suppliers[2].id, userId: adminUser.id },
            { name: 'Sigorta Kutusu', category: 'Elektrik', unit: 'Adet', stock_quantity: 150, minimum_stock: 40, unit_price: 125, supplier: suppliers[2].name, SupplierId: suppliers[2].id, userId: adminUser.id },
            { name: 'Priz', category: 'Elektrik', unit: 'Adet', stock_quantity: 800, minimum_stock: 200, unit_price: 15, supplier: suppliers[2].name, SupplierId: suppliers[2].id, userId: adminUser.id },
            { name: 'Anahtar', category: 'Elektrik', unit: 'Adet', stock_quantity: 650, minimum_stock: 150, unit_price: 18, supplier: suppliers[2].name, SupplierId: suppliers[2].id, userId: adminUser.id },
            
            // Tesisat Malzemeleri
            { name: 'PPR Boru 20mm', category: 'Tesisat', unit: 'Metre', stock_quantity: 850, minimum_stock: 200, unit_price: 12, supplier: suppliers[3].name, SupplierId: suppliers[3].id, userId: adminUser.id },
            { name: 'PPR Boru 25mm', category: 'Tesisat', unit: 'Metre', stock_quantity: 620, minimum_stock: 150, unit_price: 16, supplier: suppliers[3].name, SupplierId: suppliers[3].id, userId: adminUser.id },
            { name: 'PVC Atık Borusu 50mm', category: 'Tesisat', unit: 'Metre', stock_quantity: 480, minimum_stock: 120, unit_price: 22, supplier: suppliers[3].name, SupplierId: suppliers[3].id, userId: adminUser.id },
            { name: 'PVC Atık Borusu 110mm', category: 'Tesisat', unit: 'Metre', stock_quantity: 320, minimum_stock: 80, unit_price: 45, supplier: suppliers[3].name, SupplierId: suppliers[3].id, userId: adminUser.id },
            { name: 'Musluk - Banyo', category: 'Tesisat', unit: 'Adet', stock_quantity: 85, minimum_stock: 25, unit_price: 350, supplier: suppliers[3].name, SupplierId: suppliers[3].id, userId: adminUser.id },
            { name: 'Musluk - Mutfak', category: 'Tesisat', unit: 'Adet', stock_quantity: 65, minimum_stock: 20, unit_price: 420, supplier: suppliers[3].name, SupplierId: suppliers[3].id, userId: adminUser.id },
            
            // Cam ve Alüminyum
            { name: 'Cam 4mm Şeffaf', category: 'Cam', unit: 'm²', stock_quantity: 180, minimum_stock: 60, unit_price: 85, supplier: suppliers[4].name, SupplierId: suppliers[4].id, userId: adminUser.id },
            { name: 'Cam 6mm Şeffaf', category: 'Cam', unit: 'm²', stock_quantity: 120, minimum_stock: 40, unit_price: 115, supplier: suppliers[4].name, SupplierId: suppliers[4].id, userId: adminUser.id },
            { name: 'Temperli Cam 8mm', category: 'Cam', unit: 'm²', stock_quantity: 85, minimum_stock: 30, unit_price: 180, supplier: suppliers[4].name, SupplierId: suppliers[4].id, userId: adminUser.id },
            { name: 'Alüminyum Profil', category: 'Alüminyum', unit: 'Metre', stock_quantity: 950, minimum_stock: 250, unit_price: 45, supplier: suppliers[4].name, SupplierId: suppliers[4].id, userId: adminUser.id },
            
            // Boyalar
            { name: 'İç Cephe Boyası - Beyaz', category: 'Boya', unit: 'Litre', stock_quantity: 650, minimum_stock: 150, unit_price: 85, supplier: suppliers[5].name, SupplierId: suppliers[5].id, userId: adminUser.id },
            { name: 'İç Cephe Boyası - Renkli', category: 'Boya', unit: 'Litre', stock_quantity: 380, minimum_stock: 100, unit_price: 95, supplier: suppliers[5].name, SupplierId: suppliers[5].id, userId: adminUser.id },
            { name: 'Dış Cephe Boyası', category: 'Boya', unit: 'Litre', stock_quantity: 420, minimum_stock: 120, unit_price: 125, supplier: suppliers[5].name, SupplierId: suppliers[5].id, userId: adminUser.id },
            { name: 'Astar', category: 'Boya', unit: 'Litre', stock_quantity: 280, minimum_stock: 80, unit_price: 55, supplier: suppliers[5].name, SupplierId: suppliers[5].id, userId: adminUser.id },
            { name: 'Macun', category: 'Boya', unit: 'Kg', stock_quantity: 350, minimum_stock: 100, unit_price: 35, supplier: suppliers[5].name, SupplierId: suppliers[5].id, userId: adminUser.id },
            
            // Seramik & Fayans
            { name: 'Yer Seramiği 60x60', category: 'Seramik', unit: 'm²', stock_quantity: 850, minimum_stock: 200, unit_price: 145, supplier: suppliers[6].name, SupplierId: suppliers[6].id, userId: adminUser.id },
            { name: 'Duvar Fayansı 30x60', category: 'Fayans', unit: 'm²', stock_quantity: 620, minimum_stock: 150, unit_price: 95, supplier: suppliers[6].name, SupplierId: suppliers[6].id, userId: adminUser.id },
            { name: 'Porselen Seramik 80x80', category: 'Seramik', unit: 'm²', stock_quantity: 280, minimum_stock: 80, unit_price: 280, supplier: suppliers[6].name, SupplierId: suppliers[6].id, userId: adminUser.id },
            { name: 'Seramik Yapıştırıcı', category: 'Yapıştırıcı', unit: 'Kg', stock_quantity: 1200, minimum_stock: 300, unit_price: 18, supplier: suppliers[6].name, SupplierId: suppliers[6].id, userId: adminUser.id },
            { name: 'Derz Dolgusu', category: 'Yapıştırıcı', unit: 'Kg', stock_quantity: 450, minimum_stock: 120, unit_price: 25, supplier: suppliers[6].name, SupplierId: suppliers[6].id, userId: adminUser.id },
            
            // Hırdavat
            { name: 'Çivi 3"', category: 'Hırdavat', unit: 'Kg', stock_quantity: 180, minimum_stock: 50, unit_price: 45, supplier: suppliers[7].name, SupplierId: suppliers[7].id, userId: adminUser.id },
            { name: 'Vida 6mm', category: 'Hırdavat', unit: 'Kutu', stock_quantity: 250, minimum_stock: 80, unit_price: 35, supplier: suppliers[7].name, SupplierId: suppliers[7].id, userId: adminUser.id },
            { name: 'Dübel', category: 'Hırdavat', unit: 'Kutu', stock_quantity: 320, minimum_stock: 100, unit_price: 28, supplier: suppliers[7].name, SupplierId: suppliers[7].id, userId: adminUser.id },
            { name: 'Silikon', category: 'Hırdavat', unit: 'Adet', stock_quantity: 150, minimum_stock: 40, unit_price: 18, supplier: suppliers[7].name, SupplierId: suppliers[7].id, userId: adminUser.id }
        ]);
        console.log(`✅ ${materials.length} malzeme eklendi\n`);

        // ==================== 9. EKİPMAN ====================
        console.log('🚜 Ekipmanlar ekleniyor...');
        const equipment = await Equipment.bulkCreate([
            // Vinçler
            { name: 'Vinç - Kule Tipi 40m', type: 'Vinç', serial_number: 'VNC-2021-001', purchase_date: new Date('2021-05-15'), purchase_price: 1250000, daily_rental_cost: 5500, condition: 'İyi', location: 'Lale Residence Şantiyesi', isAvailable: false, userId: adminUser.id },
            { name: 'Vinç - Kule Tipi 50m', type: 'Vinç', serial_number: 'VNC-2022-008', purchase_date: new Date('2022-03-10'), purchase_price: 1450000, daily_rental_cost: 6200, condition: 'Mükemmel', location: 'Boğaz View Şantiyesi', isAvailable: false, userId: adminUser.id },
            { name: 'Vinç - Mobil 25m', type: 'Vinç', serial_number: 'VNC-2020-015', purchase_date: new Date('2020-08-22'), purchase_price: 850000, daily_rental_cost: 3800, condition: 'İyi', location: 'Depo', isAvailable: true, userId: adminUser.id },
            
            // Ekskavatörler
            { name: 'Ekskavatör CAT 320', type: 'Ekskavatör', serial_number: 'EKS-2020-045', purchase_date: new Date('2020-08-10'), purchase_price: 850000, daily_rental_cost: 3200, condition: 'Mükemmel', location: 'Depo', isAvailable: true, userId: adminUser.id },
            { name: 'Ekskavatör Hyundai R140', type: 'Ekskavatör', serial_number: 'EKS-2021-062', purchase_date: new Date('2021-06-15'), purchase_price: 720000, daily_rental_cost: 2800, condition: 'İyi', location: 'Pendik Fabrika Şantiyesi', isAvailable: false, userId: adminUser.id },
            { name: 'Mini Ekskavatör', type: 'Ekskavatör', serial_number: 'EKS-2022-078', purchase_date: new Date('2022-04-20'), purchase_price: 380000, daily_rental_cost: 1500, condition: 'Mükemmel', location: 'Sarıyer Villaları', isAvailable: false, userId: adminUser.id },
            
            // Kamyonlar
            { name: 'Kamyon - Mercedes 3232', type: 'Kamyon', serial_number: 'KMY-2022-012', purchase_date: new Date('2022-03-20'), purchase_price: 1500000, daily_rental_cost: 2800, condition: 'İyi', location: 'Boğaz View Şantiyesi', isAvailable: false, userId: adminUser.id },
            { name: 'Kamyon - Ford Cargo 2532', type: 'Kamyon', serial_number: 'KMY-2021-028', purchase_date: new Date('2021-07-12'), purchase_price: 1350000, daily_rental_cost: 2600, condition: 'İyi', location: 'Ataşehir AVM', isAvailable: false, userId: adminUser.id },
            { name: 'Damperli Kamyon', type: 'Kamyon', serial_number: 'KMY-2020-034', purchase_date: new Date('2020-11-05'), purchase_price: 980000, daily_rental_cost: 2200, condition: 'Orta', location: 'Depo', isAvailable: true, userId: adminUser.id },
            
            // Forklifler
            { name: 'Forklift 3 Ton', type: 'Forklift', serial_number: 'FRK-2019-089', purchase_date: new Date('2019-05-10'), purchase_price: 180000, daily_rental_cost: 850, condition: 'Orta', location: 'Depo', isAvailable: true, userId: adminUser.id },
            { name: 'Forklift 5 Ton', type: 'Forklift', serial_number: 'FRK-2021-095', purchase_date: new Date('2021-09-15'), purchase_price: 280000, daily_rental_cost: 1200, condition: 'İyi', location: 'Pendik Fabrika', isAvailable: false, userId: adminUser.id },
            
            // Jeneratörler
            { name: 'Jeneratör 100 KVA', type: 'Jeneratör', serial_number: 'JEN-2022-101', purchase_date: new Date('2022-01-08'), purchase_price: 220000, daily_rental_cost: 950, condition: 'Mükemmel', location: 'Lale Residence', isAvailable: false, userId: adminUser.id },
            { name: 'Jeneratör 150 KVA', type: 'Jeneratör', serial_number: 'JEN-2021-118', purchase_date: new Date('2021-11-20'), purchase_price: 350000, daily_rental_cost: 1400, condition: 'İyi', location: 'Boğaz View', isAvailable: false, userId: adminUser.id },
            { name: 'Jeneratör 50 KVA', type: 'Jeneratör', serial_number: 'JEN-2020-125', purchase_date: new Date('2020-06-14'), purchase_price: 120000, daily_rental_cost: 650, condition: 'İyi', location: 'Depo', isAvailable: true, userId: adminUser.id },
            
            // Beton Pompası
            { name: 'Beton Pompası 42m', type: 'Beton Pompası', serial_number: 'BTP-2021-132', purchase_date: new Date('2021-02-18'), purchase_price: 980000, daily_rental_cost: 4200, condition: 'İyi', location: 'Beylikdüzü Rezidans', isAvailable: false, userId: adminUser.id },
            { name: 'Beton Pompası 52m', type: 'Beton Pompası', serial_number: 'BTP-2022-145', purchase_date: new Date('2022-08-05'), purchase_price: 1250000, daily_rental_cost: 5100, condition: 'Mükemmel', location: 'Ataşehir AVM', isAvailable: false, userId: adminUser.id },
            
            // Kompresörler
            { name: 'Kompresör 10 Bar', type: 'Kompresör', serial_number: 'KMP-2020-152', purchase_date: new Date('2020-09-22'), purchase_price: 85000, daily_rental_cost: 420, condition: 'İyi', location: 'Depo', isAvailable: true, userId: adminUser.id },
            { name: 'Kompresör 15 Bar', type: 'Kompresör', serial_number: 'KMP-2021-168', purchase_date: new Date('2021-04-12'), purchase_price: 125000, daily_rental_cost: 580, condition: 'Mükemmel', location: 'Lale Residence', isAvailable: false, userId: adminUser.id },
            
            // İskele ve Kalıp Sistemleri
            { name: 'İskele Sistemi 500m²', type: 'İskele', serial_number: 'ISK-2019-175', purchase_date: new Date('2019-03-15'), purchase_price: 450000, daily_rental_cost: 1800, condition: 'İyi', location: 'Boğaz View', isAvailable: false, userId: adminUser.id },
            { name: 'Alüminyum Kalıp Sistemi', type: 'Kalıp', serial_number: 'KLP-2020-182', purchase_date: new Date('2020-07-20'), purchase_price: 680000, daily_rental_cost: 2500, condition: 'İyi', location: 'Beylikdüzü Rezidans', isAvailable: false, userId: adminUser.id },
            
            // Diğer Ekipmanlar
            { name: 'Silindir Kamyon', type: 'Silindir', serial_number: 'SLN-2021-189', purchase_date: new Date('2021-10-08'), purchase_price: 420000, daily_rental_cost: 1650, condition: 'İyi', location: 'Depo', isAvailable: true, userId: adminUser.id },
            { name: 'Greyder', type: 'Greyder', serial_number: 'GRD-2020-196', purchase_date: new Date('2020-12-12'), purchase_price: 650000, daily_rental_cost: 2400, condition: 'Orta', location: 'Depo', isAvailable: true, userId: adminUser.id },
            { name: 'Buldozer', type: 'Buldozer', serial_number: 'BLD-2019-203', purchase_date: new Date('2019-08-25'), purchase_price: 850000, daily_rental_cost: 3200, condition: 'Orta', location: 'Pendik Fabrika', isAvailable: false, userId: adminUser.id },
            { name: 'Loder', type: 'Loder', serial_number: 'LDR-2022-210', purchase_date: new Date('2022-05-18'), purchase_price: 720000, daily_rental_cost: 2800, condition: 'Mükemmel', location: 'Depo', isAvailable: true, userId: adminUser.id }
        ]);
        console.log(`✅ ${equipment.length} ekipman eklendi\n`);

        // ==================== 10. DÖKÜMANLAR ====================
        console.log('📄 Dökümanlar ekleniyor...');
        const documents = await Document.bulkCreate([
            // Lale Residence dökümanları
            { title: 'İnşaat Ruhsatı', type: 'Ruhsat', file_name: 'insaat_ruhsati_lale.pdf', file_size: 2048000, description: 'Belediye onaylı inşaat ruhsatı', ProjectId: projects[0].id, uploaded_by: adminUser.id },
            { title: 'Mimari Proje', type: 'Plan/Proje', file_name: 'mimari_proje_lale_v3.dwg', file_size: 8192000, description: 'Onaylı mimari proje dosyası', ProjectId: projects[0].id, uploaded_by: adminUser.id },
            { title: 'Statik Proje', type: 'Plan/Proje', file_name: 'statik_proje_lale.pdf', file_size: 5120000, description: 'Statik hesaplamalar ve çizimler', ProjectId: projects[0].id, uploaded_by: adminUser.id },
            { title: 'Elektrik Projesi', type: 'Plan/Proje', file_name: 'elektrik_lale.dwg', file_size: 3072000, ProjectId: projects[0].id, uploaded_by: adminUser.id },
            
            // Boğaz View dökümanları
            { title: 'Yapı Kullanma İzni', type: 'Ruhsat', file_name: 'yapi_kullanma_bogazview.pdf', file_size: 1536000, ProjectId: projects[1].id, uploaded_by: adminUser.id },
            { title: 'Zemin Etüd Raporu', type: 'Rapor', file_name: 'zemin_etud_bogazview.pdf', file_size: 4096000, description: 'Jeolojik araştırma raporu', ProjectId: projects[1].id, uploaded_by: adminUser.id },
            { title: 'Çevre Düzeni Planı', type: 'Plan/Proje', file_name: 'cevre_duzeni.pdf', file_size: 2560000, ProjectId: projects[1].id, uploaded_by: adminUser.id },
            { title: 'Mekanik Proje', type: 'Plan/Proje', file_name: 'mekanik_proje_bogazview.dwg', file_size: 6144000, ProjectId: projects[1].id, uploaded_by: adminUser.id },
            
            // Sarıyer Villaları dökümanları
            { title: 'İmar Durumu', type: 'Ruhsat', file_name: 'imar_durumu_sariyer.pdf', file_size: 1024000, ProjectId: projects[2].id, uploaded_by: adminUser.id },
            { title: 'Peyzaj Projesi', type: 'Plan/Proje', file_name: 'peyzaj_sariyer.dwg', file_size: 7168000, description: 'Bahçe ve dış mekan düzenlemeleri', ProjectId: projects[2].id, uploaded_by: adminUser.id },
            { title: 'Yangın Güvenlik Raporu', type: 'Rapor', file_name: 'yangin_guvenlik.pdf', file_size: 2048000, ProjectId: projects[2].id, uploaded_by: adminUser.id },
            
            // Ataşehir AVM dökümanları
            { title: 'AVM İnşaat Ruhsatı', type: 'Ruhsat', file_name: 'avm_ruhsat.pdf', file_size: 3072000, ProjectId: projects[4].id, uploaded_by: adminUser.id },
            { title: 'Çelik Konstrüksiyon Projesi', type: 'Plan/Proje', file_name: 'celik_konstruksiyon_avm.dwg', file_size: 12288000, ProjectId: projects[4].id, uploaded_by: adminUser.id },
            { title: 'HVAC Projesi', type: 'Plan/Proje', file_name: 'hvac_avm.pdf', file_size: 5120000, description: 'Isıtma, soğutma ve havalandırma', ProjectId: projects[4].id, uploaded_by: adminUser.id },
            
            // Genel dökümanlar
            { title: 'Firma İmza Sirküleri', type: 'Sözleşme', file_name: 'imza_sirkuleri.pdf', file_size: 512000, uploaded_by: adminUser.id },
            { title: 'Vergi Levhası', type: 'Belge', file_name: 'vergi_levhasi.pdf', file_size: 256000, uploaded_by: adminUser.id }
        ]);
        console.log(`✅ ${documents.length} döküman eklendi\n`);

        // ==================== 11. AUDIT LOG ====================
        console.log('📝 Audit logları ekleniyor...');
        const auditLogs = await AuditLog.bulkCreate([
            // Kullanıcı giriş/çıkış kayıtları
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'LOGIN',
                entity: 'User',
                entityId: adminUser.id,
                description: 'Sistem yöneticisi giriş yaptı',
                ipAddress: '192.168.1.100',
                status: 'success'
            },
            {
                userId: regularUser.id,
                userName: regularUser.name,
                action: 'LOGIN',
                entity: 'User',
                entityId: regularUser.id,
                description: 'Ahmet Yılmaz giriş yaptı',
                ipAddress: '192.168.1.105',
                status: 'success'
            },
            
            // Proje işlemleri
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Project',
                entityId: projects[0].id,
                description: `Yeni proje oluşturuldu: "${projects[0].name}"`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Project',
                entityId: projects[1].id,
                description: `Yeni proje oluşturuldu: "${projects[1].name}"`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'UPDATE',
                entity: 'Project',
                entityId: projects[0].id,
                description: 'Proje durumu "devam ediyor" olarak güncellendi',
                status: 'success'
            },
            
            // Çalışan işlemleri
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Employee',
                entityId: employees[0].id,
                description: `Yeni çalışan eklendi: ${employees[0].first_name} ${employees[0].last_name}`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Employee',
                entityId: employees[5].id,
                description: `Yeni çalışan eklendi: ${employees[5].first_name} ${employees[5].last_name}`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'UPDATE',
                entity: 'Employee',
                entityId: employees[29].id,
                description: 'Çalışan durumu "pasif" olarak değiştirildi',
                status: 'success'
            },
            
            // Harcama kayıtları
            {
                userId: regularUser.id,
                userName: regularUser.name,
                action: 'CREATE',
                entity: 'Expense',
                entityId: expenses[0].id,
                description: `Malzeme harcaması eklendi - ${expenses[0].amount} TL`,
                status: 'success'
            },
            {
                userId: regularUser.id,
                userName: regularUser.name,
                action: 'CREATE',
                entity: 'Expense',
                entityId: expenses[5].id,
                description: `Maaş ödemesi kaydedildi - ${expenses[5].amount} TL`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'UPDATE',
                entity: 'Expense',
                entityId: expenses[0].id,
                description: 'Harcama onaylandı',
                status: 'success'
            },
            
            // Malzeme işlemleri
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Material',
                entityId: materials[0].id,
                description: `Yeni malzeme eklendi: ${materials[0].name}`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Material',
                entityId: materials[10].id,
                description: `Yeni malzeme eklendi: ${materials[10].name}`,
                status: 'success'
            },
            {
                userId: regularUser.id,
                userName: regularUser.name,
                action: 'UPDATE',
                entity: 'Material',
                entityId: materials[0].id,
                description: `Stok miktarı güncellendi: ${materials[0].current_stock} ${materials[0].unit}`,
                status: 'success'
            },
            
            // Ekipman işlemleri
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Equipment',
                entityId: equipment[0].id,
                description: `Yeni ekipman satın alındı: ${equipment[0].name}`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Equipment',
                entityId: equipment[5].id,
                description: `Yeni ekipman satın alındı: ${equipment[5].name}`,
                status: 'success'
            },
            {
                userId: regularUser.id,
                userName: regularUser.name,
                action: 'UPDATE',
                entity: 'Equipment',
                entityId: equipment[0].id,
                description: 'Ekipman kiraya verildi',
                status: 'success'
            },
            
            // Tedarikçi işlemleri
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Supplier',
                entityId: suppliers[0].id,
                description: `Yeni tedarikçi eklendi: ${suppliers[0].name}`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Supplier',
                entityId: suppliers[7].id,
                description: `Yeni tedarikçi eklendi: ${suppliers[7].name}`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'UPDATE',
                entity: 'Supplier',
                entityId: suppliers[0].id,
                description: `Tedarikçi değerlendirmesi güncellendi: ${suppliers[0].rating}/5`,
                status: 'success'
            },
            
            // Döküman işlemleri
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Document',
                entityId: documents[0].id,
                description: `Yeni döküman yüklendi: ${documents[0].title}`,
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'CREATE',
                entity: 'Document',
                entityId: documents[1].id,
                description: `Yeni döküman yüklendi: ${documents[1].title}`,
                status: 'success'
            },
            
            // Sistem işlemleri
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'UPDATE',
                entity: 'Settings',
                entityId: 1,
                description: 'Sistem ayarları güncellendi',
                status: 'success'
            },
            {
                userId: adminUser.id,
                userName: adminUser.name,
                action: 'LOGOUT',
                entity: 'User',
                entityId: adminUser.id,
                description: 'Sistem yöneticisi çıkış yaptı',
                ipAddress: '192.168.1.100',
                status: 'success'
            }
        ]);
        console.log(`✅ ${auditLogs.length} audit log eklendi\n`);

        // ÖZET
        console.log('\n' + '='.repeat(60));
        console.log('✨ VERİTABANI BAŞARIYLA OLUŞTURULDU VE DOLDURULDU! ✨');
        console.log('='.repeat(60));
        console.log(`
📊 ÖZET:
   • ${users.length} Kullanıcı
   • ${roles.length} Rol
   • ${projects.length} Proje
   • ${employees.length} Çalışan
   • ${attendances.length} Yoklama kaydı
   • ${expenses.length} Harcama kaydı
   • ${suppliers.length} Tedarikçi
   • ${materials.length} Malzeme
   • ${equipment.length} Ekipman
   • ${documents.length} Döküman
   • ${auditLogs.length} Audit Log

🔑 GİRİŞ BİLGİLERİ:
   Email: admin@insaat.com
   Şifre: admin123

🚀 Backend'i başlatabilirsiniz: npm run dev
        `);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ HATA:', error);
        console.error('\nDetaylar:', error.message);
        process.exit(1);
    }
}

// Script'i çalıştır
resetDatabase();

