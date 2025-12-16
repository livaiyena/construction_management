import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { Search, Settings, Calendar, ChevronDown, User, LogOut } from 'lucide-react'

export default function Layout() {
    const { user, logout } = useAuth()
    const { addNotification } = useNotification()
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const menuRef = useRef(null)

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const today = new Date().toLocaleDateString('tr-TR', dateOptions)

    const handleLogout = () => {
        addNotification('info', 'Oturum kapatıldı', 'AUTH')
        logout()
        navigate('/login')
    }

    const handleScroll = (e) => {
        const offset = e.currentTarget.scrollTop
        if (offset > 10) {
            setScrolled(true)
        } else {
            setScrolled(false)
        }
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            {/* Sidebar Fix */}
            <div className="relative z-50">
                <Sidebar />
            </div>

            <main className="flex-1 flex flex-col relative min-w-0">
                {/* Modern Header */}
                <header className={`px-8 py-5 flex justify-between items-center transition-all duration-300 z-40 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/60' : 'bg-transparent'}`}>
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

                        {/* Profil Kartı ve Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <div
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 pl-2 cursor-pointer group select-none"
                            >
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                                        {user?.name || 'Yönetici'}
                                    </span>
                                    <span className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {user?.role === 'admin' ? 'Admin' : 'Personel'}
                                    </span>
                                </div>

                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 p-[2px] shadow-lg shadow-primary-500/20 transition-all duration-300 ${isUserMenuOpen ? 'ring-4 ring-primary-100' : 'group-hover:shadow-primary-500/40'}`}>
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

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right z-50">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                                        <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                navigate('/profile')
                                                setIsUserMenuOpen(false)
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-700 rounded-xl flex items-center gap-3 transition-colors font-medium">
                                            <User size={18} />
                                            Profilim
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/settings')
                                                setIsUserMenuOpen(false)
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-700 rounded-xl flex items-center gap-3 transition-colors font-medium"
                                        >
                                            <Settings size={18} />
                                            Ayarlar
                                        </button>
                                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors font-medium"
                                        >
                                            <LogOut size={18} />
                                            Çıkış Yap
                                        </button>
                                    </div>
                                </div>
                            )}
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