import { useState, useEffect } from 'react'
import { FileText, TrendingUp, DollarSign, Users, Calendar, Building2, Loader2, Download, Code, X } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'
import Portal from '../components/Portal'

export default function Reports() {
    const [loading, setLoading] = useState(false)
    const [activeReport, setActiveReport] = useState('project-expenses')
    const [reportData, setReportData] = useState([])
    const [currentQuery, setCurrentQuery] = useState('')
    const [showQueryModal, setShowQueryModal] = useState(false)
    const { showToast } = useToast()
    const { addNotification } = useNotification()

    // Tablo başlıkları çevirisi
    const headerTranslations = {
        'id': 'ID',
        'project_id': 'Proje ID',
        'project_name': 'Proje Adı',
        'name': 'Adı',
        'status': 'Durum',
        'city': 'Şehir',
        'district': 'İlçe',
        'address': 'Adres',
        'start_date': 'Başlangıç Tarihi',
        'end_date': 'Bitiş Tarihi',
        'budget': 'Bütçe',
        'total_expense': 'Toplam Harcama',
        'total_expenses': 'Toplam Harcama',
        'total_spent': 'Toplam Harcanan',
        'remaining_budget': 'Kalan Bütçe',
        'expense_count': 'Harcama Sayısı',
        'expense_transactions': 'Harcama İşlemleri',
        'average_expense': 'Ortalama Harcama',
        'min_amount': 'Minimum Tutarı',
        'max_amount': 'Maksimum Tutarı',
        'avg_amount': 'Ortalama Tutarı',
        'average_amount': 'Ortalama Tutarı',
        'transaction_count': 'İşlem Sayısı',
        'total_amount': 'Toplam Tutarı',
        'category': 'Kategori',
        'employee_id': 'Çalışan ID',
        'employee_name': 'Çalışan Adı',
        'emp_position': 'Pozisyon',
        'total_days': 'Toplam Gün',
        'present_days': 'Geldi Günü',
        'absent_days': 'Gelmedi Günü',
        'sick_leave_days': 'İzinli Günü',
        'excused_days': 'Mazeret Günü',
        'total_worked_hours': 'Toplam Çalışılan Saat',
        'total_overtime_hours': 'Toplam Fazla Mesai Saati',
        'attendance_rate': 'Katılım Oranı (%)',
        'email': 'E-posta',
        'phone': 'Telefon',
        'department': 'Departman',
        'daily_rate': 'Günlük Ücret',
        'salary': 'Maaş',
        'attendance_date': 'Yoklama Tarihi',
        'date': 'Tarih',
        'attendance_count': 'Katılım Sayısı',
        'days_present': 'Katılı Gün',
        'present': 'Katıldı',
        'present_count': 'Katıldı Sayısı',
        'days_absent': 'Devamsız Gün',
        'absent': 'Katılmadı',
        'absent_count': 'Katılmadı Sayısı',
        'on_leave': 'İzinli',
        'days_leave': 'İzin Günü',
        'leave_count': 'İzin Sayısı',
        'attendance_rate': 'Katılım Oranı',
        'attendance_percentage': 'Katılım Yüzdesi',
        'month': 'Ay',
        'month_year': 'Ay-Yıl',
        'month_name': 'Ay Adı',
        'week': 'Hafta',
        'total_records': 'Toplam Kayıt',
        'amount': 'Tutarı',
        'payment_method': 'Ödeme Yöntemi',
        'payment_status': 'Ödeme Durumu',
        'description': 'Açıklama',
        'expense_date': 'Harcama Tarihi',
        'performance_score': 'Performans Skoru',
        'projects_completed': 'Tamamlanan Projeler',
        'average_rating': 'Ortalama Puan',
        'cost': 'Maliyet',
        'revenue': 'Gelir',
        'profit': 'Kar',
        'duration_days': 'Süre (Gün)',
        'expense_budget_ratio': 'Harcama/Bütçe Oranı',
        'project_status': 'Proje Durumu',
        'count': 'Sayı',
        'due_date': 'Vade Tarihi',
        'days_overdue': 'Geciken Gün',
        'days_pending': 'Beklemede Gün',
        'priority_level': 'Aciliyet Düzeyi',
        'budget_usage_percentage': 'Bütçe Kullanım Yüzdesi',
        'team_size': 'Ekip Büyüklüğü',
        'employee_count': 'Çalışan Sayısı',
        'avg_daily_rate': 'Ort. Günlük Ücret',
        'min_daily_rate': 'Min. Günlük Ücret',
        'max_daily_rate': 'Maks. Günlük Ücret',
        'estimated_monthly_avg': 'Tahmini Aylık Ort.',
        'days_worked': 'Çalışılan Gün',
        'total_hours': 'Toplam Saat',
        'worked_hours': 'Çalışılan Saat',
        'total_cost': 'Toplam Maliyet',
        'total_attendance_days': 'Toplam Katılı Gün',
        'total_worked_hours': 'Toplam Çalışılan Saat',
        'total_overtime_hours': 'Toplam Fazla Mesai Saati',
        'project_id': 'Proje ID',
        'project_name': 'Proje Adı',
        'total_expense_amount': 'Toplam Harcama Tutarı',
        'over_budget': 'Bütçe Aşan',
        'budget_variance': 'Bütçe Sapması',
        'avg_expense': 'Ort. Harcama',
        'project_count': 'Proje Sayısı',
        'worked': 'Çalışıldı',
        'leave': 'İzin',
        'first_name': 'Ad',
        'last_name': 'Soyad',
        'concat': 'Adı Soyadı',
        'january': 'Ocak',
        'february': 'Şubat',
        'march': 'Mart',
        'april': 'Nisan',
        'may': 'Mayıs',
        'june': 'Haziran',
        'july': 'Temmuz',
        'august': 'Ağustos',
        'september': 'Eylül',
        'october': 'Ekim',
        'november': 'Kasım',
        'december': 'Aralık',
        // VIEW ve PROCEDURE için ek çeviriler
        'employee_full_name': 'Çalışan Adı',
        'full_name': 'Ad Soyad',
        'projects_count': 'Proje Sayısı',
        'total_project_cost': 'Toplam Proje Maliyeti',
        'project_expense': 'Proje Harcaması',
        'project_total_cost': 'Proje Toplam Maliyeti',
        'project_budget': 'Proje Bütçesi',
        'is_over_budget': 'Bütçe Aşan',
        'budget_status': 'Bütçe Durumu',
        'is_active': 'Aktif',
        'is_pending': 'Beklemede',
        'total_budget': 'Toplam Bütçe',
        'total_spent_amount': 'Toplam Harcanan Tutarı',
        'alert_reason': 'Uyarı Nedeni',
        'alert_level': 'Uyarı Seviyesi',
        'avg_daily_hours': 'Ort. Günlük Saat',
        'labor_cost': 'İşçilik Maliyeti',
        'material_cost': 'Malzeme Maliyeti'
    }

    const translateHeader = (header) => {
        const lowerHeader = header.toLowerCase()
        return headerTranslations[lowerHeader] || header.replace(/_/g, ' ').toUpperCase()
    }

    // Ay adlarını türkçeye çevir
    const translateMonthName = (monthName) => {
        if (!monthName) return monthName
        const months = {
            'January': 'Ocak',
            'February': 'Şubat',
            'March': 'Mart',
            'April': 'Nisan',
            'May': 'Mayıs',
            'June': 'Haziran',
            'July': 'Temmuz',
            'August': 'Ağustos',
            'September': 'Eylül',
            'October': 'Ekim',
            'November': 'Kasım',
            'December': 'Aralık'
        }
        
        // "Month YYYY" formatını türkçeye çevir
        for (const [eng, tr] of Object.entries(months)) {
            monthName = monthName.replace(eng, tr)
        }
        return monthName
    }

    const reports = [
        { id: 'project-expenses', name: 'Proje Bazlı Harcamalar', icon: Building2, sql: 'JOIN, SUM, GROUP BY' },
        { id: 'expense-by-category', name: 'Kategori Analizi', icon: DollarSign, sql: 'GROUP BY, HAVING, Aggregates' },
        { id: 'employee-attendance-stats', name: 'Çalışan Yoklama İstatistikleri', icon: Users, sql: 'Multiple JOINs, COUNT, CASE' },
        { id: 'monthly-expenses', name: 'Aylık Harcama Trendi', icon: Calendar, sql: 'DATE functions, GROUP BY' },
        { id: 'top-active-employees', name: 'En Aktif Çalışanlar', icon: TrendingUp, sql: 'Subquery, LIMIT, ORDER BY' },
        { id: 'role-salary-analysis', name: 'Rol Maaş Analizi', icon: Users, sql: 'JOIN, AVG, Calculations' },
        { id: 'pending-expenses', name: 'Geciken Ödemeler', icon: DollarSign, sql: 'WHERE, CASE, Date Math' },
        { id: 'project-performance', name: 'Proje Performansı', icon: TrendingUp, sql: 'Complex Aggregations' },
        { id: 'weekly-attendance', name: 'Haftalık Yoklama', icon: Calendar, sql: 'Date Grouping, Percentages' },
        { id: 'most-expensive-projects', name: 'En Pahalı Projeler', icon: Building2, sql: 'Nested Query, TOP N' },
        { id: 'employee-cost-report', name: 'Çalışan Maliyet Raporu', icon: Users, sql: 'FILTER, Complex JOIN' },
        { id: 'employee-performance', name: '📊 VIEW: Çalışan Performans Raporu', icon: TrendingUp, sql: 'VIEW - vw_employee_project_performance', type: 'view' },
        { id: 'project-cost-analysis', name: '📊 VIEW: Proje Maliyet Analizi', icon: DollarSign, sql: 'VIEW - vw_project_cost_summary', type: 'view' },
        { id: 'monthly-attendance/2025/12', name: '⚙️ PROCEDURE: Aralık 2025 Yoklama', icon: Calendar, sql: 'STORED PROCEDURE - sp_monthly_attendance_report', type: 'procedure' },
        { id: 'budget-alerts', name: '⚙️ PROCEDURE: Bütçe Uyarı Raporu', icon: DollarSign, sql: 'STORED PROCEDURE - sp_budget_alert_projects', type: 'procedure' }
    ]

    useEffect(() => {
        fetchReport(activeReport)
    }, [activeReport])

    const fetchReport = async (reportId) => {
        setLoading(true)
        try {
            const response = await api.get(`/reports/${reportId}`)
            const result = response.data

            // Backend artık { data: [...], query: "..." } formatında dönüyor
            if (result.data) {
                setReportData(result.data)
                setCurrentQuery(result.query || '')
            } else {
                // Eski format için fallback
                setReportData(result)
                setCurrentQuery('')
            }
        } catch (error) {
            console.error('Report fetch error:', error)
            showToast('Rapor yüklenirken hata oluştu.', 'error')
            setReportData([])
            setCurrentQuery('')
        } finally {
            setLoading(false)
        }
    }

    const downloadCSV = () => {
        if (reportData.length === 0) return

        const headers = Object.keys(reportData[0])
        const csvContent = [
            headers.join(','),
            ...reportData.map(row => headers.map(h => row[h]).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${activeReport}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        showToast('Rapor indirildi!', 'success')
        addNotification('success', `Rapor indirildi: ${activeReport}`, 'REPORT')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <FileText className="text-primary-600" size={32} />
                        SQL Raporları
                    </h1>
                    <p className="text-slate-600 mt-1">Pure SQL sorguları ile detaylı analizler</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={downloadCSV}
                        disabled={reportData.length === 0}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} />
                        CSV İndir
                    </button>
                    <button
                        onClick={() => setShowQueryModal(true)}
                        disabled={!currentQuery}
                        className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Code size={18} />
                        SQL Görüntüle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:h-[calc(100vh-250px)]">
                {/* SOL MENU - Rapor Listesi */}
                <div className="lg:col-span-1 space-y-2 overflow-y-auto max-h-[60vh] lg:max-h-full pr-2">
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Rapor Türleri</h3>
                    {reports.map(report => {
                        const isViewOrProcedure = report.type === 'view' || report.type === 'procedure';
                        return (
                            <button
                                key={report.id}
                                onClick={() => setActiveReport(report.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all border ${
                                    activeReport === report.id
                                        ? isViewOrProcedure 
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                            : 'bg-primary-50 border-primary-200 text-primary-700'
                                        : isViewOrProcedure
                                            ? 'bg-emerald-50/30 border-emerald-200 text-slate-700 hover:bg-emerald-50'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <report.icon size={16} />
                                    <span className="font-semibold text-sm">{report.name}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* SAĞ İÇERİK - Rapor Sonuçları */}
                <div className="lg:col-span-3 flex flex-col">
                    <div className="card flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-6 flex-shrink-0">
                            <div className="flex-1 text-center">
                                <h3 className="font-bold text-lg text-slate-800 uppercase">
                                    {reports.find(r => r.id === activeReport)?.name}
                                </h3>
                            </div>
                            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {reportData.length} Kayıt
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-primary-600" size={40} />
                            </div>
                        ) : reportData.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                                <p>Veri bulunamadı</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto overflow-y-auto flex-1">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                        <tr>
                                            {Object.keys(reportData[0]).map(header => (
                                                <th key={header} className="text-left p-3 font-semibold text-slate-700 uppercase text-xs">
                                                    {translateHeader(header)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((row, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                {Object.entries(row).map(([key, value], i) => (
                                                    <td key={i} className="p-3 text-slate-700">
                                                        {typeof value === 'number' && value > 999
                                                            ? value.toLocaleString('tr-TR')
                                                            : key.toLowerCase() === 'month_name'
                                                            ? translateMonthName(value?.toString() || '-')
                                                            : value?.toString() || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* SQL AÇIKLAMA NOTU */}
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex-shrink-0">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <FileText size={16} />
                            SQL Sorgu Özellikleri
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1 ml-6 list-disc">
                            <li>Bu raporlar <strong>Pure SQL</strong> sorguları kullanır (Raw SQL)</li>
                            <li>JOIN, GROUP BY, HAVING, Subquery gibi ileri SQL teknikleri içerir</li>
                            <li>Gerçek zamanlı veritabanı verilerinden hesaplanır</li>
                            <li>PostgreSQL native fonksiyonları kullanılır (TO_CHAR, FILTER, etc.)</li>
                            <li><strong className="text-emerald-700">📊 VIEW:</strong> Karmaşık sorguları basitleştirir, sanal tablo olarak çalışır</li>
                            <li><strong className="text-emerald-700">⚙️ STORED PROCEDURE:</strong> Parametreli fonksiyonlar, performans avantajı sağlar</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* SQL Query Modal */}
            {showQueryModal && currentQuery && (
                <Portal>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQueryModal(false)}></div>

                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-6">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <Code size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">SQL Sorgusu</h2>
                                            <p className="text-slate-300 text-sm mt-1">
                                                {reports.find(r => r.id === activeReport)?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowQueryModal(false)}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                                <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
                                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                        {currentQuery}
                                    </pre>
                                </div>

                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 SQL Teknikleri</h4>
                                    <p className="text-xs text-blue-800">
                                        {reports.find(r => r.id === activeReport)?.sql}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(currentQuery)
                                        showToast('SQL sorgusu panoya kopyalandı!', 'success')
                                    }}
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
                                >
                                    Kopyala
                                </button>
                                <button
                                    onClick={() => setShowQueryModal(false)}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    )
}