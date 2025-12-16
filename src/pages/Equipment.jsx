import { useState, useEffect } from 'react'
import { Truck, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { equipmentService, equipmentTypeService } from '../services/modules'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'

export default function Equipment() {
    const [equipment, setEquipment] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const { showToast } = useToast()
    const { addNotification } = useNotification()
    const [formData, setFormData] = useState({
        name: '',
        type_id: '',
        serial_number: '',
        purchase_price: '',
        daily_rental_cost: '',
        condition: 'İyi',
        location: '',
        isAvailable: true
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const [equipmentData, typesData] = await Promise.all([
                    equipmentService.getAll(),
                    equipmentTypeService.getAll()
                ])
                setEquipment(equipmentData)
                setTypes(typesData)
            } catch (error) {
                showToast('Veriler yüklenemedi', 'error')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const fetchEquipment = async () => {
        try {
            const data = await equipmentService.getAll()
            setEquipment(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                await equipmentService.update(editingId, formData)
                showToast('Ekipman güncellendi', 'success')
                addNotification('info', `Ekipman güncellendi: ${formData.name}`, 'INVENTORY')
            } else {
                await equipmentService.create(formData)
                showToast('Ekipman eklendi', 'success')
                addNotification('success', `Yeni ekipman eklendi: ${formData.name}`, 'INVENTORY')
            }
            setShowModal(false)
            setFormData({ name: '', EquipmentTypeId: '', serial_number: '', purchase_price: '', daily_rental_cost: '', condition: 'İyi', location: '', isAvailable: true })
            setEditingId(null)
            fetchEquipment()
        } catch (error) {
            showToast('Hata oluştu', 'error')
        }
    }

    const handleEdit = (eq) => {
        setFormData({
            name: eq.name,
            EquipmentTypeId: eq.EquipmentTypeId,
            serial_number: eq.serial_number,
            purchase_price: eq.purchase_price,
            daily_rental_cost: eq.daily_rental_cost,
            condition: eq.condition,
            location: eq.location,
            isAvailable: eq.isAvailable
        })
        setEditingId(eq.id)
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Bu ekipmanı silmek istediğinize emin misiniz?')) {
            try {
                await equipmentService.delete(id)
                showToast('Ekipman silindi', 'success')
                addNotification('warning', 'Ekipman silindi', 'INVENTORY')
                fetchEquipment()
            } catch (error) {
                showToast('Silme işlemi başarısız', 'error')
            }
        }
    }

    const filteredEquipment = equipment.filter(e => {
        const typeName = types.find(t => t.id == e.EquipmentTypeId)?.name || e.type || ''
        return (
            e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            typeName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Ekipman Yönetimi</h2>
                <button onClick={() => {
                    setEditingId(null)
                    setFormData({ name: '', EquipmentTypeId: '', serial_number: '', purchase_price: '', daily_rental_cost: '', condition: 'İyi', location: '', isAvailable: true })
                    setShowModal(true)
                }} className="btn-primary">
                    <Plus size={20} /> Yeni Ekipman
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Ekipman ara..."
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ekipman</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tip</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Seri No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Günlük Kira</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Konum</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Müsaitlik</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">Yükleniyor...</td>
                                </tr>
                            ) : filteredEquipment.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                                        <Truck className="mx-auto text-slate-300 mb-2" size={48} />
                                        Kayıtlı ekipman bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredEquipment.map(eq => {
                                    const typeName = types.find(t => t.id == eq.EquipmentTypeId)?.name || eq.type || '-'
                                    return (
                                        <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Truck className="text-blue-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{eq.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">{typeName}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600 font-mono">{eq.serial_number || '-'}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                    {eq.condition}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-semibold text-slate-800">{eq.daily_rental_cost} ₺</span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">{eq.location || '-'}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${eq.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {eq.isAvailable ? 'Müsait' : 'Kullanımda'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(eq)}
                                                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(eq.id)}
                                                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">{editingId ? 'Ekipman Düzenle' : 'Yeni Ekipman Ekle'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Ekipman Adı"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="input-field"
                                    value={formData.EquipmentTypeId}
                                    onChange={(e) => setFormData({ ...formData, EquipmentTypeId: e.target.value })}
                                >
                                    <option value="">Tip Seçin</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Seri No"
                                    className="input-field"
                                    value={formData.serial_number}
                                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Satın Alma Fiyatı"
                                    className="input-field"
                                    value={formData.purchase_price}
                                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Günlük Kira"
                                    className="input-field"
                                    value={formData.daily_rental_cost}
                                    onChange={(e) => setFormData({ ...formData, daily_rental_cost: e.target.value })}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Konum"
                                className="input-field"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                            <select
                                className="input-field"
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            >
                                <option value="Mükemmel">Mükemmel</option>
                                <option value="İyi">İyi</option>
                                <option value="Orta">Orta</option>
                                <option value="Bakım Gerekli">Bakım Gerekli</option>
                            </select>
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
