import { useState, useEffect } from 'react'
import { Plus, MapPin, Calendar, X, Search, Edit2, Trash2, ArrowRight, Loader2, AlertCircle, Building2, Wrench, Package } from 'lucide-react'
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
    const [detailTab, setDetailTab] = useState('overview') // Tab state
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 25

    // Filtrelenmiş projeler
    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Paginated data
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

    // Akıllı pagination gösterimi için sayfa numaralarını hesapla
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 7
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)
            
            if (currentPage > 3) {
                pages.push('...')
            }
            
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            
            if (currentPage < totalPages - 2) {
                pages.push('...')
            }
            
            pages.push(totalPages)
        }
        
        return pages
    }

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

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
                                    paginatedProjects.map((proj) => (
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

                    {/* Pagination Controls */}
                    {!loading && filteredProjects.length > itemsPerPage && (
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-800">{startIndex + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredProjects.length)}</span> arası gösteriliyor (Toplam: <span className="font-semibold text-slate-800">{filteredProjects.length}</span>)
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
                    
                    {!loading && filteredProjects.length > 0 && filteredProjects.length <= itemsPerPage && (
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
                            Toplam <span className="font-semibold text-slate-800">{filteredProjects.length}</span> kayıt gösteriliyor
                        </div>
                    )}
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
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => { setShowDetailModal(false); setDetailTab('overview'); }}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white flex-shrink-0">
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
                                            onClick={() => { setShowDetailModal(false); setDetailTab('overview'); }}
                                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-4"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Navigation */}
                                <div className="flex border-b border-slate-200 bg-slate-50 px-6 flex-shrink-0">
                                    <button
                                        onClick={() => setDetailTab('overview')}
                                        className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                                            detailTab === 'overview' 
                                                ? 'border-primary-600 text-primary-600' 
                                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Genel Bilgiler
                                    </button>
                                    <button
                                        onClick={() => setDetailTab('equipment')}
                                        className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
                                            detailTab === 'equipment' 
                                                ? 'border-primary-600 text-primary-600' 
                                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <Wrench size={16} />
                                        Kullanılan Ekipmanlar
                                    </button>
                                    <button
                                        onClick={() => setDetailTab('materials')}
                                        className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
                                            detailTab === 'materials' 
                                                ? 'border-primary-600 text-primary-600' 
                                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <Package size={16} />
                                        Kullanılan Malzemeler
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {detailTab === 'overview' && (
                                        <div>
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
                                    )}

                                    {detailTab === 'equipment' && (
                                        <ProjectEquipmentTab projectId={selectedProject.id} />
                                    )}

                                    {detailTab === 'materials' && (
                                        <ProjectMaterialTab projectId={selectedProject.id} />
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3 flex-shrink-0">
                                    <button
                                        onClick={() => { setShowDetailModal(false); setDetailTab('overview'); }}
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                    >
                                        Kapat
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false)
                                            setDetailTab('overview')
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

// ProjectEquipmentTab Bileşeni
function ProjectEquipmentTab({ projectId }) {
    const [equipment, setEquipment] = useState([])
    const [allEquipment, setAllEquipment] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [equipmentSearch, setEquipmentSearch] = useState('')
    const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false)
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        EquipmentId: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        daily_cost: '',
        notes: ''
    })

    useEffect(() => {
        fetchData()
    }, [projectId])

    // Dropdown'ların dışına tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.equipment-dropdown-container')) {
                setShowEquipmentDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [equipRes, allEquipRes] = await Promise.all([
                api.get(`/project-equipment?projectId=${projectId}`),
                api.get('/equipment')
            ])
            setEquipment(equipRes.data)
            setAllEquipment(allEquipRes.data)
        } catch (error) {
            console.error('ProjectEquipment fetch error:', error)
            showToast('Veriler yüklenemedi: ' + (error.response?.data?.message || error.message), 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (eq) => {
        setEditingId(eq.id)
        setFormData({
            EquipmentId: eq.EquipmentId,
            start_date: eq.start_date ? new Date(eq.start_date).toISOString().split('T')[0] : '',
            end_date: eq.end_date ? new Date(eq.end_date).toISOString().split('T')[0] : '',
            daily_cost: eq.daily_cost || '',
            notes: eq.notes || ''
        })
        // Seçili ekipmanın adını bul ve search input'a koy
        const selectedEq = allEquipment.find(e => e.id === eq.EquipmentId)
        if (selectedEq) {
            setEquipmentSearch(selectedEq.name)
        }
        setShowAddForm(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                await api.put(`/project-equipment/${editingId}`, {
                    ...formData,
                    ProjectId: projectId
                })
                showToast('Ekipman güncellendi', 'success')
            } else {
                await api.post('/project-equipment', {
                    ...formData,
                    ProjectId: projectId
                })
                showToast('Ekipman eklendi', 'success')
            }
            setShowAddForm(false)
            setEditingId(null)
            setEquipmentSearch('')
            setFormData({ EquipmentId: '', start_date: new Date().toISOString().split('T')[0], end_date: '', daily_cost: '', notes: '' })
            fetchData()
        } catch (error) {
            console.error('ProjectEquipment submit error:', error)
            showToast(error.response?.data?.message || 'İşlem başarısız', 'error')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
        try {
            await api.delete(`/project-equipment/${id}`)
            showToast('Kayıt silindi', 'success')
            fetchData()
        } catch (error) {
            showToast('Silme başarısız', 'error')
        }
    }

    if (loading) return <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" size={32} /></div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Kullanılan Ekipmanlar ({equipment.length})</h3>
                <button onClick={() => { 
                    setShowAddForm(!showAddForm); 
                    if (showAddForm) { 
                        setEditingId(null); 
                        setEquipmentSearch('');
                        setFormData({ EquipmentId: '', start_date: new Date().toISOString().split('T')[0], end_date: '', daily_cost: '', notes: '' }); 
                    } 
                }} className="btn-primary text-sm">
                    {showAddForm ? 'İptal' : '+ Ekipman Ekle'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-700">{editingId ? 'Ekipman Düzenle' : 'Yeni Ekipman Ekle'}</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="equipment-dropdown-container relative">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ekipman</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ekipman ara..."
                                    value={equipmentSearch}
                                    onChange={(e) => setEquipmentSearch(e.target.value)}
                                    onFocus={() => setShowEquipmentDropdown(true)}
                                    className="input-field pr-8"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            {showEquipmentDropdown && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {allEquipment
                                        .filter(eq => eq.name.toLowerCase().includes(equipmentSearch.toLowerCase()))
                                        .map(eq => (
                                            <div
                                                key={eq.id}
                                                onClick={() => {
                                                    setFormData({ ...formData, EquipmentId: eq.id })
                                                    setEquipmentSearch(eq.name)
                                                    setShowEquipmentDropdown(false)
                                                }}
                                                className={`px-3 py-2 hover:bg-primary-50 cursor-pointer text-sm ${
                                                    formData.EquipmentId === eq.id ? 'bg-primary-100 text-primary-700 font-medium' : 'text-slate-700'
                                                }`}
                                            >
                                                {eq.name}
                                            </div>
                                        ))}
                                    {allEquipment.filter(eq => eq.name.toLowerCase().includes(equipmentSearch.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-2 text-sm text-slate-500">Sonuç bulunamadı</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Günlük Maliyet (₺)</label>
                            <input type="number" className="input-field" value={formData.daily_cost} onChange={e => setFormData({...formData, daily_cost: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Tarihi</label>
                            <input type="date" className="input-field" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş Tarihi</label>
                            <input type="date" className="input-field" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                        <textarea className="input-field" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                    </div>
                    <button type="submit" className="btn-primary w-full">Kaydet</button>
                </form>
            )}

            <div className="space-y-3">
                {equipment.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Wrench className="mx-auto mb-2 text-slate-300" size={48} />
                        <p>Henüz ekipman kaydı yok</p>
                    </div>
                ) : (
                    equipment.map(eq => (
                        <div key={eq.id} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{eq.equipment_name}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{eq.equipment_type}</p>
                                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                                        <span>Başlangıç: {new Date(eq.start_date).toLocaleDateString('tr-TR')}</span>
                                        {eq.end_date && <span>Bitiş: {new Date(eq.end_date).toLocaleDateString('tr-TR')}</span>}
                                        <span className="font-semibold text-primary-600">{eq.daily_cost} ₺/gün</span>
                                        <span className="font-semibold">{eq.total_days} gün</span>
                                    </div>
                                    {eq.notes && <p className="text-sm text-slate-500 mt-2 italic">{eq.notes}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(eq)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(eq.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// ProjectMaterialTab Bileşeni
function ProjectMaterialTab({ projectId }) {
    const [materials, setMaterials] = useState([])
    const [allMaterials, setAllMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [materialSearch, setMaterialSearch] = useState('')
    const [showMaterialDropdown, setShowMaterialDropdown] = useState(false)
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        MaterialId: '',
        quantity_used: '',
        unit_price_at_time: '',
        date_used: new Date().toISOString().split('T')[0],
        notes: ''
    })

    useEffect(() => {
        fetchData()
    }, [projectId])

    // Dropdown'ların dışına tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.material-dropdown-container')) {
                setShowMaterialDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [matRes, allMatRes] = await Promise.all([
                api.get(`/project-material?projectId=${projectId}`),
                api.get('/materials')
            ])
            console.log('ProjectMaterial data:', matRes.data)
            setMaterials(matRes.data)
            setAllMaterials(allMatRes.data)
        } catch (error) {
            console.error('ProjectMaterial fetch error:', error)
            showToast('Veriler yüklenemedi: ' + (error.response?.data?.message || error.message), 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (mat) => {
        setEditingId(mat.id)
        setFormData({
            MaterialId: mat.MaterialId,
            quantity_used: mat.quantity_used || '',
            unit_price_at_time: mat.unit_price_at_time || '',
            date_used: mat.date_used ? new Date(mat.date_used).toISOString().split('T')[0] : '',
            notes: mat.notes || ''
        })
        // Seçili malzemenin adını bul ve search input'a koy
        const selectedMat = allMaterials.find(m => m.id === mat.MaterialId)
        if (selectedMat) {
            setMaterialSearch(selectedMat.name)
        }
        setShowAddForm(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                await api.put(`/project-material/${editingId}`, {
                    ...formData,
                    ProjectId: projectId
                })
                showToast('Malzeme güncellendi', 'success')
            } else {
                await api.post('/project-material', {
                    ...formData,
                    ProjectId: projectId
                })
                showToast('Malzeme eklendi', 'success')
            }
            setShowAddForm(false)
            setEditingId(null)
            setMaterialSearch('')
            setFormData({ MaterialId: '', quantity_used: '', unit_price_at_time: '', date_used: new Date().toISOString().split('T')[0], notes: '' })
            fetchData()
        } catch (error) {
            console.error('ProjectMaterial submit error:', error)
            showToast(error.response?.data?.message || 'İşlem başarısız', 'error')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz? Stok geri eklenecek.')) return
        try {
            await api.delete(`/project-material/${id}`)
            showToast('Kayıt silindi ve stok geri eklendi', 'success')
            fetchData()
        } catch (error) {
            showToast('Silme başarısız', 'error')
        }
    }

    if (loading) return <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" size={32} /></div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Kullanılan Malzemeler ({materials.length})</h3>
                <button onClick={() => { 
                    setShowAddForm(!showAddForm); 
                    if (showAddForm) { 
                        setEditingId(null); 
                        setMaterialSearch('');
                        setFormData({ MaterialId: '', quantity_used: '', unit_price_at_time: '', date_used: new Date().toISOString().split('T')[0], notes: '' }); 
                    } 
                }} className="btn-primary text-sm">
                    {showAddForm ? 'İptal' : '+ Malzeme Ekle'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-700">{editingId ? 'Malzeme Düzenle' : 'Yeni Malzeme Ekle'}</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="material-dropdown-container relative">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Malzeme</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Malzeme ara..."
                                    value={materialSearch}
                                    onChange={(e) => setMaterialSearch(e.target.value)}
                                    onFocus={() => setShowMaterialDropdown(true)}
                                    className="input-field pr-8"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            {showMaterialDropdown && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {allMaterials
                                        .filter(mat => mat.name.toLowerCase().includes(materialSearch.toLowerCase()))
                                        .map(mat => (
                                            <div
                                                key={mat.id}
                                                onClick={() => {
                                                    setFormData({ ...formData, MaterialId: mat.id })
                                                    setMaterialSearch(`${mat.name} (Stok: ${mat.stock_quantity} ${mat.unit})`)
                                                    setShowMaterialDropdown(false)
                                                }}
                                                className={`px-3 py-2 hover:bg-primary-50 cursor-pointer text-sm ${
                                                    formData.MaterialId === mat.id ? 'bg-primary-100 text-primary-700 font-medium' : 'text-slate-700'
                                                }`}
                                            >
                                                <div>{mat.name}</div>
                                                <div className="text-xs text-slate-500">Stok: {mat.stock_quantity} {mat.unit}</div>
                                            </div>
                                        ))}
                                    {allMaterials.filter(mat => mat.name.toLowerCase().includes(materialSearch.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-2 text-sm text-slate-500">Sonuç bulunamadı</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kullanım Tarihi</label>
                            <input type="date" className="input-field" value={formData.date_used} onChange={e => setFormData({...formData, date_used: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kullanılan Miktar</label>
                            <input type="number" step="0.01" className="input-field" value={formData.quantity_used} onChange={e => setFormData({...formData, quantity_used: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Birim Fiyat (₺)</label>
                            <input type="number" step="0.01" className="input-field" value={formData.unit_price_at_time} onChange={e => setFormData({...formData, unit_price_at_time: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                        <textarea className="input-field" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                    </div>
                    <button type="submit" className="btn-primary w-full">Kaydet</button>
                </form>
            )}

            <div className="space-y-3">
                {materials.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Package className="mx-auto mb-2 text-slate-300" size={48} />
                        <p>Henüz malzeme kaydı yok</p>
                    </div>
                ) : (
                    materials.map(mat => (
                        <div key={mat.id} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{mat.material_name}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{mat.category_name}</p>
                                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                                        <span>Tarih: {new Date(mat.date_used).toLocaleDateString('tr-TR')}</span>
                                        <span className="font-semibold">{mat.quantity_used} {mat.material_unit}</span>
                                        <span className="font-semibold text-primary-600">{mat.unit_price_at_time} ₺/{mat.material_unit}</span>
                                        <span className="font-bold text-green-600">{(parseFloat(mat.quantity_used) * parseFloat(mat.unit_price_at_time)).toFixed(2)} ₺</span>
                                    </div>
                                    {mat.notes && <p className="text-sm text-slate-500 mt-2 italic">{mat.notes}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(mat)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(mat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}