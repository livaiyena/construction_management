import { useState, useEffect } from 'react'
import { Save, Bell, Database, Layout, Terminal } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { useToast } from '../context/ToastContext'

export default function Settings() {
    const { settings, updateSettings, clearNotifications, addNotification } = useNotification()
    const { showToast } = useToast()

    // Local state for form
    const [formData, setFormData] = useState({
        maxLogs: 500,
        maxPopupHeight: 400
    })

    useEffect(() => {
        if (settings) {
            setFormData(settings)
        }
    }, [settings])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        updateSettings(formData)
        showToast('Ayarlar kaydedildi.', 'success')
    }

    const handleClearLogs = () => {
        if (window.confirm('Tüm sistem loglarını silmek istediğinize emin misiniz?')) {
            clearNotifications()
            showToast('Tüm loglar temizlendi.', 'success')
        }
    }

    const handleGenerateLogs = () => {
        const categories = ['AUTH', 'PROJECT', 'EMPLOYEE', 'EXPENSE', 'REPORT', 'SYSTEM', 'ATTENDANCE', 'INVENTORY']
        const types = ['info', 'success', 'warning', 'error']
        const messages = [
            'Test veritabanı bağlantısı',
            'Kullanıcı ayarları değiştirildi',
            'Sistem güncellemesi kontrol edildi',
            'Geçersiz parametre hatası',
            'Otomatik yedekleme başlatıldı',
            'Malzeme stoğu güncellendi',
            'Personel giriş işlemi',
            'Bütçe limit uyarısı'
        ]

        // Clean implementation without setTimeout complexity for simplicity, relying on functional state update:
        Array.from({ length: 5 }).forEach(() => {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)]
            const randomType = types[Math.floor(Math.random() * types.length)]
            const randomMessage = messages[Math.floor(Math.random() * messages.length)]
            addNotification(randomType, `TEST: ${randomMessage}`, randomCategory)
        })

        showToast('5 adet test logu oluşturuldu.', 'success')
    }

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Site Ayarları</h1>
                    <p className="text-slate-500">Sistem yapılandırması ve kişisel tercihler.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">

                {/* Log Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Database size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Veri ve Log Yönetimi</h2>
                            <p className="text-sm text-slate-500">Sistem kayıtlarının saklanma kuralları.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Maksimum Log Sayısı</label>
                            <input
                                type="number"
                                name="maxLogs"
                                value={formData.maxLogs}
                                onChange={handleChange}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                min="10"
                                max="10000"
                            />
                            <p className="text-xs text-slate-400">En eski loglar bu sayı aşıldığında otomatik silinir.</p>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleClearLogs}
                                className="w-full p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors mb-[2px]"
                            >
                                Tüm Logları Temizle
                            </button>
                        </div>
                    </div>
                </div>

                {/* UI Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Arayüz Ayarları</h2>
                            <p className="text-sm text-slate-500">Görünüm ve panel tercihleri.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Bildirim Popup Yüksekliği (px)</label>
                            <input
                                type="number"
                                name="maxPopupHeight"
                                value={formData.maxPopupHeight}
                                onChange={handleChange}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                min="200"
                                max="800"
                            />
                            <p className="text-xs text-slate-400">Üst menüdeki bildirim panelinin maksimum yüksekliği.</p>
                        </div>
                    </div>
                </div>

                {/* Developer Tools */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                            <Terminal size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Geliştirici Araçları</h2>
                            <p className="text-sm text-slate-500">Test ve hata ayıklama işlemleri.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="font-medium text-slate-700">Test Logları Oluştur</p>
                            <p className="text-xs text-slate-500 mt-1">Sisteme rastgele 5 adet log kaydı ekler.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateLogs}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 rounded-lg text-sm font-medium transition-all shadow-sm"
                        >
                            Log Üret
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-lg shadow-primary-500/30 transition-all active:scale-95"
                    >
                        <Save size={20} />
                        Ayarları Kaydet
                    </button>
                </div>
            </form>
        </div>
    )
}
