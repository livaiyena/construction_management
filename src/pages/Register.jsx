import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HardHat, User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const { showToast } = useToast()
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await api.post('/auth/register', formData)
            showToast('Kayıt başarılı! Giriş yapabilirsiniz.', 'success')
            // Başarılı olunca direkt Login'e at
            setTimeout(() => navigate('/login'), 1000)
        } catch (error) {
            const msg = error.response?.data?.message || 'Kayıt işlemi başarısız.'
            showToast(msg, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            <div className="hidden lg:flex flex-col justify-between bg-dark-950 p-12 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-dark-950 z-0" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                        <HardHat className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">İnşaat<span className="text-primary-400">Yön</span></h1>
                </div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-4">Aramıza Katılın</h2>
                    <p className="text-slate-400">Ekibinizi ve projelerinizi yönetmek için ilk adımı atın.</p>
                </div>
                <div className="relative z-10 text-sm text-slate-500">© 2024 İnşaatYön</div>
            </div>

            <div className="flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Hesap Oluştur</h2>
                        <p className="text-slate-500 mt-2">Hızlıca kayıt olun</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">Ad Soyad</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="text" placeholder="Adınız Soyadınız" className="input-field pl-12"
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">E-posta</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="email" placeholder="ornek@sirket.com" className="input-field pl-12"
                                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="password" placeholder="••••••••" className="input-field pl-12"
                                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Kayıt Ol <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Zaten hesabınız var mı? <Link to="/login" className="text-primary-600 font-bold hover:underline">Giriş Yapın</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}