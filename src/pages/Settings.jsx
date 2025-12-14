import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Save, UserPlus, Trash2, ToggleLeft, ToggleRight, Loader2, Info, Building2, Bell, Shield, Lock } from 'lucide-react'
import { settingsService, usersService } from '../services/admin'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
    const { showToast } = useToast()
    const { user } = useAuth()

    // States
    const [registrationEnabled, setRegistrationEnabled] = useState(false)
    const [users, setUsers] = useState([])
    const [securityLogs, setSecurityLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('general')

    // Mock States for UI Variety
    const [notifications, setNotifications] = useState({ email: true, push: false, weeklyReport: true })

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' })

    // Load Data
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchData = async () => {
        try {
            const [settings, usersData, logsData] = await Promise.all([
                settingsService.getAllSettings(),
                usersService.getAllUsers(),
                settingsService.getSecurityLogs() // Fetch logs
            ])

            // Setting parse
            const regSetting = settings.find(s => s.key === 'registration_enabled')
            setRegistrationEnabled(regSetting ? regSetting.value === 'true' : false)

            setUsers(usersData)
            setSecurityLogs(logsData)
        } catch (error) {
            console.error(error)
            showToast('Veriler yüklenirken hata oluştu.', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Toggle Registration
    const handleToggleRegistration = async () => {
        const newValue = !registrationEnabled;
        setRegistrationEnabled(newValue);

        try {
            await settingsService.updateSetting('registration_enabled', String(newValue));
            showToast(`Yeni üye kaydı ${newValue ? 'açıldı' : 'kapatıldı'}.`, 'success');
        } catch (error) {
            setRegistrationEnabled(!newValue); // Revert
            showToast('Ayar güncellenemedi.', 'error');
        }
    }

    // Create User
    const handleCreateUser = async (e) => {
        e.preventDefault()
        setActionLoading(true)

        try {
            await usersService.createUser(newUser)
            showToast('Kullanıcı başarıyla oluşturuldu.', 'success')
            setShowModal(false)
            setNewUser({ name: '', email: '', password: '', role: 'user' })
            fetchData() // Refresh list
        } catch (error) {
            showToast(error.response?.data?.message || 'Kullanıcı oluşturulamadı.', 'error')
        } finally {
            setActionLoading(false)
        }
    }

    // Delete User
    const handleDeleteUser = async (id) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return

        try {
            await usersService.deleteUser(id)
            showToast('Kullanıcı silindi.', 'success')
            setUsers(users.filter(u => u.id !== id))
        } catch (error) {
            showToast(error.response?.data?.message || 'Silme işlemi başarısız.', 'error')
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>

    // ACCESS DENIED VIEW
    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-6 bg-red-50 text-red-500 rounded-full shadow-sm border border-red-100">
                    <Lock size={64} strokeWidth={1.5} />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Erişim Yetkisi Yok</h2>
                    <p className="text-slate-500">
                        Bu sayfadaki sistem ayarlarına ve kullanıcı yönetimine sadece <span className="font-semibold text-slate-700">Yönetici (Admin)</span> yetkisine sahip kullanıcılar erişebilir.
                    </p>
                </div>
                <div className="text-sm text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                    Mevcut Rolünüz: <span className="font-mono font-bold text-slate-600 uppercase">{user?.role === 'admin' ? 'YÖNETİCİ' : 'KULLANICI'}</span>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'general', label: 'Genel & Kullanıcılar', icon: Building2 },
        { id: 'notifications', label: 'Bildirimler', icon: Bell },
        { id: 'security', label: 'Güvenlik', icon: Shield },
    ]

    // Style helpers for clean JSX
    const activeTabClass = "bg-white text-primary-600 border-b-2 border-primary-500 dark:bg-slate-800 dark:text-primary-400";
    const inactiveTabClass = "text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Sistem Ayarları</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Uygulama genel yapılandırması, kullanıcılar ve tercihler.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                            ${activeTab === tab.id ? activeTabClass : inactiveTabClass}
                        `}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT: GENERAL */}
            {activeTab === 'general' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                    {/* Registration Toggle */}
                    <div className="card dark:bg-slate-900 border-none">
                        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Kayıt Ayarları</h2>
                        </div>
                        <div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex gap-4">
                                    <div className={`p-3 rounded-lg ${registrationEnabled ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Yeni Üye Kaydı</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            Login sayfasından dışarıdan yeni üye kaydı alınmasına izin ver.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleRegistration}
                                    className={`transition-colors duration-300 ${registrationEnabled ? 'text-green-600 dark:text-green-400 hover:text-green-700' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    {registrationEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Users Management */}
                    <div className="card dark:bg-slate-900 border-none">
                        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Kullanıcı Yönetimi</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
                            >
                                <UserPlus size={18} />
                                Yeni Kullanıcı Ekle
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Ad Soyad</th>
                                        <th className="px-6 py-4">E-posta</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4">Kayıt Tarihi</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{user.name}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                    }`}>
                                                    {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 dark:text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT: NOTIFICATIONS (MOCK) */}
            {activeTab === 'notifications' && (
                <div className="card dark:bg-slate-900 border-none animate-in slide-in-from-bottom-2 duration-300">
                    <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Bildirim Tercihleri</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">E-posta Bildirimleri</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Önemli güncellemeler için e-posta al.</p>
                            </div>
                            <button onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}>
                                {notifications.email ? <ToggleRight size={40} className="text-primary-600 dark:text-primary-400" /> : <ToggleLeft size={40} className="text-slate-400 dark:text-slate-600" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">Haftalık Raporlar</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Her Pazartesi proje özeti gönder.</p>
                            </div>
                            <button onClick={() => setNotifications(prev => ({ ...prev, weeklyReport: !prev.weeklyReport }))}>
                                {notifications.weeklyReport ? <ToggleRight size={40} className="text-primary-600 dark:text-primary-400" /> : <ToggleLeft size={40} className="text-slate-400 dark:text-slate-600" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT: SECURITY */}
            {activeTab === 'security' && (
                <div className="card dark:bg-slate-900 border-none animate-in slide-in-from-bottom-2 duration-300">
                    <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Güvenlik Logları</h2>
                    </div>
                    <div className="">
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Son giriş hareketleri ve güvenlik olayları.</p>

                        {securityLogs.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                Henüz kayıtlı güvenlik logu bulunmuyor.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {securityLogs.map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-sm border border-transparent dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Shield size={16} className="text-green-600 dark:text-green-500" />
                                            <div>
                                                <span className="text-slate-700 dark:text-slate-300 font-medium block">{log.action}</span>
                                                <span className="text-xs text-slate-500">{log.userName} (IP: {log.ipAddress || 'Bilinmiyor'})</span>
                                            </div>
                                        </div>
                                        <span className="text-slate-400 dark:text-slate-500 text-xs">
                                            {new Date(log.createdAt).toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Create User Modal (Portal) */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">Yeni Kullanıcı Oluştur</h3>
                            <p className="text-slate-500 text-sm mt-1">Yönetim paneline erişimi olan bir kullanıcı ekleyin.</p>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field w-full"
                                    placeholder="Örn: Ahmet Yılmaz"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field w-full"
                                    placeholder="ornek@sirket.com"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field w-full"
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                <select
                                    className="input-field w-full"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">Standart Kullanıcı</option>
                                    <option value="admin">Yönetici (Admin)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Kullanıcı Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
