import { useState, useEffect } from 'react'
import { Calendar, PlusCircle, Edit2, Trash2, Search, Loader2, Users, Building2, Clock, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'
import Portal from '../components/Portal'

export default function Attendance() {
    const [searchParams] = useSearchParams()
    const [attendances, setAttendances] = useState([])
    const [employees, setEmployees] = useState([])
    const [projects, setProjects] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    
    // Bugünün tarihini local timezone'da hesapla (UTC değil)
    const getTodayDate = () => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    
    // Yeni temiz filtre yapısı
    const [filters, setFilters] = useState(() => {
        const todayDate = getTodayDate()
        return {
            dateMode: 'today',
            startDate: todayDate,
            endDate: todayDate,
            projectId: '',
            status: searchParams.get('status') || ''
        }
    })

    const [formData, setFormData] = useState({
        EmployeeId: '',
        ProjectId: '',
        date: getTodayDate(),
        status: 'Geldi',
        worked_hours: 8.0,
        overtime_hours: 0,
        notes: ''
    })

    const { showToast } = useToast()
    const { addNotification } = useNotification()

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setIsLoading(true)
        try {
            const [attRes, empRes, projRes] = await Promise.all([
                api.get('/attendance'),
                api.get('/employees'),
                api.get('/projects')
            ])
            
            // Debug: Veri formatını ve filtreleme mantığını kontrol et
            if (attRes.data && attRes.data.length > 0) {
                const sample = attRes.data[0]
                const today = new Date()
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                
                console.log('🔍 YOKLAMA DEBUG:', {
                    bugün: todayStr,
                    örnek_kayıt_date: sample.date,
                    örnek_kayıt_type: typeof sample.date,
                    örnek_kayıt_isDate: sample.date instanceof Date,
                    toplam_kayıt: attRes.data.length,
                    bugünün_kayıtları: attRes.data.filter(a => {
                        let aDate = a.date
                        if (aDate instanceof Date) {
                            aDate = `${aDate.getFullYear()}-${String(aDate.getMonth() + 1).padStart(2, '0')}-${String(aDate.getDate()).padStart(2, '0')}`
                        } else if (typeof aDate === 'string' && aDate.includes('T')) {
                            aDate = aDate.split('T')[0]
                        } else if (typeof aDate === 'string') {
                            aDate = aDate.substring(0, 10)
                        }
                        return aDate === todayStr
                    }).length
                })
            }
            
            setAttendances(attRes.data)
            setEmployees(empRes.data)
            setProjects(projRes.data)
        } catch (error) {
            console.error('Data fetch error:', error)
            showToast('Veriler yüklenirken hata oluştu.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            EmployeeId: '',
            ProjectId: '',
            date: getTodayDate(),
            status: 'Geldi',
            worked_hours: 8.0,
            overtime_hours: 0,
            notes: ''
        })
        setIsEditing(false)
        setEditId(null)
    }

    const handleEditClick = (attendance) => {
        setFormData({
            EmployeeId: attendance.EmployeeId,
            ProjectId: attendance.ProjectId,
            date: attendance.date,
            status: attendance.status,
            worked_hours: attendance.worked_hours,
            overtime_hours: attendance.overtime_hours,
            notes: attendance.notes || ''
        })
        setEditId(attendance.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return

        if (!formData.EmployeeId || !formData.ProjectId || !formData.date) {
            showToast('Çalışan, Proje ve Tarih zorunludur.', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            if (isEditing) {
                const res = await api.put(`/attendance/${editId}`, formData)
                setAttendances(attendances.map(a => a.id === editId ? res.data : a))
                showToast('Yoklama güncellendi.', 'success')
                addNotification('success', `Yoklama güncellendi: ${new Date(formData.date).toLocaleDateString()} - ${formData.status}`, 'ATTENDANCE')
            } else {
                const res = await api.post('/attendance', formData)
                setAttendances([res.data, ...attendances])
                showToast('Yoklama kaydı eklendi.', 'success')
                addNotification('success', `Yeni yoklama eklendi: ${new Date(formData.date).toLocaleDateString()} - ${formData.status}`, 'ATTENDANCE')
            }
            setShowModal(false)
            resetForm()
        } catch (error) {
            console.error('Attendance submit error:', error)
            showToast(error.response?.data?.message || 'İşlem başarısız.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bu yoklama kaydını silmek istediğinizden emin misiniz?')) return

        try {
            await api.delete(`/attendance/${id}`)
            setAttendances(attendances.filter(a => a.id !== id))
            showToast('Yoklama kaydı silindi.', 'success')
            addNotification('warning', `Yoklama kaydı silindi (ID: ${id})`, 'ATTENDANCE')
        } catch (error) {
            console.error('Attendance delete error:', error)
            showToast('Kayıt silinirken hata oluştu.', 'error')
        }
    }

    // Tarih filtresi uygulama fonksiyonu - useEffect'ten önce tanımlanmalı
    const applyDateFilter = (mode) => {
        const today = new Date()
        const formatDate = (date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }
        
        switch (mode) {
            case 'today':
                setFilters(prev => ({
                    ...prev,
                    dateMode: 'today',
                    startDate: formatDate(today),
                    endDate: formatDate(today)
                }))
                break
                
            case 'yesterday':
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)
                setFilters(prev => ({
                    ...prev,
                    dateMode: 'yesterday',
                    startDate: formatDate(yesterday),
                    endDate: formatDate(yesterday)
                }))
                break
                
            case 'week':
                // Bu hafta (Pazartesi - Pazar)
                const dayOfWeek = today.getDay()
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                const monday = new Date(today)
                monday.setDate(today.getDate() - diff)
                const sunday = new Date(monday)
                sunday.setDate(monday.getDate() + 6)
                setFilters(prev => ({
                    ...prev,
                    dateMode: 'week',
                    startDate: formatDate(monday),
                    endDate: formatDate(sunday)
                }))
                break
                
            case 'last7':
                const weekAgo = new Date(today)
                weekAgo.setDate(today.getDate() - 6)
                setFilters(prev => ({
                    ...prev,
                    dateMode: 'last7',
                    startDate: formatDate(weekAgo),
                    endDate: formatDate(today)
                }))
                break
                
            case 'month':
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                setFilters(prev => ({
                    ...prev,
                    dateMode: 'month',
                    startDate: formatDate(firstDay),
                    endDate: formatDate(lastDay)
                }))
                break
                
            case 'all':
                setFilters(prev => ({
                    ...prev,
                    dateMode: 'all',
                    startDate: '',
                    endDate: ''
                }))
                break
                
            case 'custom':
                setFilters(prev => ({
                    ...prev,
                    dateMode: 'custom'
                }))
                break
                
            default:
                break
        }
    }

    // Filtrelenmiş yoklama listesi
    const filteredAttendances = attendances.filter(attendance => {
        // Proje filtresi
        if (filters.projectId && attendance.ProjectId !== parseInt(filters.projectId)) {
            return false
        }
        
        // Durum filtresi
        if (filters.status) {
            if (filters.status === 'İzinli') {
                if (attendance.status !== 'İzinli' && attendance.status !== 'Raporlu') {
                    return false
                }
            } else if (attendance.status !== filters.status) {
                return false
            }
        }
        
        // Tarih filtresi - UTC timezone offset düzeltmesi
        if (filters.dateMode !== 'all' && attendance.date) {
            let attendanceDate
            
            if (attendance.date instanceof Date) {
                // Date object ise local timezone kullan
                const d = attendance.date
                attendanceDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            } else if (typeof attendance.date === 'string') {
                // String ise - UTC offset'i düzelt
                const d = new Date(attendance.date)
                // Local timezone'da tarihi al (UTC değil!)
                attendanceDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            } else {
                // Diğer tipler için string'e çevir
                const d = new Date(attendance.date)
                attendanceDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            }
            
            if (filters.startDate && filters.endDate) {
                if (attendanceDate < filters.startDate || attendanceDate > filters.endDate) {
                    return false
                }
            } else if (filters.startDate) {
                if (attendanceDate < filters.startDate) {
                    return false
                }
            } else if (filters.endDate) {
                if (attendanceDate > filters.endDate) {
                    return false
                }
            }
        }
        
        return true
    })

    // Tüm filtreleri temizle
    const clearFilters = () => {
        const todayDate = getTodayDate()
        setFilters({
            dateMode: 'today',
            startDate: todayDate,
            endDate: todayDate,
            projectId: '',
            status: ''
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Geldi': return 'bg-green-100 text-green-700'
            case 'Gelmedi': return 'bg-red-100 text-red-700'
            case 'İzinli': return 'bg-blue-100 text-blue-700'
            case 'Raporlu': return 'bg-yellow-100 text-yellow-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 25

    // Paginated data
    const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedAttendances = filteredAttendances.slice(startIndex, endIndex)
    // Akıllı pagination gösterimi için sayfa numaralarını hesapla
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 7 // Gösterilecek maksimum sayfa sayısı
        
        if (totalPages <= maxPagesToShow) {
            // Tüm sayfaları göster
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // İlk sayfa
            pages.push(1)
            
            if (currentPage > 3) {
                pages.push('...')
            }
            
            // Mevcut sayfa etrafındaki sayfalar
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            
            if (currentPage < totalPages - 2) {
                pages.push('...')
            }
            
            // Son sayfa
            pages.push(totalPages)
        }
        
        return pages
    }
    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filters.dateMode, filters.projectId, filters.status, filters.startDate, filters.endDate])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Calendar className="text-primary-600" size={32} />
                        Yoklama & Devamsızlık
                    </h1>
                    <p className="text-slate-600 mt-1">Günlük çalışan yoklama takibi</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true) }}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-600/30"
                >
                    <PlusCircle size={20} />
                    Yoklama Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                {/* Quick Date Filters */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-200">
                    <button
                        onClick={() => applyDateFilter('today')}
                        className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                            filters.dateMode === 'today' 
                                ? 'bg-primary-600 text-white shadow-md' 
                                : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                        }`}
                    >
                        📅 Bugün
                    </button>
                    <button
                        onClick={() => applyDateFilter('yesterday')}
                        className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                            filters.dateMode === 'yesterday' 
                                ? 'bg-slate-700 text-white shadow-md' 
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        ⏮️ Dün
                    </button>
                    <button
                        onClick={() => applyDateFilter('week')}
                        className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                            filters.dateMode === 'week' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                    >
                        📊 Bu Hafta
                    </button>
                    <button
                        onClick={() => applyDateFilter('last7')}
                        className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                            filters.dateMode === 'last7' 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        📈 Son 7 Gün
                    </button>
                    <button
                        onClick={() => applyDateFilter('month')}
                        className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                            filters.dateMode === 'month' 
                                ? 'bg-purple-600 text-white shadow-md' 
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                    >
                        📆 Bu Ay
                    </button>
                    <button
                        onClick={() => applyDateFilter('all')}
                        className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                            filters.dateMode === 'all' 
                                ? 'bg-green-600 text-white shadow-md' 
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                    >
                        🌐 Tüm Tarihler
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    {/* Başlangıç Tarihi */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Başlangıç Tarihi
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, startDate: e.target.value, dateMode: 'custom' }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* Bitiş Tarihi */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Bitiş Tarihi
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, endDate: e.target.value, dateMode: 'custom' }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* Proje Filtresi */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Proje
                        </label>
                        <select
                            value={filters.projectId}
                            onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Tüm Projeler</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Durum Filtresi */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Durum
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Tüm Durumlar</option>
                            <option value="Geldi">✅ Geldi</option>
                            <option value="Gelmedi">❌ Gelmedi</option>
                            <option value="İzinli">📅 İzinli/Raporlu</option>
                        </select>
                    </div>
                    
                    {/* Temizle Butonu */}
                    <div>
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={16} />
                            Filtreleri Temizle
                        </button>
                    </div>
                </div>
                
                {/* Active Filter Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold">Aktif Filtreler:</span>
                        {filters.dateMode !== 'all' && (
                            <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded">
                                📅 {filters.startDate === filters.endDate 
                                    ? new Date(filters.startDate).toLocaleDateString('tr-TR')
                                    : `${new Date(filters.startDate).toLocaleDateString('tr-TR')} - ${new Date(filters.endDate).toLocaleDateString('tr-TR')}`
                                }
                            </span>
                        )}
                        {filters.projectId && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                🏗️ {projects.find(p => p.id === parseInt(filters.projectId))?.name}
                            </span>
                        )}
                        {filters.status && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                                {filters.status === 'Geldi' ? '✅' : filters.status === 'Gelmedi' ? '❌' : '📅'} {filters.status}
                            </span>
                        )}
                        <span className="ml-auto font-semibold text-primary-600">
                            {filteredAttendances.length} kayıt bulundu
                        </span>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tarih</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Çalışan</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Proje</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Durum</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Çalışma</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Fazla Mesai</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-4 py-3"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredAttendances.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center">
                                        <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                                        <p className="text-slate-500">Henüz yoklama kaydı bulunmuyor</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedAttendances.map(attendance => (
                                    <tr key={attendance.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                            {new Date(attendance.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-xs font-bold text-primary-700">
                                                    {attendance.Employee?.first_name?.charAt(0)}{attendance.Employee?.last_name?.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">
                                                    {attendance.Employee?.first_name} {attendance.Employee?.last_name || 'Bilinmeyen'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {attendance.Project?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(attendance.status)}`}>
                                                {attendance.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-slate-700">{attendance.worked_hours}h</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {attendance.overtime_hours > 0 ? (
                                                <span className="text-sm font-medium text-orange-600">+{attendance.overtime_hours}h</span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleEditClick(attendance)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(attendance.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!isLoading && filteredAttendances.length > itemsPerPage && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">{startIndex + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredAttendances.length)}</span> arası gösteriliyor (Toplam: <span className="font-semibold text-slate-800">{filteredAttendances.length}</span>)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Önceki
                            </button>
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                currentPage === page
                                                    ? 'bg-primary-600 text-white font-semibold'
                                                    : 'border border-slate-300 hover:bg-slate-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
                
                {!isLoading && filteredAttendances.length > 0 && filteredAttendances.length <= itemsPerPage && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
                        Toplam <span className="font-semibold text-slate-800">{filteredAttendances.length}</span> kayıt gösteriliyor
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {isEditing ? 'Yoklama Düzenle' : 'Yeni Yoklama Ekle'}
                                </h2>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Çalışan *</label>
                                            <select
                                                value={formData.EmployeeId}
                                                onChange={(e) => setFormData({ ...formData, EmployeeId: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Seçiniz</option>
                                                {employees.map(e => (
                                                    <option key={e.id} value={e.id}>
                                                        {e.first_name} {e.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Proje *</label>
                                            <select
                                                value={formData.ProjectId}
                                                onChange={(e) => setFormData({ ...formData, ProjectId: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Seçiniz</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tarih *</label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Durum *</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="Geldi">✓ Geldi</option>
                                                <option value="Gelmedi">✗ Gelmedi</option>
                                                <option value="İzinli">📅 İzinli</option>
                                                <option value="Raporlu">📋 Raporlu</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Çalışma Saati</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="24"
                                                value={formData.worked_hours}
                                                onChange={(e) => setFormData({ ...formData, worked_hours: parseFloat(e.target.value) })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Örn: 8"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fazla Mesai (saat)</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="24"
                                                value={formData.overtime_hours}
                                                onChange={(e) => setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Örn: 2"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notlar</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            rows="2"
                                            placeholder="İsteğe bağlı açıklama..."
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm() }}
                                        className="flex-1 px-4 py-2.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-all font-medium"
                                        disabled={isSubmitting}
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 text-sm rounded-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Kaydediliyor...
                                            </>
                                        ) : (
                                            <>{isEditing ? 'Güncelle' : 'Kaydet'}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    )
}
