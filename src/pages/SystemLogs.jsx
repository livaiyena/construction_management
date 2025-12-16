import { useState, useMemo } from 'react'
import { Shield } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import LogStats from '../components/settings/LogStats'
import LogFilters from '../components/settings/LogFilters'
import LogTable from '../components/settings/LogTable'

export default function SystemLogs() {
    const { notifications } = useNotification()
    const [filters, setFilters] = useState({
        category: '',
        type: ''
    })

    // Base logs (excluding AUTH as they are in Profile)
    const systemLogs = useMemo(() => {
        return notifications.filter(log => log.category !== 'AUTH')
    }, [notifications])

    // Filter logs based on selection
    const filteredLogs = useMemo(() => {
        let result = [...systemLogs]

        if (filters.category) {
            result = result.filter(log => log.category === filters.category)
        }

        if (filters.type) {
            result = result.filter(log => log.type === filters.type)
        }

        // Sort by newest first
        return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }, [systemLogs, filters])

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Sistem Denetim Kayıtları</h1>
                    <p className="text-slate-500">Tüm sistem işlemlerinin detaylı kaydı ve istatistikleri.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg">
                    <Shield size={20} />
                    <span className="font-medium">Sistem İzleme Aktif</span>
                </div>
            </div>

            {/* Stats Module */}
            <LogStats logs={systemLogs} />

            {/* Filters Module */}
            <LogFilters
                filters={filters}
                setFilters={setFilters}
                onClear={() => setFilters({ category: '', type: '' })}
            />

            {/* Logs Table Module */}
            <LogTable logs={filteredLogs} />
        </div>
    )
}
