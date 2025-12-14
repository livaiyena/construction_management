import { useState, useEffect } from 'react'
import { Package, ArrowUpRight, ArrowDownLeft, History, Plus, AlertTriangle } from 'lucide-react'
import { materialService } from '../services/modules'
import { useToast } from '../context/ToastContext'

export default function Warehouse() {
    const { showToast } = useToast()
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMaterial, setSelectedMaterial] = useState(null)
    const [showTransModal, setShowTransModal] = useState(false)
    const [transaction, setTransaction] = useState({
        type: 'GİRİŞ',
        quantity: '',
        description: ''
    })
    const [history, setHistory] = useState([])

    // New Material Modal
    const [showNewModal, setShowNewModal] = useState(false)
    const [newMaterial, setNewMaterial] = useState({ name: '', unit: 'Adet', category: 'Genel', minimum_stock: 10, unit_price: 0 })

    useEffect(() => { loadMaterials() }, [])

    const loadMaterials = async () => {
        try {
            const data = await materialService.getAll()
            setMaterials(data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const openTransaction = async (material) => {
        setSelectedMaterial(material)
        try {
            const data = await materialService.getTransactions(material.id)
            setHistory(data)
        } catch (e) { console.error(e) }
        setShowTransModal(true)
    }

    const handleTransaction = async (e) => {
        e.preventDefault()
        try {
            await materialService.addTransaction(selectedMaterial.id, transaction)
            showToast('İşlem başarılı', 'success')
            setShowTransModal(false)
            setTransaction({ type: 'GİRİŞ', quantity: '', description: '' })
            loadMaterials()
        } catch (error) { showToast(error.response?.data?.message || 'Hata', 'error') }
    }

    const handleCreateMaterial = async (e) => {
        e.preventDefault()
        try {
            await materialService.create(newMaterial)
            showToast('Malzeme oluşturuldu', 'success')
            setShowNewModal(false)
            loadMaterials()
        } catch (err) { showToast('Hata', 'error') }
    }

    if (loading) return <div className="p-8">Yükleniyor...</div>

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Depo ve Stok Takibi</h1>
                    <p className="text-slate-500">Malzeme stok durumları ve hareketleri.</p>
                </div>
                <button onClick={() => setShowNewModal(true)} className="btn-primary py-2 px-4 flex items-center gap-2">
                    <Plus size={18} /> Yeni Malzeme
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map(mat => (
                    <div key={mat.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => openTransaction(mat)}>
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
                            {mat.stock_quantity <= mat.minimum_stock && (
                                <div className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                    <AlertTriangle size={12} /> KRİTİK STOK
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <h3 className="font-bold text-lg text-slate-800">{mat.name}</h3>
                            <p className="text-slate-500 text-sm">{mat.category}</p>
                        </div>
                        <div className="mt-4 flex items-end gap-2">
                            <span className="text-3xl font-bold text-slate-900">{mat.stock_quantity}</span>
                            <span className="text-sm font-medium text-slate-500 mb-1">{mat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transaction Modal */}
            {showTransModal && selectedMaterial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-xl">{selectedMaterial.name} - Stok İşlemleri</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Form */}
                            <form onSubmit={handleTransaction} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                <h4 className="font-semibold text-sm uppercase text-slate-500">Hızlı İşlem</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex rounded-lg bg-white border border-slate-200 p-1">
                                        <button type="button" onClick={() => setTransaction({ ...transaction, type: 'GİRİŞ' })} className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${transaction.type === 'GİRİŞ' ? 'bg-green-100 text-green-700' : 'text-slate-500'}`}>GİRİŞ</button>
                                        <button type="button" onClick={() => setTransaction({ ...transaction, type: 'ÇIKIŞ' })} className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${transaction.type === 'ÇIKIŞ' ? 'bg-red-100 text-red-700' : 'text-slate-500'}`}>ÇIKIŞ</button>
                                    </div>
                                    <div className="relative">
                                        <input required type="number" step="0.01" className="input-field w-full pl-3 pr-12" placeholder="0.00" value={transaction.quantity} onChange={e => setTransaction({ ...transaction, quantity: e.target.value })} />
                                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">{selectedMaterial.unit}</span>
                                    </div>
                                </div>
                                <input type="text" className="input-field w-full" placeholder="Açıklama (Opsiyonel)" value={transaction.description} onChange={e => setTransaction({ ...transaction, description: e.target.value })} />
                                <button type="submit" className="btn-primary w-full py-2">Kaydet</button>
                            </form>

                            {/* History */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><History size={16} /> Hareket Geçmişi</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {history.map(h => (
                                        <div key={h.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg text-sm">
                                            <div className="flex items-center gap-3">
                                                {h.type === 'GİRİŞ' ? <ArrowDownLeft size={16} className="text-green-500" /> : <ArrowUpRight size={16} className="text-red-500" />}
                                                <div>
                                                    <p className="font-medium text-slate-900">{h.type} <span className="text-slate-400 text-xs font-normal">({new Date(h.date).toLocaleDateString()})</span></p>
                                                    <p className="text-xs text-slate-500">{h.description || '-'}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold ${h.type === 'GİRİŞ' ? 'text-green-600' : 'text-red-600'}`}>
                                                {h.type === 'GİRİŞ' ? '+' : '-'}{h.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button onClick={() => setShowTransModal(false)} className="w-full bg-white border border-slate-300 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Material Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="font-bold text-xl mb-4">Yeni Malzeme Kartı</h3>
                        <form onSubmit={handleCreateMaterial} className="space-y-4">
                            <div><label className="label">Malzeme Adı</label><input required className="input-field w-full" value={newMaterial.name} onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Kategori</label><input required className="input-field w-full" value={newMaterial.category} onChange={e => setNewMaterial({ ...newMaterial, category: e.target.value })} /></div>
                                <div><label className="label">Birim</label><input required className="input-field w-full" value={newMaterial.unit} onChange={e => setNewMaterial({ ...newMaterial, unit: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Birim Fiyat</label><input type="number" className="input-field w-full" value={newMaterial.unit_price} onChange={e => setNewMaterial({ ...newMaterial, unit_price: e.target.value })} /></div>
                                <div><label className="label">Min. Stok</label><input type="number" className="input-field w-full" value={newMaterial.minimum_stock} onChange={e => setNewMaterial({ ...newMaterial, minimum_stock: e.target.value })} /></div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 bg-slate-100 py-3 rounded-xl">İptal</button>
                                <button type="submit" className="flex-1 btn-primary py-3">Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
