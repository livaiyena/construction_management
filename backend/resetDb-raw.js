// Veritabanı Sıfırlama Scripti - Raw SQL
// Tüm verileri siler ve ID sequence'leri sıfırlar
const { query } = require('./config/db-raw');

async function resetDatabase() {
    try {
        console.log('\n🔥 VERİTABANI SIFIRLAMA BAŞLIYOR...\n');
        console.log('⚠️  TÜM VERİLER SİLİNECEK!');
        console.log('⏳ 3 saniye içinde işlem başlayacak...\n');
        
        // 3 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('🗑️  Veriler siliniyor...\n');

        // Foreign key constraint'leri nedeniyle ters sırayla sil
        
        // 1. AuditLogs
        await query('DELETE FROM "AuditLogs"');
        console.log('   ✓ Audit logs silindi');

        // 2. Documents
        await query('DELETE FROM "Documents"');
        console.log('   ✓ Dokümanlar silindi');

        // 3. Attendances (Yoklamalar)
        await query('DELETE FROM "Attendances"');
        console.log('   ✓ Yoklamalar silindi');

        // 4. Expenses (Harcamalar)
        await query('DELETE FROM "Expenses"');
        console.log('   ✓ Harcamalar silindi');

        // 5. ProjectMaterial (Proje-Malzeme ilişkisi)
        await query('DELETE FROM "ProjectMaterial"');
        console.log('   ✓ Proje malzemeleri silindi');

        // 6. ProjectEquipment (Proje-Ekipman ilişkisi)
        await query('DELETE FROM "ProjectEquipment"');
        console.log('   ✓ Proje ekipmanları silindi');

        // 7. Employees (Çalışanlar)
        await query('DELETE FROM "Employees"');
        console.log('   ✓ Çalışanlar silindi');

        // 8. Materials (Malzemeler)
        await query('DELETE FROM "Materials"');
        console.log('   ✓ Malzemeler silindi');

        // 9. Equipment (Ekipmanlar)
        await query('DELETE FROM "Equipment"');
        console.log('   ✓ Ekipmanlar silindi');

        // 10. MaterialCategories
        await query('DELETE FROM "MaterialCategories"');
        console.log('   ✓ Malzeme kategorileri silindi');

        // 11. EquipmentTypes
        await query('DELETE FROM "EquipmentTypes"');
        console.log('   ✓ Ekipman tipleri silindi');

        // 12. Roles
        await query('DELETE FROM "Roles"');
        console.log('   ✓ Roller silindi');

        // 13. Suppliers
        await query('DELETE FROM "Suppliers"');
        console.log('   ✓ Tedarikçiler silindi');

        // 14. Projects
        await query('DELETE FROM "Projects"');
        console.log('   ✓ Projeler silindi');

        // 15. Users (en son - diğer tablolar buna bağlı)
        await query('DELETE FROM "Users"');
        console.log('   ✓ Kullanıcılar silindi');

        console.log('\n🔄 ID sıraları (sequences) sıfırlanıyor...\n');

        // Tüm sequence'leri sıfırla
        const sequences = [
            'Users_id_seq',
            'Projects_id_seq',
            'Roles_id_seq',
            'Suppliers_id_seq',
            'MaterialCategories_id_seq',
            'EquipmentTypes_id_seq',
            'Employees_id_seq',
            'Materials_id_seq',
            'Equipment_id_seq',
            'ProjectMaterial_id_seq',
            'ProjectEquipment_id_seq',
            'Expenses_id_seq',
            'Attendances_id_seq',
            'Documents_id_seq',
            'AuditLogs_id_seq'
        ];

        for (const seq of sequences) {
            try {
                await query(`ALTER SEQUENCE "${seq}" RESTART WITH 1`);
                console.log(`   ✓ ${seq} sıfırlandı`);
            } catch (err) {
                // Sequence yoksa devam et
                console.log(`   ⚠ ${seq} bulunamadı`);
            }
        }

        console.log('\n✅ VERİTABANI BAŞARIYLA SIFIRLANDI!');
        console.log('\n💡 Şimdi seed scripti çalıştırabilirsiniz:');
        console.log('   node backend/seed-raw.js\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ HATA OLUŞTU:', error.message);
        console.error('Detay:', error);
        process.exit(1);
    }
}

// Scripti çalıştır
resetDatabase();
