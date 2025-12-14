import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const { showToast } = useToast()
    const navigate = useNavigate()

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            // Direkt sıfırlama rotasına istek atıyoruz
            await api.post('/auth/reset-password-direct', { email, newPassword })
            
            showToast('Şifre başarıyla güncellendi! Giriş yapılıyor...', 'success')
            setTimeout(() => navigate('/login'), 2000)
        } catch (error) {
            showToast(error.response?.data?.message || 'Hata oluştu', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Şifre Sıfırla</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        E-posta adresinizi ve yeni şifrenizi girin.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="email" required placeholder="E-posta adresiniz" 
                            className="input-field pl-12"
                            value={email} onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="password" required placeholder="Yeni Şifreniz" 
                            className="input-field pl-12"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                         {isLoading ? <Loader2 className="animate-spin" /> : <>Şifreyi Güncelle <CheckCircle2 size={18} /></>}
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <Link to="/login" className="text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Giriş sayfasına dön
                    </Link>
                </div>
            </div>
        </div>
    )
}