import { Calendar, AlertCircle, User, FileText } from 'lucide-react'

export default function LogTable({ logs, loading, onRowClick }) {
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat('tr-TR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(date)
        } catch (e) {
            return dateString
        }
    }

    const getActionStyles = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'DELETE': return 'bg-red-100 text-red-700 border-red-200'
            case 'LOGIN': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'LOGOUT': return 'bg-red-100 text-red-700 border-red-200'
            case 'REGISTER': return 'bg-green-100 text-green-700 border-green-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const getActionLabel = (action) => {
        const labels = {
            'CREATE': 'Oluşturma',
            'UPDATE': 'Güncelleme',
            'DELETE': 'Silme',
            'LOGIN': 'Giriş',
            'LOGOUT': 'Çıkış',
            'REGISTER': 'Kayıt'
        }
        return labels[action] || action
    }

    const getTableLabel = (tableName) => {
        const labels = {
            'Projects': 'Projeler',
            'Employees': 'Çalışanlar',
            'Attendance': 'Yoklama',
            'Expenses': 'Harcamalar',
            'Materials': 'Malzemeler',
            'Equipment': 'Ekipmanlar',
            'Suppliers': 'Tedarikçiler',
            'Users': 'Kullanıcılar',
            'Roles': 'Roller'
        }
        return labels[tableName] || tableName
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
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
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Kullanıcı</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">İşlem</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Tablo</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Kayıt ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">IP Adresi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                            <tr 
                                key={log.id} 
                                onClick={() => onRowClick && onRowClick(log)}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar size={16} className="text-slate-400" />
                                        {formatDate(log.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700">
                                            {log.User?.name || log.userName || 'Sistem'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getActionStyles(log.action)}`}>
                                        {getActionLabel(log.action)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">
                                            {getTableLabel(log.tableName)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {log.recordId || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                    {log.ipAddress || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
