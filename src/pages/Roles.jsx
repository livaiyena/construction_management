import { useState, useEffect } from 'react'
import { Briefcase, PlusCircle, Edit2, Trash2, DollarSign, Search, Loader2, ArrowRight, Users } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Portal from '../components/Portal'

export default function Roles() {
    const [roles, setRoles] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        default_daily_rate: ''
    })

    const { showToast } = useToast()

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/roles')
            setRoles(res.data)
        } catch (error) {
            console.error('Roles fetch error:', error)
            showToast('Roller yüklenirken hata oluştu.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ name: '', default_daily_rate: '' })
        setIsEditing(false)
        setEditId(null)
    }

    const handleEditClick = (role) => {
        setFormData({
            name: role.name,
            default_daily_rate: role.default_daily_rate || ''
        })
        setEditId(role.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return

        if (!formData.name.trim()) {
            showToast('Rol adı zorunludur.', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            if (isEditing) {
                const res = await api.put(`/roles/${editId}`, formData)
                setRoles(roles.map(r => r.id === editId ? res.data : r))
                showToast('Rol güncellendi.', 'success')
            } else {
                const res = await api.post('/roles', formData)
                setRoles([...roles, res.data])
                showToast('Yeni rol eklendi.', 'success')
            }
            setShowModal(false)
            resetForm()
        } catch (error) {
            console.error('Role submit error:', error)
            showToast(error.response?.data?.message || 'İşlem başarısız.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bu rolü silmek istediğinizden emin misiniz?')) return

        try {
            await api.delete(`/roles/${id}`)
            setRoles(roles.filter(r => r.id !== id))
            showToast('Rol silindi.', 'success')
        } catch (error) {
            console.error('Role delete error:', error)
            showToast('Rol silinirken hata oluştu.', 'error')
        }
    }

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Briefcase className="text-primary-600" size={32} />
                            Roller & Pozisyonlar
                        </h1>
                        <p className="text-slate-600 mt-1">Çalışan görev tanımları ve ücretleri</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true) }}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-600/30"
                    >
                        <PlusCircle size={20} />
                        Yeni Rol Ekle
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rol ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Roles Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Rol Adı</th>
                                    <th className="px-6 py-4">Günlük Ücret</th>
                                    <th className="px-6 py-4 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" size={20} />
                                                Yükleniyor...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Briefcase className="text-slate-300" size={48} />
                                                <p className="text-lg font-medium text-slate-900">Sonuç Bulunamadı</p>
                                                <p className="text-sm">Aradığınız kriterlere uygun rol yok.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRoles.map(role => (
                                        <tr
                                            key={role.id}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                            onClick={(e) => {
                                                if (e.target.closest('button')) return
                                                setSelectedRole(role)
                                                setShowDetailModal(true)
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <span className="font-semibold text-slate-900">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-medium bg-slate-100 w-fit px-3 py-1 rounded-md">
                                                    <DollarSign size={14} className="text-slate-500" />
                                                    {role.default_daily_rate ? parseFloat(role.default_daily_rate).toLocaleString('tr-TR') : '0'} ₺
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(role)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(role.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
                        <span>Toplam {filteredRoles.length} rol listeleniyor</span>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <Portal>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                    {isEditing ? 'Rol Düzenle' : 'Yeni Rol Ekle'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Rol Adı *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Örn: Ustabaşı, Mühendis, İşçi"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Varsayılan Günlük Ücret (₺)</label>
                                        <input
                                            type="number"
                                            value={formData.default_daily_rate}
                                            onChange={(e) => setFormData({ ...formData, default_daily_rate: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
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

                {/* ROL DETAY MODAL */}
                {showDetailModal && selectedRole && (
                    <Portal>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowDetailModal(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                                <Briefcase size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold mb-1">{selectedRole.name}</h2>
                                                <p className="text-primary-100 text-sm">Pozisyon Detayları</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-4"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 overflow-y-auto max-h-[calc(85vh-220px)]">
                                    {/* Günlük Ücret */}
                                    <div className="bg-primary-50 p-6 rounded-xl border border-primary-200 mb-6">
                                        <p className="text-xs text-primary-600 mb-2 font-semibold uppercase flex items-center gap-2">
                                            <DollarSign size={14} />
                                            Varsayılan Günlük Ücret
                                        </p>
                                        <p className="text-3xl font-bold text-primary-700">
                                            {selectedRole.default_daily_rate ? `${parseFloat(selectedRole.default_daily_rate).toLocaleString('tr-TR')} ₺` : 'Belirtilmemiş'}
                                        </p>
                                    </div>

                                    {/* Rol Bilgisi */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Pozisyon Adı</p>
                                            <p className="text-lg font-bold text-slate-800">{selectedRole.name}</p>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Rol ID</p>
                                            <p className="text-sm font-mono text-slate-700">#{selectedRole.id}</p>
                                        </div>
                                    </div>

                                    {/* İstatistikler */}
                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                            <p className="text-xs text-emerald-600 font-semibold mb-1">Aylık Maliyet</p>
                                            <p className="text-lg font-bold text-emerald-700">
                                                {selectedRole.default_daily_rate ? `${(parseFloat(selectedRole.default_daily_rate) * 30).toLocaleString('tr-TR')} ₺` : '-'}
                                            </p>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <p className="text-xs text-blue-600 font-semibold mb-1">Yıllık Maliyet</p>
                                            <p className="text-lg font-bold text-blue-700">
                                                {selectedRole.default_daily_rate ? `${(parseFloat(selectedRole.default_daily_rate) * 365).toLocaleString('tr-TR')} ₺` : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                    >
                                        Kapat
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false)
                                            handleEditClick(selectedRole)
                                        }}
                                        className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                    >
                                        Düzenle
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Portal>
                )}
            </div>
        </>
    )
}
