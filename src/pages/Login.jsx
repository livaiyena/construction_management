import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HardHat, User, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            showToast('Lütfen tüm alanları doldurun.', 'warning')
            return
        }

        setIsLoading(true)

        try {
            const result = await login(email, password)
            if (result.success) {
                showToast('Giriş başarılı! Yönlendiriliyorsunuz...', 'success')
                navigate('/')
            } else {
                showToast(result.message || 'Giriş başarısız.', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Sol Taraf */}
            <div className="hidden lg:flex flex-col justify-between bg-dark-950 p-12 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-dark-950 z-0" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                        <HardHat className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">İnşaat<span className="text-primary-400">Yön</span></h1>
                </div>
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6">Şantiyenizi Profesyonelce Yönetin</h2>
                    <p className="text-slate-400 text-lg">Projelerinizi, ekiplerinizi ve bütçenizi tek bir yerden kontrol edin.</p>
                </div>
                <div className="relative z-10 text-sm text-slate-500">© 2024 İnşaatYön. Tüm hakları saklıdır.</div>
            </div>

            {/* Sağ Taraf - Form */}
            <div className="flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Hoş Geldiniz</h2>
                        <p className="text-slate-500 mt-2">Hesabınıza giriş yapın</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">E-posta Adresi</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="email" placeholder="ornek@sirket.com" className="input-field pl-12"
                                    value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="password" placeholder="••••••••" className="input-field pl-12"
                                    value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>

                        {/* Remember Me and Forgot Password sections removed */}

                        <button type="submit" disabled={isLoading} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Giriş Yap <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    {/* DÜZELTİLEN KISIM: Kayıt Ol Linki */}
                </div>
            </div>
        </div>
    )
}