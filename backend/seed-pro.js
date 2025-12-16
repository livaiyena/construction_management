// Comprehensive Database Seed Script
const { sequelize } = require('./config/db');
const bcrypt = require('bcryptjs');
const models = require('./models');

async function seedDatabase() {
    try {
        console.log('\n🌱 SEEDING STARTED...\n');

        // 1. Reset Database
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Force sync to drop and recreate tables with new schema
        await sequelize.sync({ force: true });
        console.log('✅ Database reset complete\n');

        const { User, Project, Employee, Role, Attendance, Expense, Supplier, Material, Equipment, Document, AuditLog, MaterialCategory, EquipmentType } = models;

        // 2. Create Users
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const users = await User.bulkCreate([
            { name: 'Admin User', email: 'admin@insaat.com', password: hashedPassword, role: 'admin', isVerified: true },
            { name: 'Şantiye Şefi', email: 'sef@insaat.com', password: hashedPassword, role: 'admin', isVerified: true },
            { name: 'Muhasebe', email: 'muhasebe@insaat.com', password: hashedPassword, role: 'admin', isVerified: true }
        ]);
        const adminUser = users[0];
        console.log(`✅ ${users.length} Users created`);

        // 3. Create Categories & Types
        const matCategories = await MaterialCategory.bulkCreate([
            { name: 'Kaba Yapı', description: 'Çimento, Demir, Kum, Tuğla', userId: adminUser.id },
            { name: 'İnce Yapı', description: 'Alçı, Boya, Seramik', userId: adminUser.id },
            { name: 'Elektrik', description: 'Kablo, Pano, Anahtar', userId: adminUser.id },
            { name: 'Mekanik', description: 'Boru, Vana, Pompa', userId: adminUser.id },
            { name: 'Hırdavat', description: 'Çivi, Vida, El Aleti', userId: adminUser.id }
        ]);
        console.log(`✅ ${matCategories.length} Material Categories created`);

        const equipTypes = await EquipmentType.bulkCreate([
            { name: 'İş Makinesi', description: 'Ekskavatör, Vinç, Dozer', userId: adminUser.id },
            { name: 'Elektrikli El Aleti', description: 'Matkap, Testere, Kırıcı', userId: adminUser.id },
            { name: 'Jeneratör & Kompresör', description: 'Enerji ve hava kaynakları', userId: adminUser.id },
            { name: 'Yük Taşıma', description: 'Kamyon, Forklift', userId: adminUser.id },
            { name: 'Ölçüm Cihazı', description: 'Lazer metre, Teodolit', userId: adminUser.id }
        ]);
        console.log(`✅ ${equipTypes.length} Equipment Types created`);

        // 4. Create Roles
        const roleData = [
            { name: 'Şantiye Şefi', default_daily_rate: 1500 },
            { name: 'İnşaat Mühendisi', default_daily_rate: 1200 },
            { name: 'Mimar', default_daily_rate: 1300 },
            { name: 'Usta Başı', default_daily_rate: 1000 },
            { name: 'Elektrik Ustası', default_daily_rate: 800 },
            { name: 'Sıhhi Tesisatçı', default_daily_rate: 750 },
            { name: 'Operatör', default_daily_rate: 900 },
            { name: 'Düz İşçi', default_daily_rate: 500 },
            { name: 'Güvenlik', default_daily_rate: 450 }
        ].map(r => ({ ...r, userId: adminUser.id }));
        const roles = await Role.bulkCreate(roleData);
        console.log(`✅ ${roles.length} Roles created`);

        // 5. Create Projects
        const projects = await Project.bulkCreate([
            { name: 'Vadi İstanbul Konutları', description: '5 bloklu lüks konut projesi', city: 'İstanbul', district: 'Sarıyer', address: 'Ayazağa Mh', budget: 50000000, start_date: '2024-01-01', end_date: '2026-06-01', status: 'Devam Ediyor', userId: adminUser.id },
            { name: 'Merkez AVM', description: 'Şehir merkezi alışveriş kompleksi', city: 'Ankara', district: 'Çankaya', address: 'Kızılay', budget: 35000000, start_date: '2023-05-15', end_date: '2025-12-30', status: 'Devam Ediyor', userId: adminUser.id },
            { name: 'Sahil Otel', description: '5 yıldızlı tatil köyü', city: 'Antalya', district: 'Muratpaşa', address: 'Lara', budget: 85000000, start_date: '2024-03-01', end_date: '2025-05-30', status: 'Planlama', userId: adminUser.id }
        ]);
        console.log(`✅ ${projects.length} Projects created`);

        // 6. Create Employees
        // Helper to get random role
        const getRandomRole = () => roles[Math.floor(Math.random() * roles.length)];
        const employeeData = [];
        const firstNames = ['Ali', 'Veli', 'Ayşe', 'Fatma', 'Mehmet', 'Ahmet', 'Zeynep', 'Elif', 'Burak', 'Can', 'Cem', 'Deniz'];
        const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan'];

        for (let i = 0; i < 50; i++) {
            const role = getRandomRole();
            employeeData.push({
                first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
                last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
                phone: `0555${Math.floor(1000000 + Math.random() * 9000000)}`,
                email: `calisan${i}@insaat.com`,
                daily_rate: role.default_daily_rate,
                address: 'İstanbul',
                hire_date: '2024-01-10',
                status: 'aktif',
                RoleId: role.id,
                userId: adminUser.id
            });
        }
        const employees = await Employee.bulkCreate(employeeData);
        console.log(`✅ ${employees.length} Employees created`);

        // 7. Create Suppliers
        const suppliers = await Supplier.bulkCreate([
            { name: 'BetonSA', contact_person: 'Ahmet Betoncu', phone: '02122223344', email: 'info@betonsa.com', tax_number: '1234567890', rating: 5, isActive: true, userId: adminUser.id },
            { name: 'Demir Çelik AŞ', contact_person: 'Mehmet Demirci', phone: '02166667788', email: 'satis@demircelik.com', tax_number: '0987654321', rating: 4, isActive: true, userId: adminUser.id },
            { name: 'Boya Dünyası', contact_person: 'Ali Boyacı', phone: '05321112233', email: 'ali@boya.com', tax_number: '1122334455', rating: 3, isActive: true, userId: adminUser.id }
        ]);
        console.log(`✅ ${suppliers.length} Suppliers created`);

        // 8. Create Materials using Category Relations
        const materials = await Material.bulkCreate([
            { name: 'C30 Beton', MaterialCategoryId: matCategories[0].id, unit: 'm3', unit_price: 2500, stock_quantity: 500, minimum_stock: 50, SupplierId: suppliers[0].id, userId: adminUser.id },
            { name: 'İnşaat Demiri 12mm', MaterialCategoryId: matCategories[0].id, unit: 'ton', unit_price: 22000, stock_quantity: 50, minimum_stock: 10, SupplierId: suppliers[1].id, userId: adminUser.id },
            { name: 'Tuğla 13.5', MaterialCategoryId: matCategories[0].id, unit: 'adet', unit_price: 8, stock_quantity: 10000, minimum_stock: 1000, userId: adminUser.id },
            { name: 'Saten Alçı', MaterialCategoryId: matCategories[1].id, unit: 'torba', unit_price: 150, stock_quantity: 200, minimum_stock: 20, userId: adminUser.id },
            { name: 'İç Cephe Boyası', MaterialCategoryId: matCategories[1].id, unit: 'kova', unit_price: 1800, stock_quantity: 40, minimum_stock: 5, SupplierId: suppliers[2].id, userId: adminUser.id },
            { name: '3x2.5 Kablo', MaterialCategoryId: matCategories[2].id, unit: 'metre', unit_price: 45, stock_quantity: 1500, minimum_stock: 200, userId: adminUser.id },
            { name: 'Matkap Ucu Seti', MaterialCategoryId: matCategories[4].id, unit: 'set', unit_price: 350, stock_quantity: 15, minimum_stock: 2, userId: adminUser.id }
        ]);
        console.log(`✅ ${materials.length} Materials created`);

        // 9. Create Equipment using Type Relations
        const equipment = await Equipment.bulkCreate([
            { name: 'JCB 3CX Bekoloder', EquipmentTypeId: equipTypes[0].id, serial_number: 'JCB-2024-001', daily_rental_cost: 5000, purchase_price: 3500000, condition: 'İyi', isAvailable: true, userId: adminUser.id },
            { name: 'Kule Vinç 10Ton', EquipmentTypeId: equipTypes[0].id, serial_number: 'VIN-2023-55', daily_rental_cost: 15000, purchase_price: 12000000, condition: 'Mükemmel', isAvailable: false, userId: adminUser.id },
            { name: 'Hilti Kırıcı', EquipmentTypeId: equipTypes[1].id, serial_number: 'HIL-554', daily_rental_cost: 500, purchase_price: 45000, condition: 'Orta', isAvailable: true, userId: adminUser.id },
            { name: 'Dizel Jeneratör 50kVA', EquipmentTypeId: equipTypes[2].id, serial_number: 'GEN-50', daily_rental_cost: 2500, purchase_price: 250000, condition: 'Bakımda', isAvailable: true, userId: adminUser.id },
            { name: 'Ford Kamyon', EquipmentTypeId: equipTypes[3].id, serial_number: 'TRK-34-ABC', daily_rental_cost: 8000, purchase_price: 4500000, condition: 'İyi', isAvailable: true, userId: adminUser.id }
        ]);
        console.log(`✅ ${equipment.length} Equipment created`);

        // 10. Associate Projects with Employees & Create Attendance
        // Assign random employees to projects
        for (const proj of projects) {
            // Assign 10 random employees
            const team = employees.sort(() => 0.5 - Math.random()).slice(0, 10);
            for (const emp of team) {
                // Actually need to update Employee record with ProjectId, or creating a relation table entry
                // Employee belongsTo Project (one-to-many from Project side)
                await emp.update({ ProjectId: proj.id });

                // Create Attendance for last 30 days
                const attendanceRecords = [];
                for (let d = 0; d < 30; d++) {
                    const date = new Date();
                    date.setDate(date.getDate() - d);
                    const status = Math.random() > 0.1 ? 'Geldi' : Math.random() > 0.5 ? 'İzinli' : 'Gelmedi';
                    attendanceRecords.push({
                        date: date,
                        status: status,
                        EmployeeId: emp.id,
                        ProjectId: proj.id,
                        userId: adminUser.id
                    });
                }
                await Attendance.bulkCreate(attendanceRecords);
            }
        }
        console.log('✅ Teams assigned & Attendance records created');

        // 11. Create Expenses
        const expenseData = [];
        for (const proj of projects) {
            for (let i = 0; i < 20; i++) {
                expenseData.push({
                    description: `Harcama Kalemi ${i + 1}`,
                    amount: Math.floor(Math.random() * 50000) + 1000,
                    category: ['Malzeme', 'Maaş', 'Ekipman', 'Ulaşım', 'Yemek'][Math.floor(Math.random() * 5)],
                    expense_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                    payment_method: ['Nakit', 'Havale', 'Kredi Kartı'][Math.floor(Math.random() * 3)],
                    status: ['Ödendi', 'Beklemede', 'Onaylandı'][Math.floor(Math.random() * 3)],
                    ProjectId: proj.id,
                    userId: adminUser.id
                });
            }
        }
        await Expense.bulkCreate(expenseData);
        console.log(`✅ ${expenseData.length} Expenses created`);

        console.log('\n✨ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEEDING FAILED:', error);
        if (error.errors) {
            error.errors.forEach(e => console.error(`- ${e.message} (Value: ${e.value})`));
        }
        if (error.parent) {
            console.error('PG Error:', error.parent);
        }
        process.exit(1);
    }
}

seedDatabase();
