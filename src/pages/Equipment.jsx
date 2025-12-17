import { useState, useEffect } from 'react'
import { Truck, Plus, Search, Edit, Trash2, X, Calendar, DollarSign, MapPin } from 'lucide-react'
import { equipmentService, equipmentTypeService } from '../services/modules'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'
import Portal from '../components/Portal'

export default function Equipment() {
    const [equipment, setEquipment] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedEquipment, setSelectedEquipment] = useState(null)
    const [equipmentProjects, setEquipmentProjects] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [typeSearch, setTypeSearch] = useState('')
    const [showTypeDropdown, setShowTypeDropdown] = useState(false)
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

    // Dropdown'ların dışına tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.equipment-type-dropdown-container')) {
                setShowTypeDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
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
            setTypeSearch('')
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
        // Seçili tipin adını bul ve search input'a koy
        const selectedType = types.find(t => t.id === eq.EquipmentTypeId)
        if (selectedType) {
            setTypeSearch(selectedType.name)
        }
        setEditingId(eq.id)
        setShowDetailModal(false) // Detay modalı kapat
        setShowModal(true)
    }

    const handleCancelEdit = () => {
        setShowModal(false)
        setEditingId(null)
        setTypeSearch('')
        setFormData({ name: '', EquipmentTypeId: '', serial_number: '', purchase_price: '', daily_rental_cost: '', condition: 'İyi', location: '', isAvailable: true })
        // Eğer detay modal'dan gelindiyse, geri dön
        if (selectedEquipment) {
            setShowDetailModal(true)
        }
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

    const handleShowDetail = async (eq) => {
        setSelectedEquipment(eq)
        setShowDetailModal(true)
        // Ekipmanın kullanıldığı projeleri getir
        try {
            const response = await api.get(`/project-equipment?equipmentId=${eq.id}`)
            setEquipmentProjects(response.data)
        } catch (error) {
            console.error('Proje bilgileri yüklenemedi:', error)
        }
    }

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
                                        <tr 
                                            key={eq.id} 
                                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                            onClick={(e) => {
                                                // Eğer buton tıklanmışsa modal açma
                                                if (e.target.closest('button')) return
                                                handleShowDetail(eq)
                                            }}
                                        >
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
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowModal(false)}>
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
                                    <div className="equipment-type-dropdown-container relative">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tip</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Tip ara..."
                                                value={typeSearch}
                                                onChange={(e) => setTypeSearch(e.target.value)}
                                                onFocus={() => setShowTypeDropdown(true)}
                                                className="input-field pr-8"
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                        {showTypeDropdown && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {types
                                                    .filter(t => t.name.toLowerCase().includes(typeSearch.toLowerCase()))
                                                    .map(t => (
                                                        <div
                                                            key={t.id}
                                                            onClick={() => {
                                                                setFormData({ ...formData, EquipmentTypeId: t.id })
                                                                setTypeSearch(t.name)
                                                                setShowTypeDropdown(false)
                                                            }}
                                                            className={`px-3 py-2 hover:bg-primary-50 cursor-pointer text-sm ${
                                                                formData.EquipmentTypeId === t.id ? 'bg-primary-100 text-primary-700 font-medium' : 'text-slate-700'
                                                            }`}
                                                        >
                                                            {t.name}
                                                        </div>
                                                    ))}
                                                {types.filter(t => t.name.toLowerCase().includes(typeSearch.toLowerCase())).length === 0 && (
                                                    <div className="px-3 py-2 text-sm text-slate-500">Sonuç bulunamadı</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Seri No</label>
                                        <input
                                            type="text"
                                            placeholder="Seri No"
                                            className="input-field"
                                            value={formData.serial_number}
                                            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                        />
                                    </div>
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
                                <button type="button" onClick={handleCancelEdit} className="flex-1 btn-secondary">İptal</button>
                                <button type="submit" className="flex-1 btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
                </Portal>
            )}

            {/* DETAY MODAL */}
            {showDetailModal && selectedEquipment && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowDetailModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-2">{selectedEquipment.name}</h2>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                                {types.find(t => t.id == selectedEquipment.EquipmentTypeId)?.name || '-'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedEquipment.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {selectedEquipment.isAvailable ? 'Müsait' : 'Kullanımda'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-4"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                                {/* Genel Bilgiler */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Seri Numarası</p>
                                        <p className="text-lg font-mono font-bold text-slate-800">{selectedEquipment.serial_number || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Durum</p>
                                        <p className="text-lg font-bold text-slate-800">{selectedEquipment.condition}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase flex items-center gap-1">
                                            <DollarSign size={14} />
                                            Günlük Kira
                                        </p>
                                        <p className="text-lg font-bold text-primary-600">{selectedEquipment.daily_rental_cost} ₺</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase flex items-center gap-1">
                                            <MapPin size={14} />
                                            Konum
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">{selectedEquipment.location || '-'}</p>
                                    </div>
                                </div>

                                {/* Kullanıldığı Projeler */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Kullanıldığı Projeler</h3>
                                    {equipmentProjects.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-slate-500">Bu ekipman henüz hiçbir projede kullanılmamış</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {equipmentProjects.map(proj => {
                                                const isActive = !proj.end_date || new Date(proj.end_date) > new Date()
                                                return (
                                                    <div key={proj.id} className="bg-white border border-slate-200 rounded-xl p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                                    {proj.project_name}
                                                                    {isActive && (
                                                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                                                            Aktif
                                                                        </span>
                                                                    )}
                                                                </h4>
                                                                <div className="flex gap-4 mt-2 text-sm text-slate-600">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar size={14} />
                                                                        {new Date(proj.start_date).toLocaleDateString('tr-TR')}
                                                                        {proj.end_date && ` - ${new Date(proj.end_date).toLocaleDateString('tr-TR')}`}
                                                                    </span>
                                                                    <span className="font-semibold text-primary-600">{proj.daily_cost} ₺/gün</span>
                                                                    {proj.total_days > 0 && <span>{proj.total_days} gün</span>}
                                                                </div>
                                                                {proj.notes && <p className="text-sm text-slate-500 mt-2 italic">{proj.notes}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
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
                                        handleEdit(selectedEquipment)
                                    }}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                >
                                    Düzenle
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    )
}
