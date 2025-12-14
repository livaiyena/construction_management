import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Bell, Search, Settings, Calendar, ChevronDown, User } from 'lucide-react'

export default function Layout() {
    const { user } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const today = new Date().toLocaleDateString('tr-TR', dateOptions)

    const handleScroll = (e) => {
        const offset = e.currentTarget.scrollTop
        if (offset > 10) {
            setScrolled(true)
        } else {
            setScrolled(false)
        }
    }

    const handleNotifications = () => {
        showToast('Henüz okunmamış bildiriminiz yok.', 'info');
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            {/* Sidebar Fix */}
            <div className="relative z-50">
                <Sidebar />
            </div>

            <main className="flex-1 flex flex-col relative min-w-0">
                {/* Modern Header */}
                <header className={`
                    px-8 py-5 flex justify-between items-center transition-all duration-300 z-40
                    ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/60' : 'bg-transparent'}
                `}>
                    {/* Sol: Hoşgeldin Mesajı ve Tarih */}
                    <div className="flex flex-col">
                        <h1 className="text-base font-semibold public-sans text-slate-700 tracking-tight">
                            İnşaat Proje Yönetim Sistemi
                        </h1>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-medium">
                            <Calendar size={14} className="text-primary-500" />
                            <span className="capitalize">{today}</span>
                        </div>
                    </div>

                    {/* Sağ: Araçlar ve Profil */}
                    <div className="flex items-center gap-5">

                        {/* Aksiyon İkonları */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleNotifications}
                                className="p-3 bg-white hover:bg-white border text-slate-400 hover:text-primary-600 border-transparent hover:border-primary-100 rounded-2xl transition-all duration-300 relative shadow-sm hover:shadow-md group"
                            >
                                <Bell size={20} className="group-hover:animate-swing" />
                                <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>

                            <button
                                onClick={() => navigate('/settings')}
                                className="p-3 bg-white hover:bg-white border text-slate-400 hover:text-slate-700 border-transparent hover:border-slate-200 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <Settings size={20} />
                            </button>
                        </div>

                        {/* Profil Kartı */}
                        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                            <div className="flex flex-col items-end hidden md:block">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                                    {user?.name || 'Yönetici'}
                                </span>
                                <span className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {user?.role === 'admin' ? 'Admin' : 'Personel'}
                                </span>
                            </div>

                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 p-[2px] shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
                                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                                        {user?.id ? (
                                            <span className="font-bold text-xl bg-gradient-to-br from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </span>
                                        ) : (
                                            <User className="text-primary-600" size={20} />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* İçerik Scroll Alanı */}
                <div
                    className="flex-1 overflow-y-auto px-4 pb-4 md:px-8 md:pb-8 scroll-smooth"
                    onScroll={handleScroll}
                >
                    <div className="max-w-7xl mx-auto min-h-full animate-in fade-in zoom-in-95 duration-500">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div >
    )
}