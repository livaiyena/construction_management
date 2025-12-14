// backend/seed.js - Örnek Veri Yükleme Scripti
const { sequelize } = require('./config/db');
const bcrypt = require('bcryptjs');
const models = require('./models');

const {
    User,
    Project,
    Employee,
    Role,
    Attendance,
    Expense,
    Supplier,
    Material,
    Equipment,
    Setting
} = models;

async function seedDatabase() {
    try {
        console.log('🌱 Seed işlemi başlatılıyor...');

        // Admin kullanıcı kontrolü
        let adminUser = await User.findOne({ where: { email: 'admin@insaat.com' } });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            adminUser = await User.create({
                name: 'Admin',
                username: 'admin',
                email: 'admin@insaat.com',
                password: hashedPassword
            });
            console.log('✅ Admin kullanıcı oluşturuldu');
        }

        // ==================== ROLLER ====================
        const roles = [
            { name: 'Şantiye Şefi', default_daily_rate: 850, userId: adminUser.id },
            { name: 'Mimar', default_daily_rate: 750, userId: adminUser.id },
            { name: 'İnşaat Mühendisi', default_daily_rate: 700, userId: adminUser.id },
            { name: 'Elektrik Ustası', default_daily_rate: 600, userId: adminUser.id },
            { name: 'Sıhhi Tesisat Ustası', default_daily_rate: 550, userId: adminUser.id },
            { name: 'Kalıpçı Ustası', default_daily_rate: 500, userId: adminUser.id },
            { name: 'Demir Ustası', default_daily_rate: 480, userId: adminUser.id },
            { name: 'Duvarcı', default_daily_rate: 450, userId: adminUser.id },
            { name: 'Sıvacı', default_daily_rate: 420, userId: adminUser.id },
            { name: 'Boyacı', default_daily_rate: 400, userId: adminUser.id },
            { name: 'İşçi', default_daily_rate: 350, userId: adminUser.id },
            { name: 'Güvenlik Görevlisi', default_daily_rate: 380, userId: adminUser.id },
            { name: 'Temizlik Görevlisi', default_daily_rate: 320, userId: adminUser.id }
        ];

        const createdRoles = [];
        for (const roleData of roles) {
            const [role] = await Role.findOrCreate({
                where: { name: roleData.name },
                defaults: roleData
            });
            createdRoles.push(role);
        }
        console.log(`✅ ${createdRoles.length} rol oluşturuldu/kontrol edildi`);

        // ==================== PROJELER ====================
        const projects = [
            {
                name: 'Lale Residence Konut Projesi',
                description: 'Kadıköy bölgesinde 8 katlı, 32 daireli lüks konut projesi',
                city: 'İstanbul',
                district: 'Kadıköy',
                address: 'Caferağa Mahallesi, Moda Caddesi No: 45',
                budget: 18500000,
                start_date: new Date('2024-06-01'),
                end_date: new Date('2026-03-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Boğaz View İş Merkezi',
                description: '20 katlı A+ ofis binası, Boğaz manzaralı',
                city: 'İstanbul',
                district: 'Beşiktaş',
                address: 'Levent Mahallesi, Büyükdere Caddesi No: 201',
                budget: 45000000,
                start_date: new Date('2024-03-15'),
                end_date: new Date('2027-12-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Sarıyer Villaları',
                description: '12 adet müstakil villa projesi',
                city: 'İstanbul',
                district: 'Sarıyer',
                address: 'Tarabya Mahallesi, Kireçburnu Yolu No: 34',
                budget: 28000000,
                start_date: new Date('2023-09-01'),
                end_date: new Date('2025-08-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Gümüş Plaza İş Merkezi',
                description: '15 katlı modern ofis binası',
                city: 'Ankara',
                district: 'Çankaya',
                address: 'Kavaklıdere Mahallesi, Atatürk Bulvarı No: 120',
                budget: 22000000,
                start_date: new Date('2024-09-15'),
                end_date: new Date('2027-06-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Eryaman Yeşiltepe Sitesi',
                description: '5 blok, toplam 120 daireli konut sitesi',
                city: 'Ankara',
                district: 'Etimesgut',
                address: 'Eryaman Mahallesi, 312. Cadde No: 78',
                budget: 16500000,
                start_date: new Date('2023-03-01'),
                end_date: new Date('2025-06-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Karşıyaka Sahil Evleri',
                description: 'Deniz manzaralı 6 katlı butik konut',
                city: 'İzmir',
                district: 'Karşıyaka',
                address: 'Bostanlı Mahallesi, Cemal Gürsel Caddesi No: 156',
                budget: 14000000,
                start_date: new Date('2024-04-20'),
                end_date: new Date('2026-02-28'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Bornova Teknokent Binası',
                description: 'Ege Üniversitesi Teknoloji Geliştirme Bölgesi - Ofis',
                city: 'İzmir',
                district: 'Bornova',
                address: 'Kazımdirik Mahallesi, İnönü Caddesi No: 89',
                budget: 19500000,
                start_date: new Date('2024-01-10'),
                end_date: new Date('2025-12-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Nilüfer AVM Yenileme',
                description: 'Mevcut alışveriş merkezinin modernizasyon çalışması',
                city: 'Bursa',
                district: 'Nilüfer',
                address: 'Ataevler Mahallesi, Ankara Yolu Caddesi No: 250',
                budget: 9800000,
                start_date: new Date('2024-02-01'),
                end_date: new Date('2024-11-30'),
                status: 'Tamamlandı',
                userId: adminUser.id
            },
            {
                name: 'Muratpaşa Eğitim Kampüsü',
                description: '32 derslikli ilköğretim okulu + spor salonu',
                city: 'Antalya',
                district: 'Muratpaşa',
                address: 'Meltem Mahallesi, Dumlupınar Bulvarı No: 67',
                budget: 12300000,
                start_date: new Date('2024-02-01'),
                end_date: new Date('2025-08-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            }
        ];

        const createdProjects = [];
        for (const projectData of projects) {
            const [project] = await Project.findOrCreate({
                where: { name: projectData.name },
                defaults: projectData
            });
            createdProjects.push(project);
        }
        console.log(`✅ ${createdProjects.length} proje oluşturuldu`);

        // ==================== ÇALIŞANLAR ====================
        const employees = [
            { name: 'Mehmet Yılmaz', phone: '+905321112233', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[0].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Ayşe Kara', phone: '+905332223344', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[1].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Ahmet Demir', phone: '+905343334455', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[2].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Fatma Aydın', phone: '+905354445566', address: 'Eryaman/Ankara', status: 'Aktif', RoleId: createdRoles[2].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Ali Şahin', phone: '+905365556677', address: 'Ulus/Ankara', status: 'Aktif', RoleId: createdRoles[3].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Zeynep Çelik', phone: '+905376667788', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[4].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Mustafa Arslan', phone: '+905387778899', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[5].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Elif Özkan', phone: '+905398889900', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[6].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Hasan Yıldız', phone: '+905329990011', address: 'Eryaman/Ankara', status: 'Aktif', RoleId: createdRoles[7].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Merve Koç', phone: '+905330001122', address: 'Ulus/Ankara', status: 'Aktif', RoleId: createdRoles[8].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Emre Aksoy', phone: '+905341122233', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[9].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Selin Güneş', phone: '+905352223344', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Burak Tekin', phone: '+905363344455', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Deniz Polat', phone: '+905374455566', address: 'Eryaman/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Can Erdem', phone: '+905385556677', address: 'Ulus/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Gizem Acar', phone: '+905396667788', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[11].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Oğuz Eren', phone: '+905327778899', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[11].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Ece Yavuz', phone: '+905338889900', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[12].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Barış Öztürk', phone: '+905349900011', address: 'Eryaman/Ankara', status: 'İzinli', RoleId: createdRoles[10].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Seda Kurt', phone: '+905350001122', address: 'Ulus/Ankara', status: 'Pasif', RoleId: createdRoles[10].id, ProjectId: null, userId: adminUser.id }
        ];

        const createdEmployees = [];
        for (const empData of employees) {
            const [employee] = await Employee.findOrCreate({
                where: { phone: empData.phone },
                defaults: empData
            });
            createdEmployees.push(employee);
        }
        console.log(`✅ ${createdEmployees.length} çalışan oluşturuldu`);

        // ==================== AYARLAR ====================
        await Setting.findOrCreate({
            where: { key: 'registration_enabled' },
            defaults: {
                key: 'registration_enabled',
                value: 'false',
                description: 'Yeni üye kaydı açık mı? (true/false)'
            }
        });
        console.log('✅ Ayarlar kontrol edildi/oluşturuldu');

        // ==================== TEDARİKÇİLER ====================
        const suppliers = [
            { name: 'Akçelik İnşaat Malzemeleri', contact_person: 'İbrahim Akçelik', phone: '+90 312 444 55 66', email: 'info@akcelik.com', address: 'Ostim/Ankara', userId: adminUser.id },
            { name: 'Demirtaş Hırdavat', contact_person: 'Hakan Demirtaş', phone: '+90 312 555 66 77', email: 'demirtas@hirdavat.com', address: 'İvedik/Ankara', userId: adminUser.id },
            { name: 'Bayrak Elektrik', contact_person: 'Mehmet Bayrak', phone: '+90 312 666 77 88', email: 'bayrak@elektrik.com', address: 'Demetevler/Ankara', userId: adminUser.id }
        ];

        const createdSuppliers = [];
        for (const supplierData of suppliers) {
            const [supplier] = await Supplier.findOrCreate({
                where: { name: supplierData.name },
                defaults: supplierData
            });
            createdSuppliers.push(supplier);
        }
        console.log(`✅ ${createdSuppliers.length} tedarikçi oluşturuldu`);

        // ==================== MALZEMELER ====================
        const materials = [
            { name: 'Çimento (50kg)', unit: 'Çuval', unit_price: 185.50, stock_quantity: 500, SupplierId: createdSuppliers[0].id, userId: adminUser.id },
            { name: 'Demir (Ø12)', unit: 'Ton', unit_price: 22500, stock_quantity: 15, SupplierId: createdSuppliers[0].id, userId: adminUser.id },
            { name: 'Tuğla (Delikli)', unit: 'Adet', unit_price: 4.75, stock_quantity: 12000, SupplierId: createdSuppliers[0].id, userId: adminUser.id },
            { name: 'Elektrik Kablosu (2.5mm)', unit: 'Metre', unit_price: 12.30, stock_quantity: 2500, SupplierId: createdSuppliers[2].id, userId: adminUser.id },
            { name: 'PVC Boru (110mm)', unit: 'Metre', unit_price: 45.80, stock_quantity: 800, SupplierId: createdSuppliers[1].id, userId: adminUser.id }
        ];

        const createdMaterials = [];
        for (const materialData of materials) {
            const [material] = await Material.findOrCreate({
                where: { name: materialData.name },
                defaults: materialData
            });
            createdMaterials.push(material);
        }
        console.log(`✅ ${createdMaterials.length} malzeme oluşturuldu`);

        // ==================== EKİPMANLAR ====================
        const equipments = [
            { name: 'Kazıcı Kepçe', model: 'CAT 320D', serial_number: 'CAT2024001', purchase_date: new Date('2023-05-15'), status: 'Çalışıyor', userId: adminUser.id },
            { name: 'Vinç (20 Ton)', model: 'Liebherr LTM', serial_number: 'LIE2023045', purchase_date: new Date('2022-11-20'), status: 'Çalışıyor', userId: adminUser.id },
            { name: 'Beton Mikseri', model: 'Zoomlion ZM60', serial_number: 'ZOO2024012', purchase_date: new Date('2024-01-10'), status: 'Çalışıyor', userId: adminUser.id },
            { name: 'Jeneratör (100kW)', model: 'Cummins C100D5', serial_number: 'CUM2023089', purchase_date: new Date('2023-08-05'), status: 'Bakımda', userId: adminUser.id }
        ];

        const createdEquipments = [];
        for (const equipData of equipments) {
            const [equipment] = await Equipment.findOrCreate({
                where: { serial_number: equipData.serial_number },
                defaults: equipData
            });
            createdEquipments.push(equipment);
        }
        console.log(`✅ ${createdEquipments.length} ekipman oluşturuldu`);

        // ==================== YOKLAMA KAYITLARI ====================
        const attendanceRecords = [];
        const today = new Date();

        // Son 60 gün için yoklama kayıtları - TÜM çalışanlar için
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Tüm çalışanlar için yoklama kaydı oluştur
            for (const employee of createdEmployees) {
                if (!employee.ProjectId) continue;

                // Hafta sonu kontrolü
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Pazar=0, Cumartesi=6

                // %80 geldi, %10 gelmedi, %10 izinli
                const rand = Math.random();
                let randomStatus;
                if (rand < 0.80) randomStatus = 'Geldi';
                else if (rand < 0.90) randomStatus = 'Gelmedi';
                else randomStatus = 'İzinli';

                attendanceRecords.push({
                    EmployeeId: employee.id,
                    ProjectId: employee.ProjectId,
                    date: dateStr,
                    status: randomStatus,
                    worked_hours: randomStatus === 'Geldi' ? (8 + Math.floor(Math.random() * 3)) : 0,
                    overtime_hours: randomStatus === 'Geldi' && Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
                    userId: adminUser.id
                });
            }
        }

        await Attendance.bulkCreate(attendanceRecords, { ignoreDuplicates: true });
        console.log(`✅ ${attendanceRecords.length} yoklama kaydı oluşturuldu`);

        // ==================== HARCAMALAR ====================
        const expenses = [];
        const categories = ['Malzeme', 'Maaş', 'Ekipman', 'Ulaşım', 'Yemek', 'Diğer'];
        const paymentMethods = ['Nakit', 'Kredi Kartı', 'Havale', 'Çek'];
        const statuses = ['Ödendi', 'Ödendi', 'Ödendi', 'Onaylandı', 'Beklemede'];

        // Son 6 ay için harcamalar
        for (let month = 0; month < 6; month++) {
            const expenseDate = new Date(today);
            expenseDate.setMonth(expenseDate.getMonth() - month);

            // Her proje için harcama
            for (const project of createdProjects) {
                // Her ay 3-5 harcama kaydı
                const recordCount = 3 + Math.floor(Math.random() * 3);

                for (let i = 0; i < recordCount; i++) {
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    let amount;

                    // Kategoriye göre tutar
                    if (category === 'Maaş') amount = 50000 + Math.floor(Math.random() * 100000);
                    else if (category === 'Malzeme') amount = 20000 + Math.floor(Math.random() * 80000);
                    else if (category === 'Ekipman') amount = 15000 + Math.floor(Math.random() * 50000);
                    else if (category === 'Ulaşım') amount = 5000 + Math.floor(Math.random() * 20000);
                    else if (category === 'Yemek') amount = 3000 + Math.floor(Math.random() * 10000);
                    else amount = 2000 + Math.floor(Math.random() * 15000);

                    expenses.push({
                        ProjectId: project.id,
                        category: category,
                        description: `${category} gideri - ${expenseDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`,
                        amount: amount,
                        expense_date: new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 5 + Math.floor(Math.random() * 20)),
                        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        userId: adminUser.id
                    });
                }
            }
        }

        await Expense.bulkCreate(expenses, { ignoreDuplicates: true });
        console.log(`✅ ${expenses.length} harcama kaydı oluşturuldu`);

        console.log('\n🎉 Seed işlemi başarıyla tamamlandı!\n');
        console.log('📊 Oluşturulan Veriler:');
        console.log(`   - ${createdRoles.length} Rol`);
        console.log(`   - ${createdProjects.length} Proje`);
        console.log(`   - ${createdEmployees.length} Çalışan`);
        console.log(`   - ${createdSuppliers.length} Tedarikçi`);
        console.log(`   - ${createdMaterials.length} Malzeme`);
        console.log(`   - ${createdEquipments.length} Ekipman`);
        console.log(`   - ${attendanceRecords.length} Yoklama Kaydı`);
        console.log(`   - ${expenses.length} Harcama Kaydı\n`);

    } catch (error) {
        console.error('❌ Seed hatası:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Script çalıştır
seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
