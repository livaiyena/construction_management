/**
 * Dashboard verilerini kullanarak CSV raporu oluşturur ve indirir
 * @param {Object} data - Dashboard verileri
 */
export const generateDashboardReport = (data) => {
    try {
        // CSV başlıkları
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM

        // Özet Bilgiler Bölümü
        csvContent += "OZET RAPOR\n";
        csvContent += `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}\n\n`;

        // Genel İstatistikler
        csvContent += "GENEL ISTATISTIKLER\n";
        csvContent += `Toplam Proje;${data.projects.total}\n`;
        csvContent += `Aktif Proje;${data.projects.active}\n`;
        csvContent += `Tamamlanan Proje;${data.projects.completed}\n`;
        csvContent += `Toplam Calisan;${data.employees.total}\n`;
        csvContent += `Aktif Calisan;${data.employees.active}\n`;
        csvContent += `Toplam Rol;${data.roles.total}\n`;
        csvContent += `Toplam Harcama;${data.expenses.total} TL\n\n`;

        // Harcamalar Kategorisi
        csvContent += "HARCAMA DAGILIMI\n";
        csvContent += "Kategori;Tutar\n";
        data.expenses.byCategory.forEach(exp => {
            csvContent += `${exp.name};${exp.value}\n`;
        });
        csvContent += "\n";

        // Bugünün Yoklaması
        csvContent += "BUGUNKU YOKLAMA\n";
        csvContent += `Geldi;${data.attendance.present}\n`;
        csvContent += `Gelmedi;${data.attendance.absent}\n`;
        csvContent += `Izinli/Raporlu;${data.attendance.leave}\n\n`;

        // Aktif Projeler Listesi
        csvContent += "AKTIF PROJELER (ILK 5)\n";
        csvContent += "Proje Adi;Sehir;Ilce;Durum;Baslangic Tarihi\n";
        data.activeProjects.forEach(p => {
            csvContent += `${p.name};${p.city};${p.district};${p.status};${new Date(p.start_date).toLocaleDateString('tr-TR')}\n`;
        });

        // İndirme işlemi
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `insaat_yonetim_rapor_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error('Rapor oluşturma hatası:', error);
        return { success: false, error };
    }
}
