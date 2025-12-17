import { useState, useEffect, useMemo } from 'react'
import { Shield, RefreshCw, Download } from 'lucide-react'
import api from '../services/api'
import LogStats from '../components/settings/LogStats'
import LogFilters from '../components/settings/LogFilters'
import LogTable from '../components/settings/LogTable'
import { useToast } from '../context/ToastContext'

export default function SystemLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        category: '',
        type: ''
    })
    const { showToast } = useToast()

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const res = await api.get('/audit')
            // Backend'den gelen veri yapısı: { logs: [], pagination: {} }
            if (res.data && res.data.logs) {
                const mappedLogs = res.data.logs.map(log => ({
                    id: log.id,
                    timestamp: log.createdAt,
                    category: log.tableName,
                    entity: log.tableName,
                    description: `${log.action} - ${log.tableName} (ID: ${log.recordId})`,
                    message: `${log.action} - ${log.tableName}`,
                    type: log.action,
                    status: log.action,
                    user: log.User?.name || log.userName || 'Sistem',
                    ipAddress: log.ipAddress,
                    changes: log.changes
                }))
                setLogs(mappedLogs)
            } else if (Array.isArray(res.data)) {
                // Fallback for array response
                const mappedLogs = res.data.map(log => ({
                    id: log.id,
                    timestamp: log.createdAt,
                    category: log.tableName,
                    entity: log.tableName,
                    description: `${log.action} - ${log.tableName} (ID: ${log.recordId})`,
                    message: `${log.action} - ${log.tableName}`,
                    type: log.action,
                    status: log.action,
                    user: log.User?.name || log.userName || 'Sistem',
                    ipAddress: log.ipAddress,
                    changes: log.changes
                }))
                setLogs(mappedLogs)
            }
        } catch (error) {
            console.error('Logs fetch error:', error)
            showToast('Loglar yüklenirken hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    // Filter logs based on selection
    const filteredLogs = useMemo(() => {
        let result = [...logs]

        if (filters.category) {
            // Backend 'entity' kullanıyor, frontend filtresi 'category' gönderiyor. Uyumluluk lazım.
            // LogFilters componentine bakılmalı. Muhtemelen orada entity seçiliyor.
            result = result.filter(log => log.entity === filters.category)
        }

        if (filters.type) {
            // Backend 'action' kullanıyor (CREATE, UPDATE vs), frontend 'type' (success/error vs) mı?
            // AuditLog modelinde 'status' ve 'action' var.
            // Genelde kullanıcı işlem tipini filtrelemek ister.
            result = result.filter(log => log.action === filters.type || log.status === filters.type)
        }

        return result
    }, [logs, filters])

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Sistem Denetim Kayıtları</h1>
                    <p className="text-slate-500">Tüm sistem işlemlerinin detaylı veritabanı logları.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLogs}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Yenile"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg">
                        <Shield size={20} />
                        <span className="font-medium">Sistem İzleme Aktif</span>
                    </div>
                </div>
            </div>

            {/* Stats Module - Backend verisine göre adapte edilecek */}
            <LogStats logs={logs} />

            {/* Filters Module */}
            <LogFilters
                filters={filters}
                setFilters={setFilters}
                onClear={() => setFilters({ category: '', type: '' })}
            />

            {/* Logs Table Module */}
            <LogTable logs={filteredLogs} loading={loading} />
        </div>
    )
}
