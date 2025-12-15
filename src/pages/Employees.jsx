import { useState, useEffect } from 'react'
import { UserPlus, Phone, Briefcase, X, Search, Trash2, Edit2, AlertCircle, Loader2, HardHat, PlusCircle, ArrowRight, Building2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Skeleton from '../components/ui/Skeleton'
import Portal from '../components/Portal'

export default function Employees() {
    const [employees, setEmployees] = useState([])
    const [projects, setProjects] = useState([])
    const [roles, setRoles] = useState([])
    
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [showRoleInput, setShowRoleInput] = useState(false)
    const [newRoleName, setNewRoleName] = useState('')
    
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    
    const [formData, setFormData] = useState({ first_name: '', last_name: '', RoleId: '', ProjectId: '', phone: '', daily_rate: '' })
    
    const { showToast } = useToast()

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setIsLoading(true)
        try {
            const [empRes, projRes, roleRes] = await Promise.all([
                api.get('/employees'),
                api.get('/projects'),
                api.get('/roles')
            ])
            setEmployees(empRes.data)
            setProjects(projRes.data)
            setRoles(roleRes.data)
        } catch (error) {
            console.error("Veri yükleme hatası:", error)
            showToast('Veriler yüklenirken hata oluştu.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ first_name: '', last_name: '', RoleId: '', ProjectId: '', phone: '', daily_rate: '' })
        setIsEditing(false)
        setEditId(null)
        setShowRoleInput(false)
    }

    const handleEditClick = (employee) => {
        setFormData({
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            RoleId: employee.RoleId || '',
            ProjectId: employee.ProjectId || '',
            phone: employee.phone || '',
            daily_rate: employee.daily_rate || ''
        })
        setEditId(employee.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleAddRole = async () => {
        if (!newRoleName.trim()) return;
        
        try {
            const res = await api.post('/roles', { name: newRoleName });
            setRoles([...roles, res.data]);
            setFormData({ ...formData, RoleId: res.data.id });
            setNewRoleName('');
            setShowRoleInput(false);
            showToast('Yeni görev tanımı eklendi.', 'success');
        } catch (error) {
            showToast('Bu görev zaten mevcut olabilir.', 'warning');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return;

        const cleanPhone = formData.phone.replace(/\s/g, '')

        const payload = {
            ...formData,
            phone: cleanPhone,
            ProjectId: formData.ProjectId === '' ? null : formData.ProjectId,
            RoleId: formData.RoleId === '' ? null : formData.RoleId,
            daily_rate: formData.daily_rate === '' ? null : parseFloat(formData.daily_rate)
        }

        if (!payload.RoleId) {
            showToast('Lütfen bir görev (rol) seçiniz.', 'warning');
            return;
        }

        setIsSubmitting(true)
        try {
            if (isEditing) {
                await api.put(`/employees/${editId}`, payload)
                showToast('Personel güncellendi.', 'success')
            } else {
                await api.post('/employees', payload)
                showToast('Personel eklendi.', 'success')
            }
            fetchInitialData()
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
        if (window.confirm('Bu çalışanı silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/employees/${id}`)
                setEmployees(employees.filter(emp => emp.id !== id))
                showToast('Personel silindi.', 'info')
            } catch (err) {
                showToast('Silme işlemi başarısız.', 'error')
            }
        }
    }

    return (
        <>
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Çalışan Ekibi</h1>
                    <p className="text-slate-500 mt-1">Personel listesi, görevler ve projeler</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true) }} 
                    className="btn-primary shadow-xl shadow-primary-500/20"
                >
                    <UserPlus size={20} /> Yeni Çalışan Ekle
                </button>
            </div>

            <div className="card border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden p-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="İsim, rol veya proje ara..." 
                            className="input-field pl-10 bg-white" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">İsim</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Görevi (Rol)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proje</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefon</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Günlük Ücret</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></td>
                                    </tr>
                                ))
                            ) : employees.filter(emp => {
                                const search = searchTerm.toLowerCase()
                                const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
                                return fullName.includes(search) ||
                                       emp.Role?.name.toLowerCase().includes(search) ||
                                       emp.Project?.name.toLowerCase().includes(search)
                            }).length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle size={32} className="text-slate-300" />
                                            <p>Henüz kayıtlı çalışan yok.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.filter(emp => {
                                    const search = searchTerm.toLowerCase()
                                    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
                                    return fullName.includes(search) ||
                                           emp.Role?.name.toLowerCase().includes(search) ||
                                           emp.Project?.name.toLowerCase().includes(search)
                                }).map((emp) => (
                                    <tr 
                                        key={emp.id} 
                                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                        onClick={(e) => {
                                            if (e.target.closest('button')) return
                                            setSelectedEmployee(emp)
                                            setShowDetailModal(true)
                                        }}
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner group-hover:from-primary-100 group-hover:to-primary-200 group-hover:text-primary-700 transition-all">
                                                {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-xs text-slate-400">ID: #{emp.id}</div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1 rounded-full text-xs font-medium text-slate-700 border border-slate-200">
                                                <Briefcase size={12} className="text-slate-400" /> 
                                                {emp.Role ? emp.Role.name : 'Tanımsız'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {emp.Project ? (
                                                <span className="flex items-center gap-2 text-primary-700 font-medium bg-primary-50 px-3 py-1 rounded-lg text-xs border border-primary-100">
                                                    <HardHat size={12} /> {emp.Project.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Atanmadı</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-2 font-mono text-sm text-slate-500">
                                                <Phone size={14} className="text-slate-400" /> 
                                                {emp.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                                            {emp.daily_rate ? `₺${Number(emp.daily_rate).toLocaleString('tr-TR')}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(emp)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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
                <Portal>
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-black/5">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Düzenle' : 'Yeni Kayıt'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
                                        <input type="text" placeholder="Örn: Mehmet" className="input-field"
                                            value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Soyad</label>
                                        <input type="text" placeholder="Örn: Demir" className="input-field"
                                            value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Görevi</label>
                                    {!showRoleInput ? (
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <select 
                                                    className="input-field appearance-none"
                                                    value={formData.RoleId}
                                                    onChange={e => setFormData({ ...formData, RoleId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Görev Seçiniz</option>
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowRoleInput(true)}
                                                className="px-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 border border-primary-200"
                                                title="Yeni Görev Tanımı Ekle"
                                            >
                                                <PlusCircle size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 animate-fade-in">
                                            <input 
                                                type="text" 
                                                placeholder="Yeni Görev Adı (Örn: Formen)" 
                                                className="input-field flex-1"
                                                value={newRoleName}
                                                onChange={e => setNewRoleName(e.target.value)}
                                                autoFocus
                                            />
                                            <button type="button" onClick={handleAddRole} className="btn-primary py-2 px-4 text-sm">Ekle</button>
                                            <button type="button" onClick={() => setShowRoleInput(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proje</label>
                                    <div className="relative">
                                        <select 
                                            className="input-field appearance-none"
                                            value={formData.ProjectId}
                                            onChange={e => setFormData({ ...formData, ProjectId: e.target.value })}
                                        >
                                            <option value="">Proje Seçiniz (İsteğe Bağlı)</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>{project.name}</option>
                                            ))}
                                        </select>
                                        <HardHat className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                        <input 
                                            type="tel" 
                                            placeholder="05XX XXX XX XX" 
                                            className="input-field" 
                                            value={formData.phone} 
                                            onChange={e => {
                                                const input = e.target.value.replace(/\D/g, '')
                                                
                                                let formatted = ''
                                                if (input.length > 0) formatted = input.substring(0, 4)
                                                if (input.length >= 5) formatted += ' ' + input.substring(4, 7)
                                                if (input.length >= 8) formatted += ' ' + input.substring(7, 9)
                                                if (input.length >= 10) formatted += ' ' + input.substring(9, 11)
                                                
                                                setFormData({ ...formData, phone: formatted })
                                            }} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Günlük (₺)</label>
                                        <input type="number" placeholder="0.00" className="input-field"
                                            value={formData.daily_rate} onChange={e => setFormData({ ...formData, daily_rate: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">İptal</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                    {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Kaydediliyor...</> : <>{isEditing ? 'Güncelle' : 'Kaydet ve Ekle'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </Portal>
            )}

            {showDetailModal && selectedEmployee && (
                <Portal>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                                        {selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-1">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full font-semibold">
                                                <Briefcase size={14} />
                                                {selectedEmployee.Role?.name || 'Tanımsız'}
                                            </span>
                                            {selectedEmployee.Project && (
                                                <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full font-semibold">
                                                    <Building2 size={14} />
                                                    {selectedEmployee.Project.name}
                                                </span>
                                            )}
                                        </div>
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

                        <div className="p-6 overflow-y-auto max-h-[calc(85vh-220px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase flex items-center gap-2">
                                        <Phone size={12} />
                                        Telefon
                                    </p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {selectedEmployee.phone || 'Belirtilmemiş'}
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Günlük Ücret</p>
                                    <p className="text-lg font-bold text-primary-600">
                                        {selectedEmployee.daily_rate ? `${parseFloat(selectedEmployee.daily_rate).toLocaleString('tr-TR')} ₺` : 'Belirtilmemiş'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                    <p className="text-xs text-emerald-600 mb-2 font-semibold uppercase">Pozisyon</p>
                                    <p className="text-xl font-bold text-emerald-700">
                                        {selectedEmployee.Role?.name || 'Tanımsız'}
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <p className="text-xs text-blue-600 mb-2 font-semibold uppercase">Atandığı Proje</p>
                                    {selectedEmployee.Project ? (
                                        <>
                                            <p className="text-lg font-bold text-blue-700">
                                                {selectedEmployee.Project.name}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                {selectedEmployee.Project.city}, {selectedEmployee.Project.district}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-lg font-bold text-blue-700">Atanmamış</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200">
                                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Çalışan ID</p>
                                <p className="text-sm font-mono text-slate-700">#{selectedEmployee.id}</p>
                            </div>
                        </div>

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
                                    handleEditClick(selectedEmployee)
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
