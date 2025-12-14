import { useState, useEffect } from 'react'
import { FileText, TrendingUp, DollarSign, Users, Calendar, Building2, Loader2, Download, Code, X } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Portal from '../components/Portal'

export default function Reports() {
    const [loading, setLoading] = useState(false)
    const [activeReport, setActiveReport] = useState('project-expenses')
    const [reportData, setReportData] = useState([])
    const [currentQuery, setCurrentQuery] = useState('')
    const [showQueryModal, setShowQueryModal] = useState(false)
    const { showToast } = useToast()

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
        { id: 'employee-cost-report', name: 'Çalışan Maliyet Raporu', icon: Users, sql: 'FILTER, Complex JOIN' }
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* SOL MENU - Rapor Listesi */}
                <div className="lg:col-span-1 space-y-2">
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Rapor Türleri</h3>
                    {reports.map(report => (
                        <button
                            key={report.id}
                            onClick={() => setActiveReport(report.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all border ${
                                activeReport === report.id
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <report.icon size={16} />
                                <span className="font-semibold text-sm">{report.name}</span>
                            </div>
                            <p className="text-xs opacity-70 ml-6">{report.sql}</p>
                        </button>
                    ))}
                </div>

                {/* SAĞ İÇERİK - Rapor Sonuçları */}
                <div className="lg:col-span-3">
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                    {reports.find(r => r.id === activeReport)?.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    SQL: {reports.find(r => r.id === activeReport)?.sql}
                                </p>
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            {Object.keys(reportData[0]).map(header => (
                                                <th key={header} className="text-left p-3 font-semibold text-slate-700 uppercase text-xs">
                                                    {header.replace(/_/g, ' ')}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((row, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                {Object.values(row).map((value, i) => (
                                                    <td key={i} className="p-3 text-slate-700">
                                                        {typeof value === 'number' && value > 999
                                                            ? value.toLocaleString('tr-TR')
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
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <FileText size={16} />
                            SQL Sorgu Özellikleri
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1 ml-6 list-disc">
                            <li>Bu raporlar <strong>Pure SQL</strong> sorguları kullanır (sequelize.query)</li>
                            <li>JOIN, GROUP BY, HAVING, Subquery gibi ileri SQL teknikleri içerir</li>
                            <li>Gerçek zamanlı veritabanı verilerinden hesaplanır</li>
                            <li>PostgreSQL native fonksiyonları kullanılır (TO_CHAR, FILTER, etc.)</li>
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
            )}        </div>
    )
}