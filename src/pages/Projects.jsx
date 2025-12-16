import { useState, useEffect } from 'react'
import { Plus, MapPin, Calendar, X, Search, Edit2, Trash2, ArrowRight, Loader2, AlertCircle, Building2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'
import Skeleton from '../components/ui/Skeleton'
import Portal from '../components/Portal'

export default function Projects() {
    const [projects, setProjects] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        district: '',
        address: '',
        budget: '',
        currency: 'TRY',
        status: 'Planlama',
        start_date: new Date().toISOString().substring(0, 10)
    })

    const { showToast } = useToast()
    const { addNotification } = useNotification()

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const res = await api.get('/projects');
            setProjects(res.data)
        } catch (err) {
            console.error("API Hatası:", err)
            // Hata durumunda mock data kullanmayı bırakıp, kullanıcıya hata bildirimi gösteriyoruz.
            showToast('Projeler yüklenemedi. Sunucu bağlantınızı kontrol edin.', 'error')
            setProjects([]) // Veri yoksa boş liste göster
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            city: '',
            district: '',
            address: '',
            budget: '',
            currency: 'TRY',
            status: 'Planlama',
            start_date: new Date().toISOString().substring(0, 10)
        })
        setIsEditing(false)
        setEditId(null)
    }

    const handleEditClick = (project) => {
        setFormData({
            name: project.name,
            city: project.city,
            district: project.district,
            address: project.address || '',
            budget: project.budget ? parseFloat(project.budget).toLocaleString('tr-TR') : '',
            currency: project.currency || 'TRY',
            status: project.status,
            // Tarih formatını uyumlu hale getiriyoruz
            start_date: project.start_date ? new Date(project.start_date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
        })
        setEditId(project.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isSubmitting) return;

        setIsSubmitting(true)

        try {
            // Bütçeyi formatlanmış halden sayıya çevir
            const budgetValue = formData.budget.replace(/\./g, '').replace(/,/g, '.')

            const dataToSend = {
                ...formData,
                budget: parseFloat(budgetValue) || 0
            };

            if (isEditing) {
                const res = await api.put(`/projects/${editId}`, dataToSend)
                setProjects(projects.map(proj => proj.id === editId ? res.data : proj))
                showToast('Proje bilgileri güncellendi.', 'success')
                addNotification('success', `Proje güncellendi: ${dataToSend.name}`, 'PROJECT')
            } else {
                const res = await api.post('/projects', dataToSend)
                // Yeni projeyi listenin başına ekle
                setProjects([res.data, ...projects])
                showToast('Yeni proje başarıyla oluşturuldu.', 'success')
                addNotification('success', `Yeni proje oluşturuldu: ${dataToSend.name}`, 'PROJECT')
            }
            setShowModal(false)
            resetForm()
        } catch (err) {
            const msg = err.response?.data?.message || 'İşlem başarısız.'
            showToast(msg, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/projects/${id}`)
                setProjects(projects.filter(proj => proj.id !== id))
                showToast('Proje başarıyla silindi.', 'info')
                addNotification('warning', `Proje silindi. (ID: ${id})`, 'PROJECT')
            } catch (err) {
                showToast('Silme işlemi başarısız.', 'error')
            }
        }
    }

    // Proje durumuna göre stil belirleme fonksiyonu
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Tamamlandı':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Devam Ediyor':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Planlama':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }

    return (
        <>
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projeler</h1>
                        <p className="text-slate-500 mt-1">{projects.length} Aktif ve Tamamlanmış Proje</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true) }}
                        className="btn-primary shadow-xl shadow-primary-500/20"
                    >
                        <Plus size={20} /> Yeni Proje Oluştur
                    </button>
                </div>

                <div className="card border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden p-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Proje adı veya konumu ara..."
                                className="input-field pl-10 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proje Adı</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Şehir</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">İlçe</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Başlangıç</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Bütçe (₺)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-32 ml-auto" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></td>
                                        </tr>
                                    ))
                                ) : projects.filter(p =>
                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
                                ).length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertCircle size={32} className="text-slate-300" />
                                                <p>{searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kayıtlı proje yok.'}</p>
                                                {!searchTerm && (
                                                    <button
                                                        onClick={() => { resetForm(); setShowModal(true) }}
                                                        className="mt-4 btn-secondary"
                                                    >
                                                        İlk Projenizi Oluşturun
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    projects.filter(p =>
                                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
                                    ).map((proj) => (
                                        <tr
                                            key={proj.id}
                                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                            onClick={(e) => {
                                                // Eğer tıklanan element buton ise modal açma
                                                if (e.target.closest('button')) return
                                                setSelectedProject(proj)
                                                setShowDetailModal(true)
                                            }}
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="font-semibold">{proj.name}</div>
                                                {proj.address && (
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <MapPin size={12} className="text-slate-400" /> {proj.address}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{proj.city}</td>
                                            <td className="px-6 py-4 text-slate-600">{proj.district}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(proj.status)}`}>
                                                    {proj.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {proj.start_date ? new Date(proj.start_date).toLocaleDateString('tr-TR') : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-primary-700">
                                                {proj.budget ? (() => {
                                                    const currency = proj.currency || 'TRY'
                                                    const symbols = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' }
                                                    return `${Number(proj.budget).toLocaleString('tr-TR')} ${symbols[currency]}`
                                                })() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(proj)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(proj.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                </div>

                {/* Modal Overlay */}
                {showModal && (
                    <Portal>
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />

                            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-black/5">
                                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {isEditing ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-2 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Proje Adı</label>
                                            <input type="text" placeholder="Örn: Vadi Konakları" className="input-field"
                                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Şehir (İl)</label>
                                                <input type="text" placeholder="Örn: İstanbul" className="input-field"
                                                    value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                                                <input type="text" placeholder="Örn: Sarıyer" className="input-field"
                                                    value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Adres (Opsiyonel)</label>
                                            <input type="text" placeholder="Örn: Bahçeşehir Mahallesi, 1. Cadde No: 12" className="input-field"
                                                value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Tarihi</label>
                                            <input type="date" className="input-field"
                                                value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Bütçe</label>
                                            <div className="flex gap-2">
                                                <select
                                                    className="input-field w-32"
                                                    value={formData.currency}
                                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                                >
                                                    <option value="TRY">₺ TRY</option>
                                                    <option value="USD">$ USD</option>
                                                    <option value="EUR">€ EUR</option>
                                                    <option value="GBP">£ GBP</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="5.000.000"
                                                    className="input-field flex-1"
                                                    value={formData.budget}
                                                    onChange={e => {
                                                        const value = e.target.value.replace(/[^\d]/g, '')
                                                        const formatted = value ? Number(value).toLocaleString('tr-TR') : ''
                                                        setFormData({ ...formData, budget: formatted })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                                            <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Planlama">Planlama</option>
                                                <option value="Devam Ediyor">Devam Ediyor</option>
                                                <option value="Tamamlandı">Tamamlandı</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                        <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">İptal</button>
                                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    {isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                                                </>
                                            ) : (
                                                <>{isEditing ? 'Güncelle' : 'Projeyi Oluştur'}</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Portal>
                )}

                {/* PROJE DETAY MODAL */}
                {showDetailModal && selectedProject && (
                    <Portal>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowDetailModal(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
                                            <div className="flex flex-wrap gap-3">
                                                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                                                    <Building2 size={16} />
                                                    {selectedProject.city}, {selectedProject.district}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full font-semibold text-sm ${selectedProject.status === 'Devam Ediyor' ? 'bg-emerald-100 text-emerald-700' :
                                                    selectedProject.status === 'Tamamlandı' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {selectedProject.status}
                                                </span>
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
                                    {/* Proje Bilgileri Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Başlangıç Tarihi */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Başlangıç Tarihi</p>
                                            <p className="text-lg font-bold text-slate-800">
                                                {new Date(selectedProject.start_date).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>

                                        {/* Bütçe */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Bütçe</p>
                                            <p className="text-lg font-bold text-primary-600">
                                                {(() => {
                                                    const currency = selectedProject.currency || 'TRY'
                                                    const symbols = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' }
                                                    return `${parseFloat(selectedProject.budget).toLocaleString('tr-TR')} ${symbols[currency]}`
                                                })()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Adres Bilgisi */}
                                    {selectedProject.address && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                                            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Adres</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{selectedProject.address}</p>
                                        </div>
                                    )}

                                    {/* Proje İstatistikleri */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                            <p className="text-xs text-emerald-600 font-semibold mb-1">Durum</p>
                                            <p className="text-2xl font-bold text-emerald-700">{selectedProject.status}</p>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <p className="text-xs text-blue-600 font-semibold mb-1">Konum</p>
                                            <p className="text-sm font-bold text-blue-700">{selectedProject.city}</p>
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
                                            handleEditClick(selectedProject)
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