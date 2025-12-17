import { useState, useEffect, useMemo } from 'react'
import { Shield, RefreshCw, Download } from 'lucide-react'
import api from '../services/api'
import LogStats from '../components/settings/LogStats'
import LogFilters from '../components/settings/LogFilters'
import LogTable from '../components/settings/LogTable'
import LogDetailModal from '../components/settings/LogDetailModal'
import { useToast } from '../context/ToastContext'

export default function SystemLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLog, setSelectedLog] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    })
    const [filters, setFilters] = useState({
        category: '',
        type: ''
    })
    const { showToast } = useToast()

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit
            }
            
            // Backend filtreleri ekle
            if (filters.category) {
                params.tableName = filters.category
            }
            if (filters.type) {
                params.action = filters.type
            }

            const res = await api.get('/audit', { params })
            
            if (res.data && res.data.logs) {
                setLogs(res.data.logs)
                setPagination({
                    ...pagination,
                    total: res.data.pagination.total,
                    pages: res.data.pagination.pages
                })
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
    }, [filters.category, filters.type, pagination.page])

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters)
        setPagination({ ...pagination, page: 1 }) // Reset to first page on filter change
    }

    const handleClearFilters = () => {
        setFilters({ category: '', type: '' })
        setPagination({ ...pagination, page: 1 })
    }

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

            {/* Stats Module */}
            <LogStats logs={logs} total={pagination.total} />

            {/* Filters Module */}
            <LogFilters
                filters={filters}
                setFilters={handleFilterChange}
                onClear={handleClearFilters}
            />

            {/* Logs Table Module */}
            <LogTable 
                logs={logs} 
                loading={loading} 
                onRowClick={setSelectedLog}
            />

            {/* Log Detail Modal */}
            {selectedLog && (
                <LogDetailModal 
                    log={selectedLog} 
                    onClose={() => setSelectedLog(null)}
                />
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Önceki
                    </button>
                    <span className="text-sm text-slate-600">
                        Sayfa {pagination.page} / {pagination.pages} ({pagination.total} kayıt)
                    </span>
                    <button
                        onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    )
}
