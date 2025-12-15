import { useState, useEffect } from 'react'
import { Briefcase, Plus, Search } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Roles() {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        default_daily_rate: ''
    })

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles')
            setRoles(response.data)
        } catch (error) {
            showToast('Roller yüklenemedi', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/roles', formData)
            showToast('Rol eklendi', 'success')
            setShowModal(false)
            setFormData({ name: '', description: '', default_daily_rate: '' })
            fetchRoles()
        } catch (error) {
            showToast('Hata oluştu', 'error')
        }
    }

    const filteredRoles = roles.filter(role =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Rol Yönetimi</h2>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus size={20} /> Yeni Rol
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Rol ara..."
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rol</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Açıklama</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Varsayılan Günlük Ücret</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-4 py-12 text-center text-slate-500">Yükleniyor...</td>
                                </tr>
                            ) : filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-4 py-12 text-center text-slate-500">
                                        <Briefcase className="mx-auto text-slate-300 mb-2" size={48} />
                                        Kayıtlı rol bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredRoles.map(role => (
                                    <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <Briefcase className="text-indigo-600" size={20} />
                                                </div>
                                                <p className="font-semibold text-slate-800">{role.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{role.description || 'Açıklama yok'}</td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="font-semibold text-slate-800">{role.default_daily_rate || 0} ₺</span>
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
                        <h3 className="text-xl font-bold mb-4">Yeni Rol Ekle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Rol Adı (örn: Usta, Kalifiye İşçi)"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            <textarea
                                placeholder="Açıklama"
                                className="input-field resize-none"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                            <input
                                type="number"
                                placeholder="Varsayılan Günlük Ücret (₺)"
                                className="input-field"
                                value={formData.default_daily_rate}
                                onChange={(e) => setFormData({...formData, default_daily_rate: e.target.value})}
                            />
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
