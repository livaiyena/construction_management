import { useState, useEffect } from 'react'
import { Calendar, PlusCircle, Edit2, Trash2, Search, Loader2, Users, Building2, Clock, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
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
            } else {
                const res = await api.post('/attendance', formData)
                setAttendances([res.data, ...attendances])
                showToast('Yoklama kaydı eklendi.', 'success')
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

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tarihe Göre Filtrele</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Projeye Göre Filtrele</label>
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Tüm Projeler</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Duruma Göre Filtrele</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Tüm Durumlar</option>
                            <option value="Geldi">✓ Geldi</option>
                            <option value="Gelmedi">✗ Gelmedi</option>
                            <option value="İzinli">📅 İzinli/Raporlu</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
                            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredAttendances.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
                    <p className="text-slate-500 text-lg">Henüz yoklama kaydı bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAttendances.map(attendance => (
                        <div key={attendance.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(attendance.status)}`}>
                                            {attendance.status}
                                        </span>
                                        <span className="text-slate-500 text-sm">{new Date(attendance.date).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="text-slate-400" size={16} />
                                            <span className="font-semibold">
                                                {attendance.Employee?.first_name || ''} {attendance.Employee?.last_name || 'Bilinmeyen'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="text-slate-400" size={16} />
                                            <span>{attendance.Project?.name || 'Proje Yok'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="text-slate-400" size={16} />
                                            <span>{attendance.worked_hours}h çalıştı</span>
                                        </div>
                                        {attendance.overtime_hours > 0 && (
                                            <div className="flex items-center gap-2 text-orange-600">
                                                <AlertCircle size={16} />
                                                <span>+{attendance.overtime_hours}h fazla</span>
                                            </div>
                                        )}
                                    </div>
                                    {attendance.notes && (
                                        <p className="mt-3 text-sm text-slate-600 italic">{attendance.notes}</p>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleEditClick(attendance)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(attendance.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <Portal>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">
                            {isEditing ? 'Yoklama Düzenle' : 'Yeni Yoklama Ekle'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Çalışan *</label>
                                    <select
                                        value={formData.EmployeeId}
                                        onChange={(e) => setFormData({ ...formData, EmployeeId: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Seçiniz</option>
                                        {employees.map(e => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Proje *</label>
                                    <select
                                        value={formData.ProjectId}
                                        onChange={(e) => setFormData({ ...formData, ProjectId: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Seçiniz</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tarih *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Durum *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="Geldi">Geldi</option>
                                        <option value="Gelmedi">Gelmedi</option>
                                        <option value="İzinli">İzinli</option>
                                        <option value="Raporlu">Raporlu</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Çalışma Saati</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="24"
                                        value={formData.worked_hours}
                                        onChange={(e) => setFormData({ ...formData, worked_hours: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Fazla Mesai</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="24"
                                        value={formData.overtime_hours}
                                        onChange={(e) => setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Notlar</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    rows="3"
                                    placeholder="Ek bilgi veya açıklama..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm() }}
                                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                                    disabled={isSubmitting}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-600/30 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : isEditing ? 'Güncelle' : 'Ekle'}
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
