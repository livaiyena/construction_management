import { User, Mail, Shield, Clock, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function Profile() {
    const { user } = useAuth()
    const { notifications } = useNotification()

    // Get last 5 login/auth activities
    const authLogs = notifications
        .filter(log => log.category === 'AUTH')
        .slice(0, 5)

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800">Profilim</h1>
            <p className="text-slate-500">Hesap bilgileriniz ve son aktiviteleriniz.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* User Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mb-4 ring-4 ring-white shadow-lg">
                            <span className="text-4xl font-bold text-primary-600">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                        <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider border border-primary-100">
                            {user?.role === 'admin' ? 'Yönetici' : 'Personel'}
                        </span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">İletişim</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Shield size={16} className="text-slate-400" />
                            <span>Hesap ID: {user?.id}</span>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <Clock size={20} className="text-slate-500" />
                            </div>
                            <h3 className="font-bold text-slate-800">Son Hesap Hareketleri</h3>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {authLogs.length > 0 ? (
                                authLogs.map(log => (
                                    <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${log.type === 'success' ? 'bg-green-500' :
                                                log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                            }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700">{log.message}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(log.timestamp).toLocaleDateString('tr-TR')} - {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    Henüz kaydedilmiş bir oturum hareketi yok.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
