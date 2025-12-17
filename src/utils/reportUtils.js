import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Metni PDF için temizler - Türkçe karakterleri ve özel karakterleri kaldırır
 */
const cleanTextForPDF = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/_/g, ' ')  // Underscore'ları boşluğa çevir
        .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşluğa indir
        .trim();
};

/**
 * Sayıyı TL formatında formatlar (PDF için güvenli)
 */
const formatCurrency = (value) => {
    if (!value && value !== 0) return '0,00 TL';
    const num = parseFloat(value);
    if (isNaN(num)) return '0,00 TL';
    
    // Sayıyı formatla: 1234567.89 -> 1.234.567,89
    const parts = num.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1];
    
    return `${integerPart},${decimalPart} TL`;
};

/**
 * Dashboard verilerini kullanarak şık PDF raporu oluşturur ve indirir
 * @param {Object} data - Dashboard verileri
 */
export const generateDashboardReport = (data) => {
    try {
        // Veri kontrolü
        console.log('📊 PDF Rapor Verisi:', data);
        
        if (!data) {
            throw new Error('Dashboard verisi bulunamadı');
        }
        
        if (!data.projects) {
            throw new Error('Proje verileri eksik');
        }
        
        if (!data.employees) {
            throw new Error('Çalışan verileri eksik');
        }
        
        if (!data.attendance) {
            throw new Error('Yoklama verileri eksik');
        }
        
        if (!data.roles) {
            throw new Error('Rol verileri eksik');
        }

        const doc = new jsPDF();
        
        // Türkçe karakter desteği için encoding
        doc.setLanguage("tr");
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // Başlık ve Logo Alanı
        doc.setFillColor(59, 130, 246); // primary-500 blue
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Başlık
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('InsaatYon', 15, 20);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Ozet Rapor', 15, 28);
        
        // Tarih
        doc.setFontSize(10);
        const today = new Date().toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.text(today, pageWidth - 15, 20, { align: 'right' });
        
        yPos = 50;

        // === GENEL ISTATISTIKLER KARTLARI ===
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Genel Istatistikler', 15, yPos);
        yPos += 10;

        // İstatistik kartları 3 sütunlu grid
        const cardWidth = (pageWidth - 40) / 3;
        const cardHeight = 25;
        const stats = [
            { label: cleanTextForPDF('Toplam Proje'), value: data.projects.total || 0, color: [59, 130, 246] },
            { label: cleanTextForPDF('Aktif Proje'), value: data.projects.active || 0, color: [34, 197, 94] },
            { label: cleanTextForPDF('Tamamlanan'), value: data.projects.completed || 0, color: [168, 85, 247] },
            { label: cleanTextForPDF('Toplam Calisan'), value: data.employees.total || 0, color: [249, 115, 22] },
            { label: cleanTextForPDF('Aktif Calisan'), value: data.employees.active || 0, color: [14, 165, 233] },
            { label: cleanTextForPDF('Toplam Roller'), value: data.roles.total || 0, color: [236, 72, 153] }
        ];

        stats.forEach((stat, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const x = 15 + col * (cardWidth + 5);
            const y = yPos + row * (cardHeight + 5);

            // Kart gölgesi
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(x + 1, y + 1, cardWidth, cardHeight, 3, 3, 'F');
            
            // Kart arka plan
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');
            
            // Renkli üst çizgi
            doc.setFillColor(...stat.color);
            doc.rect(x, y, cardWidth, 3, 'F');
            
            // Değer
            doc.setTextColor(...stat.color);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(stat.value.toString(), x + cardWidth / 2, y + 13, { align: 'center' });
            
            // Label
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const cleanLabel = cleanTextForPDF(stat.label);
            doc.text(cleanLabel, x + cardWidth / 2, y + 20, { align: 'center' });
        });

        yPos += 65;

        // === HARCAMA DAĞILIMI TABLOSU ===
        if (data.expenses && data.expenses.byCategory && data.expenses.byCategory.length > 0) {
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Harcama Dagilimi', 15, yPos);
            yPos += 5;

            const expenseData = data.expenses.byCategory.map(exp => [
                cleanTextForPDF(exp.name) || 'Diger',
                formatCurrency(exp.value)
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Kategori', 'Tutar']],
                body: expenseData,
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 10
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: [51, 65, 85]
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                margin: { left: 15, right: 15 },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
                }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Yeni sayfa gerekirse
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        // === BUGUNKU YOKLAMA ===
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Bugunku Yoklama', 15, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Durum', 'Kisi Sayisi']],
            body: [
                ['Geldi', data.attendance.present || 0],
                ['Gelmedi', data.attendance.absent || 0],
                ['Izinli/Raporlu', data.attendance.leave || 0]
            ],
            theme: 'grid',
            headStyles: {
                fillColor: [34, 197, 94],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 10
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [51, 65, 85]
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            margin: { left: 15, right: pageWidth / 2 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { halign: 'center', fontStyle: 'bold' }
            }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Yeni sayfa gerekirse
        if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = 20;
        }

        // === AKTİF PROJELER ===
        if (data.activeProjects && data.activeProjects.length > 0) {
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Aktif Projeler', 15, yPos);
            yPos += 5;

            const projectData = data.activeProjects.slice(0, 10).map(p => [
                cleanTextForPDF(p.name) || 'Bilinmeyen',
                cleanTextForPDF(`${p.city || ''}, ${p.district || ''}`.trim().replace(/^,\s*/, '')) || 'Bilinmeyen',
                cleanTextForPDF(p.status) || '-',
                p.start_date ? new Date(p.start_date).toLocaleDateString('tr-TR') : '-'
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Proje Adi', 'Lokasyon', 'Durum', 'Baslangic']],
                body: projectData,
                theme: 'grid',
                headStyles: {
                    fillColor: [168, 85, 247],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 10
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: [51, 65, 85]
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                margin: { left: 15, right: 15 },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 30, halign: 'center' }
                }
            });
        }

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.setFont('helvetica', 'italic');
            doc.text(
                `Sayfa ${i} / ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            doc.text(
                'InsaatYon - Profesyonel Insaat Yonetim Sistemi',
                15,
                pageHeight - 10
            );
        }

        // İndirme
        const fileName = `insaat_yonetim_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        return { success: true };
    } catch (error) {
        console.error('Rapor oluşturma hatası:', error);
        return { success: false, error };
    }
}
