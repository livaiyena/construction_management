import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Tag, Truck } from 'lucide-react'
import { equipmentTypeService } from '../services/modules'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'

export default function EquipmentTypes() {
    const [types, setTypes] = useState([])
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
        fetchTypes()
    }, [])

    const fetchTypes = async () => {
        try {
            const data = await equipmentTypeService.getAll()
            setTypes(data)
        } catch (error) {
            console.error(error)
            setTypes([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await equipmentTypeService.create(formData)
            showToast('Ekipman türü başarıyla eklendi', 'success')
            addNotification('success', `Yeni ekipman türü eklendi: ${formData.name}`, 'INVENTORY')
            setShowModal(false)
            setFormData({ name: '', description: '' })
            fetchTypes()
        } catch (error) {
            showToast('Ekleme işlemi başarısız', 'error')
        }
    }

    const handleDelete = async (id, name) => {
        if (window.confirm('Bu ekipman türünü silmek istediğinize emin misiniz?')) {
            try {
                await equipmentTypeService.delete(id)
                showToast('Ekipman türü silindi', 'success')
                addNotification('warning', `Ekipman türü silindi: ${name}`, 'INVENTORY')
                fetchTypes()
            } catch (error) {
                showToast('Silme işlemi başarısız', 'error')
            }
        }
    }

    const filteredTypes = types.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Ekipman Türleri</h2>
                    <p className="text-sm text-slate-500">Ekipman sınıflandırması için türleri yönetin.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus size={20} /> Yeni Tür
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Tür ara..."
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tür Adı</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Açıklama</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">Yükleniyor...</td>
                            </tr>
                        ) : filteredTypes.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                    <Tag className="mx-auto text-slate-300 mb-2" size={48} />
                                    Tür bulunamadı
                                </td>
                            </tr>
                        ) : (
                            filteredTypes.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                                <Truck size={16} />
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
                        <h3 className="text-xl font-bold mb-4">Yeni Ekipman Türü Ekle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tür Adı</label>
                                <input
                                    type="text"
                                    placeholder="Örn: İş Makineleri"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                                <textarea
                                    placeholder="Bu tür hakkında kısa bilgi..."
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
