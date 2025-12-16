import { useState, useEffect } from 'react'
import { DollarSign, PlusCircle, Edit2, Trash2, Building2, Loader2, TrendingUp, Calendar, ArrowRight, BarChart3, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'
import Portal from '../components/Portal'

export default function Expenses() {
    const [expenses, setExpenses] = useState([])
    const [projects, setProjects] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showExpenseChartModal, setShowExpenseChartModal] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    const [filterProject, setFilterProject] = useState('')

    const [formData, setFormData] = useState({
        ProjectId: '',
        category: 'Malzeme',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'Nakit',
        receipt_number: '',
        paid_to: '',
        status: 'Beklemede'
    })

    const { showToast } = useToast()
    const { addNotification } = useNotification()
    const categories = ['Malzeme', 'Maaş', 'Ekipman', 'Ulaşım', 'Yemek', 'Diğer']
    const paymentMethods = ['Nakit', 'Kredi Kartı', 'Havale', 'Çek']
    const statuses = ['Beklemede', 'Onaylandı', 'Ödendi', 'İptal']

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setIsLoading(true)
        try {
            const [expRes, projRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/projects')
            ])
            setExpenses(expRes.data)
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
            ProjectId: '',
            category: 'Malzeme',
            description: '',
            amount: '',
            expense_date: new Date().toISOString().split('T')[0],
            payment_method: 'Nakit',
            receipt_number: '',
            paid_to: '',
            status: 'Beklemede'
        })
        setIsEditing(false)
        setEditId(null)
    }

    const handleEditClick = (expense) => {
        setFormData({
            ProjectId: expense.ProjectId,
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            expense_date: expense.expense_date,
            payment_method: expense.payment_method || 'Nakit',
            receipt_number: expense.receipt_number || '',
            paid_to: expense.paid_to || '',
            status: expense.status
        })
        setEditId(expense.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return

        if (!formData.ProjectId || !formData.description || !formData.amount) {
            showToast('Proje, Açıklama ve Tutar zorunludur.', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            if (isEditing) {
                const res = await api.put(`/expenses/${editId}`, formData)
                setExpenses(expenses.map(e => e.id === editId ? res.data : e))
                showToast('Harcama güncellendi.', 'success')
                addNotification('success', `Harcama güncellendi: ${formData.amount} ₺ - ${formData.description}`, 'EXPENSE')
            } else {
                const res = await api.post('/expenses', formData)
                setExpenses([res.data, ...expenses])
                showToast('Harcama eklendi.', 'success')
                addNotification('success', `Yeni harcama eklendi: ${formData.amount} ₺ - ${formData.description}`, 'EXPENSE')
            }
            setShowModal(false)
            resetForm()
        } catch (error) {
            console.error('Expense submit error:', error)
            showToast(error.response?.data?.message || 'İşlem başarısız.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bu harcamayı silmek istediğinizden emin misiniz?')) return

        try {
            await api.delete(`/expenses/${id}`)
            setExpenses(expenses.filter(e => e.id !== id))
            showToast('Harcama silindi.', 'success')
            addNotification('warning', `Harcama silindi. (ID: ${id})`, 'EXPENSE')
        } catch (error) {
            console.error('Expense delete error:', error)
            showToast('Harcama silinirken hata oluştu.', 'error')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Beklemede': return 'bg-yellow-100 text-yellow-700'
            case 'Onaylandı': return 'bg-blue-100 text-blue-700'
            case 'Ödendi': return 'bg-green-100 text-green-700'
            case 'İptal': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const filteredExpenses = filterProject
        ? expenses.filter(e => e.ProjectId === parseInt(filterProject))
        : expenses

    const totalAmount = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <DollarSign className="text-primary-600" size={32} />
                            Harcamalar
                        </h1>
                        <p className="text-slate-600 mt-1">Proje harcama takibi</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true) }}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-600/30"
                    >
                        <PlusCircle size={20} />
                        Harcama Ekle
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Proje Filtrele</label>
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
                    <div
                        className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setShowExpenseChartModal(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 text-sm mb-1">Toplam Harcama</p>
                                <p className="text-3xl font-bold">{totalAmount.toLocaleString('tr-TR')} ₺</p>
                                <p className="text-primary-100 text-xs mt-2 flex items-center gap-1">
                                    <ArrowRight size={14} /> Detayları Gör
                                </p>
                            </div>
                            <TrendingUp size={40} className="opacity-50" />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
                                <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <DollarSign className="mx-auto text-slate-300 mb-4" size={64} />
                        <p className="text-slate-500 text-lg">Henüz harcama kaydı bulunmuyor</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredExpenses.map(expense => (
                            <div
                                key={expense.id}
                                className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                                onClick={(e) => {
                                    if (e.target.closest('button')) return
                                    setSelectedExpense(expense)
                                    setShowDetailModal(true)
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                                                {expense.category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(expense.status)}`}>
                                                {expense.status}
                                            </span>
                                            <span className="text-2xl font-bold text-primary-600">{parseFloat(expense.amount).toLocaleString('tr-TR')} ₺</span>
                                        </div>
                                        <p className="font-semibold text-slate-800 mb-2">{expense.description}</p>
                                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={16} />
                                                <span>{expense.Project?.name || 'Proje Yok'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                <span>{new Date(expense.expense_date).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                            <div>
                                                <span>Ödeme: {expense.payment_method}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEditClick(expense)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
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

                {showModal && (
                    <Portal>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                    {isEditing ? 'Harcama Düzenle' : 'Yeni Harcama Ekle'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
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
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori *</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                            >
                                                {categories.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklama *</label>
                                            <input
                                                type="text"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                                placeholder="Harcama detayı..."
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tutar (₺) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tarih</label>
                                            <input
                                                type="date"
                                                value={formData.expense_date}
                                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ödeme Yöntemi</label>
                                            <select
                                                value={formData.payment_method}
                                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                            >
                                                {paymentMethods.map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Durum</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                            >
                                                {statuses.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
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

                {/* HARCAMA DETAY MODAL */}
                {showDetailModal && selectedExpense && (
                    <Portal>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowDetailModal(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold mb-2">Harcama Detayı</h2>
                                            <div className="flex flex-wrap gap-2 text-sm">
                                                <span className="bg-white/20 px-3 py-1 rounded-full font-semibold">
                                                    {selectedExpense.category}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full font-semibold ${selectedExpense.status === 'Ödendi' ? 'bg-emerald-100 text-emerald-700' :
                                                    selectedExpense.status === 'Onaylandı' ? 'bg-blue-100 text-blue-700' :
                                                        selectedExpense.status === 'Beklemede' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {selectedExpense.status}
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
                                    {/* Tutar */}
                                    <div className="bg-primary-50 p-6 rounded-xl border border-primary-200 mb-6 text-center">
                                        <p className="text-xs text-primary-600 mb-2 font-semibold uppercase">Harcama Tutarı</p>
                                        <p className="text-4xl font-bold text-primary-700">
                                            {parseFloat(selectedExpense.amount).toLocaleString('tr-TR')} ₺
                                        </p>
                                    </div>

                                    {/* Açıklama */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                                        <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Açıklama</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">{selectedExpense.description}</p>
                                    </div>

                                    {/* Bilgiler Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Proje</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {selectedExpense.Project?.name || 'Belirtilmemiş'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Tarih</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {new Date(selectedExpense.expense_date).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ödeme Detayları */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Ödeme Yöntemi</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedExpense.payment_method}</p>
                                        </div>
                                        {selectedExpense.receipt_number && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Fiş No</p>
                                                <p className="text-sm font-mono text-slate-700">{selectedExpense.receipt_number}</p>
                                            </div>
                                        )}
                                        {selectedExpense.paid_to && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Ödenen Kişi/Firma</p>
                                                <p className="text-sm font-bold text-slate-800">{selectedExpense.paid_to}</p>
                                            </div>
                                        )}
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
                                            handleEditClick(selectedExpense)
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

                {/* Harcama Grafik Modal */}
                {showExpenseChartModal && (
                    <Portal>
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowExpenseChartModal(false)}></div>

                            <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="sticky top-0 z-10 bg-gradient-to-br from-violet-600 to-purple-700 p-6 rounded-t-2xl">
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                                <BarChart3 size={28} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">Proje Bazında Harcamalar</h2>
                                                <p className="text-violet-100 text-sm mt-1">Detaylı harcama analizi ve dağılım</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowExpenseChartModal(false)}
                                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6">
                                    {/* İstatistik Kartları */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 p-5 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-violet-600 text-sm font-semibold mb-1">Toplam Harcama</p>
                                                    <p className="text-2xl font-bold text-violet-900">{totalAmount.toLocaleString('tr-TR')} ₺</p>
                                                </div>
                                                <DollarSign size={32} className="text-violet-400" />
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-5 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-blue-600 text-sm font-semibold mb-1">Aktif Proje Sayısı</p>
                                                    <p className="text-2xl font-bold text-blue-900">{projects.filter(p => p.status === 'Devam Ediyor').length}</p>
                                                </div>
                                                <Building2 size={32} className="text-blue-400" />
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-emerald-600 text-sm font-semibold mb-1">Ortalama Harcama</p>
                                                    <p className="text-2xl font-bold text-emerald-900">
                                                        {projects.length > 0 ? Math.floor(totalAmount / projects.length).toLocaleString('tr-TR') : '0'} ₺
                                                    </p>
                                                </div>
                                                <TrendingUp size={32} className="text-emerald-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sütun Grafiği */}
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Proje Bazında Harcama Dağılımı</h3>
                                        {projects.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={(() => {
                                                    const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1']
                                                    return projects.map((project, index) => {
                                                        const projectExpenses = expenses.filter(exp => exp.ProjectId === project.id)
                                                        const projectTotal = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
                                                        return {
                                                            name: project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name,
                                                            fullName: project.name,
                                                            harcama: projectTotal,
                                                            fill: COLORS[index % COLORS.length]
                                                        }
                                                    })
                                                })()}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis
                                                        dataKey="name"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={100}
                                                        tick={{ fontSize: 12, fill: '#475569' }}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 12, fill: '#475569' }}
                                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                                    />
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload[0]) {
                                                                return (
                                                                    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                                                                        <p className="font-bold text-slate-800 mb-2">{payload[0].payload.fullName}</p>
                                                                        <p className="text-violet-600 font-semibold">
                                                                            {Math.floor(payload[0].value).toLocaleString('tr-TR')} ₺
                                                                        </p>
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                    <Bar dataKey="harcama" radius={[8, 8, 0, 0]}>
                                                        {projects.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center py-12 text-slate-500">
                                                <Building2 size={48} className="mx-auto mb-3 opacity-30" />
                                                <p>Henüz proje bulunmuyor</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Detaylı Liste */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Proje Detayları</h3>
                                        <div className="space-y-3">
                                            {projects.map((project, index) => {
                                                const projectExpenses = expenses.filter(exp => exp.ProjectId === project.id)
                                                const projectTotal = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
                                                const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1']

                                                return (
                                                    <div key={project.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div
                                                                    className="w-4 h-4 rounded-full"
                                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                                ></div>
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-slate-800">{project.name}</p>
                                                                    <p className="text-xs text-slate-500 mt-1">{projectExpenses.length} harcama kaydı</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold text-violet-600">
                                                                    {Math.floor(projectTotal).toLocaleString('tr-TR')} ₺
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {totalAmount > 0 ? `%${((projectTotal / totalAmount) * 100).toFixed(1)}` : '0%'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="sticky bottom-0 p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                                    <button
                                        onClick={() => setShowExpenseChartModal(false)}
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                    >
                                        Kapat
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
