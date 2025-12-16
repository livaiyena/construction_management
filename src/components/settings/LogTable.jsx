import { Calendar, AlertCircle } from 'lucide-react'

export default function LogTable({ logs }) {
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat('tr-TR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date)
        } catch (e) {
            return dateString
        }
    }

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'error': return 'bg-red-100 text-red-700 border-red-200'
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'info': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const getCategoryLabel = (cat) => {
        const map = {
            'AUTH': 'Kimlik İşlemleri',
            'PROJECT': 'Proje Yönetimi',
            'EMPLOYEE': 'Personel',
            'ATTENDANCE': 'Yoklama',
            'EXPENSE': 'Finans',
            'INVENTORY': 'Envanter',
            'REPORT': 'Raporlama',
            'SYSTEM': 'Sistem'
        }
        return map[cat] || cat || 'Genel'
    }

    if (logs.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={48} className="mb-4 text-slate-300" />
                <p>Görüntülenecek kayıt bulunamadı.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Zaman</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Kategori</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Mesaj</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar size={16} className="text-slate-400" />
                                        {formatDate(log.timestamp)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-slate-700">
                                        {getCategoryLabel(log.category)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-slate-700">{log.message}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeStyles(log.type)}`}>
                                        {log.type.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
