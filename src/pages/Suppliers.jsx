import { useState, useEffect } from 'react'
import { Building, Plus, Search, Star } from 'lucide-react'
import { supplierService } from '../services/modules'
import { useToast } from '../context/ToastContext'

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        tax_number: '',
        payment_terms: '',
        rating: 3,
        isActive: true
    })

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            const data = await supplierService.getAll()
            setSuppliers(data)
        } catch (error) {
            showToast('Tedarikçiler yüklenemedi', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await supplierService.create(formData)
            showToast('Tedarikçi eklendi', 'success')
            setShowModal(false)
            setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', tax_number: '', payment_terms: '', rating: 3, isActive: true })
            fetchSuppliers()
        } catch (error) {
            showToast('Hata oluştu', 'error')
        }
    }

    const filteredSuppliers = suppliers.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Tedarikçi Yönetimi</h2>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus size={20} /> Yeni Tedarikçi
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Tedarikçi ara..."
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tedarikçi</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İrtibat Kişisi</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İletişim</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ödeme Şartları</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Değerlendirme</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center text-slate-500">Yükleniyor...</td>
                                </tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center text-slate-500">
                                        <Building className="mx-auto text-slate-300 mb-2" size={48} />
                                        Kayıtlı tedarikçi bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map(supplier => (
                                    <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                    <Building className="text-amber-600" size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{supplier.name}</p>
                                                    {supplier.tax_number && (
                                                        <p className="text-xs text-slate-500">VN: {supplier.tax_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{supplier.contact_person || '-'}</td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm">
                                                <p className="text-slate-700">{supplier.phone}</p>
                                                {supplier.email && (
                                                    <p className="text-xs text-slate-500">{supplier.email}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{supplier.payment_terms || '-'}</td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < supplier.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                                                    />
                                                ))}
                                            </div>
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
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Yeni Tedarikçi Ekle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Firma Adı"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="İrtibat Kişisi"
                                    className="input-field"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefon"
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="E-posta"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                            <textarea
                                placeholder="Adres"
                                className="input-field resize-none"
                                rows="2"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Vergi No"
                                    className="input-field"
                                    value={formData.tax_number}
                                    onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Ödeme Şartları"
                                    className="input-field"
                                    value={formData.payment_terms}
                                    onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Değerlendirme</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({...formData, rating})}
                                            className="p-2"
                                        >
                                            <Star
                                                size={24}
                                                className={rating <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                                            />
                                        </button>
                                    ))}
                                </div>
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
