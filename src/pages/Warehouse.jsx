import { useState, useEffect } from 'react'
import { Package, Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react'
import { materialService } from '../services/modules'
import { useToast } from '../context/ToastContext'

export default function Warehouse() {
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        unit: '',
        stock_quantity: '',
        minimum_stock: '',
        unit_price: ''
    })

    useEffect(() => {
        fetchMaterials()
    }, [])

    const fetchMaterials = async () => {
        try {
            const data = await materialService.getAll()
            setMaterials(data)
        } catch (error) {
            showToast('Malzemeler yüklenemedi', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await materialService.create(formData)
            showToast('Malzeme eklendi', 'success')
            setShowModal(false)
            setFormData({ name: '', category: '', unit: '', stock_quantity: '', minimum_stock: '', unit_price: '' })
            fetchMaterials()
        } catch (error) {
            showToast('Hata oluştu', 'error')
        }
    }

    const filteredMaterials = materials.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Depo & Stok Yönetimi</h2>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus size={20} /> Yeni Malzeme
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Malzeme ara..."
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Malzeme</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kategori</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Birim</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Stok</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Birim Fiyat</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tedarikçi</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">Yükleniyor...</td>
                                </tr>
                            ) : filteredMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                                        <Package className="mx-auto text-slate-300 mb-2" size={48} />
                                        Kayıtlı malzeme bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredMaterials.map(material => (
                                    <tr key={material.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <Package className="text-primary-600" size={20} />
                                                </div>
                                                <p className="font-semibold text-slate-800">{material.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                {material.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{material.unit}</td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={`font-semibold ${material.stock_quantity < material.minimum_stock ? 'text-red-600' : 'text-slate-800'}`}>
                                                {material.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="font-semibold text-slate-800">{material.unit_price} ₺</span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{material.supplier || '-'}</td>
                                        <td className="px-4 py-4 text-center">
                                            {material.stock_quantity < material.minimum_stock ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                    <AlertCircle size={14} />
                                                    Düşük Stok
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Yeni Malzeme Ekle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Malzeme Adı"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Kategori"
                                className="input-field"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Birim (kg, adet, m³)"
                                    className="input-field"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                />
                                <input
                                    type="number"
                                    placeholder="Stok Miktarı"
                                    className="input-field"
                                    value={formData.stock_quantity}
                                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Min. Stok"
                                    className="input-field"
                                    value={formData.minimum_stock}
                                    onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
                                />
                                <input
                                    type="number"
                                    placeholder="Birim Fiyat"
                                    className="input-field"
                                    value={formData.unit_price}
                                    onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3">
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
