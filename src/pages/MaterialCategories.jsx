import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Tag, AlertCircle } from 'lucide-react'
import { categoryService } from '../services/modules'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'

export default function MaterialCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const { showToast } = useToast()
    const { addNotification } = useNotification()
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAll()
            setCategories(data)
        } catch (error) {
            console.error(error)
            // Silent fail if endpoint doesn't exist, generic toast
            // showToast('Kategoriler yüklenemedi', 'error')
            setCategories([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await categoryService.create(formData)
            showToast('Kategori başarıyla eklendi', 'success')
            addNotification('success', `Yeni malzeme kategorisi eklendi: ${formData.name}`, 'INVENTORY')
            setShowModal(false)
            setFormData({ name: '', description: '' })
            fetchCategories()
        } catch (error) {
            showToast('Kategori eklenirken hata oluştu', 'error')
        }
    }

    const handleDelete = async (id, name) => {
        if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
            try {
                await categoryService.delete(id)
                showToast('Kategori silindi', 'success')
                addNotification('warning', `Malzeme kategorisi silindi: ${name}`, 'INVENTORY')
                fetchCategories()
            } catch (error) {
                showToast('Silme işlemi başarısız', 'error')
            }
        }
    }

    const filteredCategories = categories.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Malzeme Kategorileri</h2>
                    <p className="text-sm text-slate-500">Envanter sınıflandırması için kategorileri yönetin.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus size={20} /> Yeni Kategori
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Kategori ara..."
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kategori Adı</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Açıklama</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">Yükleniyor...</td>
                            </tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                    <Tag className="mx-auto text-slate-300 mb-2" size={48} />
                                    Kategori bulunamadı
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                <Tag size={16} />
                                            </div>
                                            <span className="font-medium text-slate-700">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {item.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(item.id, item.name)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Yeni Kategori Ekle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Adı</label>
                                <input
                                    type="text"
                                    placeholder="Örn: İnşaat Demirleri"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                                <textarea
                                    placeholder="Kategori hakkında kısa bilgi..."
                                    className="input-field min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">İptal</button>
                                <button type="submit" className="flex-1 btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
