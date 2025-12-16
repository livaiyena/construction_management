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
    const [filterProject, setFilterProject] = useState('')
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '')
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])

    const [formData, setFormData] = useState({
        EmployeeId: '',
        ProjectId: '',
        date: new Date().toISOString().split('T')[0],
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
            date: new Date().toISOString().split('T')[0],
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Geldi': return 'bg-green-100 text-green-700'
            case 'Gelmedi': return 'bg-red-100 text-red-700'
            case 'İzinli': return 'bg-blue-100 text-blue-700'
            case 'Raporlu': return 'bg-yellow-100 text-yellow-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const filteredAttendances = attendances.filter(a => {
        let matches = true
        if (filterProject) {
            matches = matches && a.ProjectId === parseInt(filterProject)
        }
        if (filterStatus) {
            // İzinli filtresi hem İzinli hem Raporlu'yu kapsasın
            if (filterStatus === 'İzinli') {
                matches = matches && (a.status === 'İzinli' || a.status === 'Raporlu')
            } else {
                matches = matches && a.status === filterStatus
            }
        }
        if (filterDate) {
            matches = matches && a.date === filterDate
        }
        return matches
    })

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Tarih</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Proje</label>
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Tüm Projeler</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Durum</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Tüm Durumlar</option>
                            <option value="Geldi">✓ Geldi</option>
                            <option value="Gelmedi">✗ Gelmedi</option>
                            <option value="İzinli">📅 İzinli/Raporlu</option>
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                setFilterDate(new Date().toISOString().split('T')[0])
                                setFilterProject('')
                                setFilterStatus('')
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                        >
                            Filtreleri Temizle
                        </button>
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
                                filteredAttendances.map(attendance => (
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

                {/* Pagination Info */}
                {!isLoading && filteredAttendances.length > 0 && (
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
