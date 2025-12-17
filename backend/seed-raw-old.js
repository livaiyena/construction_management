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

const cities = [
    { name: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Sarıyer', 'Ümraniye', 'Maltepe', 'Kartal', 'Pendik'] },
    { name: 'Ankara', districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan'] },
    { name: 'İzmir', districts: ['Bornova', 'Konak', 'Karşıyaka', 'Buca', 'Çiğli', 'Bayraklı'] },
    { name: 'Bursa', districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya'] },
    { name: 'Antalya', districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat'] }
];

async function seed() {
    try {
        console.log('\n🌱 GELİŞMİŞ SEED İŞLEMİ BAŞLATILIYOR...\n');
        console.log('⏰ Bu işlem 1-2 dakika sürebilir...\n');

        // 1. ROLLER (Roles)
        console.log('📋 1/9 - Roller ekleniyor...');
        const roleQueries = [
            { name: 'Mühendis', rate: 1200 },
            { name: 'Usta', rate: 950 },
            { name: 'İşçi', rate: 750 },
            { name: 'Elektrikçi', rate: 900 },
            { name: 'Sıvacı', rate: 800 },
            { name: 'Boyacı', rate: 850 }
        ];

        for (const role of roleQueries) {
            await query(
                'INSERT INTO "Roles" ("name", "default_daily_rate", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
                [role.name, role.rate, 1]
            );
        }
        console.log(`   ✅ ${roleQueries.length} rol eklendi\n`);

        // 2. PROJELER (Projects)
        console.log('🏗️  2/9 - Projeler ekleniyor...');
        const projectIds = [];
        
        const project1 = await query(
            'INSERT INTO "Projects" ("name", "city", "district", "address", "budget", "status", "start_date", "end_date", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
            ['Luxury Residence İstanbul', 'İstanbul', 'Kadıköy', 'Bağdat Caddesi No:123', 5000000, 'Devam Ediyor', '2024-06-01', '2025-12-31', 1]
        );
        projectIds.push(project1.rows[0].id);

        const project2 = await query(
            'INSERT INTO "Projects" ("name", "city", "district", "address", "budget", "status", "start_date", "end_date", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
            ['Modern Plaza Ankara', 'Ankara', 'Çankaya', 'Atatürk Bulvarı No:456', 3000000, 'Planlama', '2025-03-01', '2026-06-30', 1]
        );
        projectIds.push(project2.rows[0].id);

        const project3 = await query(
            'INSERT INTO "Projects" ("name", "city", "district", "address", "budget", "status", "start_date", "end_date", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
            ['İzmir AVM', 'İzmir', 'Bornova', 'Çelebi Caddesi No:789', 7500000, 'Devam Ediyor', '2024-01-15', '2025-10-30', 1]
        );
        projectIds.push(project3.rows[0].id);

        console.log(`   ✅ ${projectIds.length} proje eklendi\n`);

        // 3. TEDARİKÇİLER (Suppliers)
        console.log('🏪 3/9 - Tedarikçiler ekleniyor...');
        const supplierIds = [];

        const supplier1 = await query(
            'INSERT INTO "Suppliers" ("name", "contact_person", "phone", "email", "address", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
            ['Çimento A.Ş.', 'Ahmet Yılmaz', '0532 111 1111', 'ahmet@cimento.com', 'İstanbul Sanayi Sitesi', 1]
        );
        supplierIds.push(supplier1.rows[0].id);

        const supplier2 = await query(
            'INSERT INTO "Suppliers" ("name", "contact_person", "phone", "email", "address", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
            ['Demir Çelik Ltd.', 'Mehmet Kaya', '0533 222 2222', 'mehmet@demircelik.com', 'Ankara OSB', 1]
        );
        supplierIds.push(supplier2.rows[0].id);

        const supplier3 = await query(
            'INSERT INTO "Suppliers" ("name", "contact_person", "phone", "email", "address", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
            ['Boya Dünyası', 'Ayşe Demir', '0534 333 3333', 'ayse@boyadunyasi.com', 'İzmir Ticaret Merkezi', 1]
        );
        supplierIds.push(supplier3.rows[0].id);

        console.log(`   ✅ ${supplierIds.length} tedarikçi eklendi\n`);

        // 4. MALZEME KATEGORİLERİ
        console.log('📦 4/9 - Malzeme kategorileri ekleniyor...');
        const categoryIds = [];

        const cat1 = await query(
            'INSERT INTO "MaterialCategories" ("name", "userId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
            ['Yapı Malzemeleri', 1]
        );
        categoryIds.push(cat1.rows[0].id);

        const cat2 = await query(
            'INSERT INTO "MaterialCategories" ("name", "userId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
            ['İnşaat Demiri', 1]
        );
        categoryIds.push(cat2.rows[0].id);

        const cat3 = await query(
            'INSERT INTO "MaterialCategories" ("name", "userId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
            ['Boyalar', 1]
        );
        categoryIds.push(cat3.rows[0].id);

        console.log(`   ✅ ${categoryIds.length} kategori eklendi\n`);

        // 5. MALZEMELER (Materials)
        console.log('🧱 5/9 - Malzemeler ekleniyor...');
        const materialIds = [];

        const mat1 = await query(
            'INSERT INTO "Materials" ("name", "MaterialCategoryId", "unit", "unit_price", "stock_quantity", "SupplierId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id',
            ['Çimento (Çuval)', categoryIds[0], 'adet', 85, 500, supplierIds[0], 1]
        );
        materialIds.push(mat1.rows[0].id);

        const mat2 = await query(
            'INSERT INTO "Materials" ("name", "MaterialCategoryId", "unit", "unit_price", "stock_quantity", "SupplierId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id',
            ['Demir 12mm', categoryIds[1], 'kg', 18, 2000, supplierIds[1], 1]
        );
        materialIds.push(mat2.rows[0].id);

        const mat3 = await query(
            'INSERT INTO "Materials" ("name", "MaterialCategoryId", "unit", "unit_price", "stock_quantity", "SupplierId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id',
            ['İç Cephe Boyası', categoryIds[2], 'litre', 120, 150, supplierIds[2], 1]
        );
        materialIds.push(mat3.rows[0].id);

        const mat4 = await query(
            'INSERT INTO "Materials" ("name", "MaterialCategoryId", "unit", "unit_price", "stock_quantity", "SupplierId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id',
            ['Tuğla', categoryIds[0], 'adet', 3.5, 10000, supplierIds[0], 1]
        );
        materialIds.push(mat4.rows[0].id);

        console.log(`   ✅ ${materialIds.length} malzeme eklendi\n`);

        // 6. EKİPMAN TİPLERİ
        console.log('🔧 6/9 - Ekipman tipleri ekleniyor...');
        const equipTypeIds = [];

        const eqt1 = await query(
            'INSERT INTO "EquipmentTypes" ("name", "userId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
            ['Ağır Makine', 1]
        );
        equipTypeIds.push(eqt1.rows[0].id);

        const eqt2 = await query(
            'INSERT INTO "EquipmentTypes" ("name", "userId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
            ['El Aleti', 1]
        );
        equipTypeIds.push(eqt2.rows[0].id);

        console.log(`   ✅ ${equipTypeIds.length} ekipman tipi eklendi\n`);

        // 7. EKİPMANLAR
        console.log('🏗️  7/9 - Ekipmanlar ekleniyor...');
        const equipment1 = await query(
            'INSERT INTO "Equipment" ("name", "EquipmentTypeId", "serial_number", "purchase_date", "purchase_price", "condition", "isAvailable", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
            ['Kule Vinç', equipTypeIds[0], 'VNC-001', '2023-01-15', 1500000, 'İyi', true, 1]
        );

        const equipment2 = await query(
            'INSERT INTO "Equipment" ("name", "EquipmentTypeId", "serial_number", "purchase_date", "purchase_price", "condition", "isAvailable", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
            ['Elektrikli Matkap', equipTypeIds[1], 'MTK-045', '2024-03-10', 3500, 'Mükemmel', true, 1]
        );

        console.log(`   ✅ 2 ekipman eklendi\n`);

        // 8. ÇALIŞANLAR (Employees)
        console.log('👷 8/9 - Çalışanlar ekleniyor...');
        const roleResult = await query('SELECT id FROM "Roles" ORDER BY id LIMIT 6');
        const roles = roleResult.rows.map(r => r.id);

        const employeeIds = [];

        const emp1 = await query(
            'INSERT INTO "Employees" ("first_name", "last_name", "phone", "email", "daily_rate", "hire_date", "RoleId", "ProjectId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
            ['Ali', 'Yılmaz', '0532 444 5555', 'ali@email.com', 1200, '2024-01-15', roles[0], projectIds[0], 1]
        );
        employeeIds.push(emp1.rows[0].id);

        const emp2 = await query(
            'INSERT INTO "Employees" ("first_name", "last_name", "phone", "email", "daily_rate", "hire_date", "RoleId", "ProjectId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
            ['Veli', 'Demir', '0533 555 6666', 'veli@email.com', 850, '2024-02-01', roles[1], projectIds[0], 1]
        );
        employeeIds.push(emp2.rows[0].id);

        const emp3 = await query(
            'INSERT INTO "Employees" ("first_name", "last_name", "phone", "email", "daily_rate", "hire_date", "RoleId", "ProjectId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
            ['Ayşe', 'Kaya', '0534 666 7777', 'ayse@email.com', 750, '2024-03-10', roles[2], projectIds[1], 1]
        );
        employeeIds.push(emp3.rows[0].id);

        const emp4 = await query(
            'INSERT INTO "Employees" ("first_name", "last_name", "phone", "email", "daily_rate", "hire_date", "RoleId", "ProjectId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
            ['Mehmet', 'Aydın', '0535 777 8888', 'mehmet@email.com', 900, '2024-01-20', roles[3], projectIds[2], 1]
        );
        employeeIds.push(emp4.rows[0].id);

        console.log(`   ✅ ${employeeIds.length} çalışan eklendi\n`);

        // 9. YOKLAMA KAYITLARI (Attendances)
        console.log('📅 9/9 - Yoklama kayıtları ekleniyor...');
        let attendanceCount = 0;

        // Son 7 gün için yoklama kayıtları
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            for (const empId of employeeIds) {
                const status = Math.random() > 0.1 ? 'Geldi' : 'Gelmedi';
                const hours = status === 'Geldi' ? 8 : 0;

                await query(
                    'INSERT INTO "Attendances" ("EmployeeId", "ProjectId", "date", "status", "worked_hours", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
                    [empId, projectIds[Math.floor(Math.random() * projectIds.length)], dateStr, status, hours, 1]
                );
                attendanceCount++;
            }
        }

        console.log(`   ✅ ${attendanceCount} yoklama kaydı eklendi\n`);

        // 10. HARCAMALAR (Expenses)
        console.log('💰 Bonus - Harcamalar ekleniyor...');
        await query(
            'INSERT INTO "Expenses" ("ProjectId", "category", "description", "amount", "expense_date", "payment_method", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
            [projectIds[0], 'Malzeme', 'Çimento alımı', 42500, '2024-12-10', 'Banka Transferi', 1]
        );

        await query(
            'INSERT INTO "Expenses" ("ProjectId", "category", "description", "amount", "expense_date", "payment_method", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
            [projectIds[1], 'İşçilik', 'Haftalık maaş ödemesi', 68000, '2024-12-12', 'Nakit', 1]
        );

        await query(
            'INSERT INTO "Expenses" ("ProjectId", "category", "description", "amount", "expense_date", "payment_method", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
            [projectIds[2], 'Ekipman', 'Vinç kiralama', 125000, '2024-12-15', 'Banka Transferi', 1]
        );

        console.log(`   ✅ 3 harcama kaydı eklendi\n`);

        console.log('✅ Seed işlemi başarıyla tamamlandı!\n');
        console.log('📊 Özet:');
        console.log(`   - Roller: 6`);
        console.log(`   - Projeler: ${projectIds.length}`);
        console.log(`   - Tedarikçiler: ${supplierIds.length}`);
        console.log(`   - Kategoriler: ${categoryIds.length}`);
        console.log(`   - Malzemeler: ${materialIds.length}`);
        console.log(`   - Ekipman Tipleri: ${equipTypeIds.length}`);
        console.log(`   - Ekipmanlar: 2`);
        console.log(`   - Çalışanlar: ${employeeIds.length}`);
        console.log(`   - Yoklama: ${attendanceCount}`);
        console.log(`   - Harcamalar: 3`);
        console.log('\n🎉 Veritabanı hazır!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed hatası:', error);
        console.error('Detay:', error.message);
        process.exit(1);
    }
}

// Seed'i çalıştır
seed();
