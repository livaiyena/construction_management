// Tüm modelleri ve ilişkileri yükle
const models = require('./models');

const syncDatabase = async () => {
    try {
        console.log('Veritabanına bağlanılıyor...');
        await models.sequelize.authenticate();
        console.log('Bağlantı başarılı. Tablolar silinip yeniden oluşturuluyor...\n');
        
        // force: true -> Her şeyi sil ve baştan yarat
        await models.sequelize.sync({ force: true });
        
        console.log('\n✅ BAŞARILI! Tüm tablolar oluşturuldu:');
        console.log('  1. Users');
        console.log('  2. Projects');
        console.log('  3. Employees');
        console.log('  4. Roles');
        console.log('  5. Activities');
        console.log('  6. Attendance (Yoklama)');
        console.log('  7. Suppliers (Tedarikçiler)');
        console.log('  8. Materials (Malzemeler)');
        console.log('  9. Equipment (Ekipman)');
        console.log('  10. ProjectMaterials (Proje-Malzeme İlişkisi)');
        console.log('  11. ProjectEquipment (Proje-Ekipman İlişkisi)');
        console.log('  12. Expenses (Harcamalar)');
        console.log('  13. Documents (Dökümanlar)\n');
        
        process.exit(0);
    } catch (error) {
        console.error('HATA OLUŞTU:', error);
        process.exit(1);
    }
};

syncDatabase();