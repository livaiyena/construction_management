import { Home, Building2, Users, Calendar, DollarSign, FileText, Settings, ChevronRight, Package } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Sidebar() {
    const navigate = useNavigate()
    
    const navItems = [
        { name: 'Genel Bakış', icon: Home, path: '/' },
        { name: 'Projeler', icon: Building2, path: '/projects' },
        { name: 'Ekip Yönetimi', icon: Users, path: '/team' },
        { name: 'Yoklama', icon: Calendar, path: '/attendance' },
        { name: 'Harcamalar', icon: DollarSign, path: '/expenses' },
        { name: 'Envanter', icon: Package, path: '/inventory' },
        { name: 'Raporlar', icon: FileText, path: '/reports' },
        { name: 'Sistem Logları', icon: Settings, path: '/system-logs' },
    ]

    return (
        <aside className="w-72 bg-dark-950 text-white flex flex-col h-full shadow-2xl relative overflow-hidden z-0">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none" />

            <div className="p-8 relative z-10">
                <div 
                    onClick={() => navigate('/')} 
                    className="flex items-center gap-3 mb-1 cursor-pointer group transition-transform hover:scale-105 active:scale-95"
                >
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                        <Building2 className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight group-hover:text-primary-400 transition-colors">İnşaat<span className="text-primary-400">Yön</span></h1>
                    </div>
                </div>
                <p className="text-slate-500 text-xs pl-[3.25rem]">Profesyonel Yönetim</p>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-2 relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menü</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 border border-transparent ${isActive
                                ? 'bg-primary-600/10 text-primary-400 border-primary-600/20 shadow-inner'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} className={isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="text-primary-500 animate-in slide-in-from-left-2" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800/50 relative z-10">
                {/* Footer Info or Version could go here */}

            </div>
        </aside>
    )
}