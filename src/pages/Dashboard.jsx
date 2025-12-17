import { useState, useEffect, useRef } from 'react'
import { Building, Users, DollarSign, Activity, TrendingUp, Bell, Briefcase, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle, Building2, FileDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'
import { useNavigate } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import Portal from '../components/Portal'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

import { generateDashboardReport } from '../utils/reportUtils'
import { useNotification } from '../context/NotificationContext'

// Renklerin parlak versiyonlarının haritası
const getBrightStroke = (color) => {
    const colorMap = {
        '#3b82f6': '#0284c7', // Blue -> Bright Blue
        '#10b981': '#059669', // Green -> Bright Green
        '#8b5cf6': '#7c3aed', // Purple -> Bright Purple
        '#ec4899': '#db2777', // Pink -> Bright Pink
        '#f59e0b': '#d97706', // Amber -> Bright Amber
        '#ef4444': '#dc2626', // Red -> Bright Red
        '#06b6d4': '#0891b2', // Cyan -> Bright Cyan
        '#6366f1': '#4f46e5'  // Indigo -> Bright Indigo
    }
    return colorMap[color] || color
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [showNotifications, setShowNotifications] = useState(false)
    const [showAttendanceModal, setShowAttendanceModal] = useState(false)
    const [showProjectModal, setShowProjectModal] = useState(false)
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [showEmployeesModal, setShowEmployeesModal] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedProject, setSelectedProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [hoveredBar, setHoveredBar] = useState(null)
    const notificationRef = useRef(null)

    const { showToast } = useToast()
    const { notifications, unreadCount, markAllAsRead, addNotification } = useNotification()

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const [dashboardData, setDashboardData] = useState({
        projects: { total: 0, active: 0, completed: 0 },
        employees: { total: 0, active: 0, allEmployees: [] },
        expenses: { total: 0, byCategory: [], allExpenses: [] },
        attendance: { present: 0, absent: 0, leave: 0 },
        roles: { total: 0 },
        attendance: { present: 0, absent: 0, leave: 0 },
        roles: { total: 0 },
        todayAttendance: [],
        activeProjects: [],
        allProjects: []
    })

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const [projectsRes, employeesRes, expensesRes, attendanceRes, rolesRes] = await Promise.all([
                api.get('/projects'),
                api.get('/employees'),
                api.get('/expenses'),
                api.get('/attendance'),
                api.get('/roles')
            ])

            const projects = projectsRes.data
            const employees = employeesRes.data
            const expenses = expensesRes.data
            const attendance = attendanceRes.data
            const roles = rolesRes.data

            // Harcama kategorilerine göre gruplama
            const expensesByCategory = expenses.reduce((acc, exp) => {
                const existing = acc.find(item => item.name === exp.category)
                if (existing) {
                    existing.value += parseFloat(exp.amount || 0)
                } else {
                    acc.push({ name: exp.category, value: parseFloat(exp.amount || 0) })
                }
                return acc
            }, [])

            // Yoklama durumları - Tarih karşılaştırmasını local timezone ile normalize et
            const today = new Date()
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            
            const todayAttendance = attendance.filter(a => {
                if (!a.date) return false
                const attendanceDate = new Date(a.date)
                const attendanceDateStr = `${attendanceDate.getFullYear()}-${String(attendanceDate.getMonth() + 1).padStart(2, '0')}-${String(attendanceDate.getDate()).padStart(2, '0')}`
                return attendanceDateStr === todayStr
            })
            const attendanceStats = {
                present: todayAttendance.filter(a => a.status === 'Geldi').length,
                absent: todayAttendance.filter(a => a.status === 'Gelmedi').length,
                leave: todayAttendance.filter(a => a.status === 'İzinli' || a.status === 'Raporlu').length
            }

            setDashboardData({
                projects: {
                    total: projects.length,
                    active: projects.filter(p => p.status === 'Devam Ediyor').length,
                    completed: projects.filter(p => p.status === 'Tamamlandı').length
                },
                employees: {
                    total: employees.length,
                    active: employees.filter(e => e.status === 'aktif').length,
                    allEmployees: employees
                },
                expenses: {
                    total: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
                    byCategory: expensesByCategory,
                    allExpenses: expenses // Tüm harcama verilerini sakla
                },
                attendance: attendanceStats,
                roles: { total: roles.length },

                todayAttendance: todayAttendance,
                activeProjects: projects.filter(p => p.status === 'Devam Ediyor').slice(0, 5),
                allProjects: projects // Tüm proje verilerini sakla
            })
        } catch (error) {
            console.error('Dashboard data fetch error:', error)
            showToast('Veriler yüklenirken hata oluştu.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    const handleDownloadReport = () => {
        try {
            console.log('📥 PDF İndirme başlıyor...');
            console.log('Dashboard Data:', dashboardData);
            
            const result = generateDashboardReport(dashboardData);
            
            if (result.success) {
                showToast('PDF rapor başarıyla indirildi.', 'success');
                addNotification('success', 'Genel Dashboard Raporu indirildi', 'REPORT');
            } else {
                const errorMsg = result.error?.message || 'Bilinmeyen hata';
                console.error('❌ PDF Hatası:', result.error);
                showToast(`Rapor hatası: ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('❌ PDF İndirme Hatası:', error);
            showToast(`Rapor oluşturulamadı: ${error.message}`, 'error');
        }
    }

    const getActivityColor = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-500';
            case 'danger': return 'bg-red-500';
            case 'warning': return 'bg-amber-500';
            default: return 'bg-blue-500';
        }
    }

    const statsCards = [
        {
            label: 'Toplam Proje',
            value: dashboardData.projects.total,
            subValue: `${dashboardData.projects.active} Aktif`,
            icon: Building,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            onClick: () => navigate('/projects')
        },
        {
            label: 'Toplam Çalışan',
            value: dashboardData.employees.total,
            subValue: `${dashboardData.employees.active} Aktif`,
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            onClick: () => setShowEmployeesModal(true)
        },
        {
            label: 'Toplam Harcama',
            value: `${dashboardData.expenses.total.toLocaleString('tr-TR')} ₺`,
            subValue: `${dashboardData.expenses.byCategory.length} Kategori`,
            icon: DollarSign,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            border: 'border-violet-200',
            onClick: () => setShowExpenseModal(true)
        },
        {
            label: 'Roller',
            value: dashboardData.roles.total,
            subValue: 'Pozisyon',
            icon: Briefcase,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            onClick: () => navigate('/team')
        }
    ]

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kontrol Paneli</h1>
                    <p className="text-slate-500 mt-1">Şantiye verileri ve günlük özetler</p>
                </div>
                <div className="flex gap-3 relative" ref={notificationRef}>
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications)
                            if (!showNotifications) {
                                markAllAsRead();
                            }
                        }}
                        className={`btn-secondary flex items-center gap-2 relative ${showNotifications ? 'bg-slate-100' : ''}`}
                    >
                        <Bell size={18} />
                        <span className="hidden sm:inline">Bildirimler</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-fade-in overflow-hidden">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Son Hareketler</h3>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">{notifications.length}</span>
                                    {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} Yeni</span>}
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-sm">Henüz işlem yok.</div>
                                ) : (
                                    notifications.map((act) => (
                                        <div key={act.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${!act.isRead ? 'bg-blue-50/50' : ''}`}>
                                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${getActivityColor(act.type)}`} />
                                            <div>
                                                <p className="text-sm text-slate-700 leading-snug">{act.message}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(act.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(act.timestamp).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <button onClick={handleDownloadReport} className="btn-primary shadow-xl shadow-primary-500/20 active:scale-95 transition-transform flex items-center gap-2">
                        <FileDown size={18} /> PDF Rapor İndir
                    </button>
                </div>
            </div>

            {/* İSTATİSTİK KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="card border-l-4 border-slate-200">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-xl" />
                            </div>
                        </div>
                    ))
                ) : (
                    statsCards.map((stat, index) => (
                        <div
                            key={index}
                            onClick={stat.onClick}
                            className={`card border-l-4 ${stat.border} hover:scale-105 transition-all duration-300 cursor-pointer group`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                                    <p className="text-xs text-slate-500">{stat.subValue}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Detayları Gör</span>
                                <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* BUGÜNKÜ YOKLAMA DURUMU */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div
                    onClick={() => { setSelectedStatus('Geldi'); setShowAttendanceModal(true) }}
                    className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-emerald-600" />
                            Bugün Geldi
                        </h3>
                        <span className="text-2xl font-bold text-emerald-600">{dashboardData.attendance.present}</span>
                    </div>
                    <div className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <span>Gelenleri Gör</span>
                        <ArrowRight size={14} className="ml-1" />
                    </div>
                </div>

                <div
                    onClick={() => { setSelectedStatus('İzinli'); setShowAttendanceModal(true) }}
                    className="card bg-gradient-to-br from-amber-50 to-white border-amber-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={20} className="text-amber-600" />
                            İzinli/Raporlu
                        </h3>
                        <span className="text-2xl font-bold text-amber-600">{dashboardData.attendance.leave}</span>
                    </div>
                    <div className="text-xs text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <span>İzinlileri Gör</span>
                        <ArrowRight size={14} className="ml-1" />
                    </div>
                </div>

                <div
                    onClick={() => { setSelectedStatus('Gelmedi'); setShowAttendanceModal(true) }}
                    className="card bg-gradient-to-br from-red-50 to-white border-red-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-600" />
                            Gelmedi
                        </h3>
                        <span className="text-2xl font-bold text-red-600">{dashboardData.attendance.absent}</span>
                    </div>
                    <div className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <span>Gelmeyenleri Gör</span>
                        <ArrowRight size={14} className="ml-1" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* HARCAMA GRAFİĞİ */}
                <div className="card">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Kategori Bazlı Harcamalar</h3>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : dashboardData.expenses.byCategory.length === 0 ? (
                        <div className="h-64 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
                            <DollarSign size={32} className="text-slate-300 mb-2" />
                            <p>Henüz harcama kaydı yok</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.expenses.byCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dashboardData.expenses.byCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('tr-TR')} ₺`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* PROJE DURUMU GRAFİĞİ */}
                <div className="card">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Proje Durumu</h3>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[
                                { name: 'Aktif', value: dashboardData.projects.active, fill: '#3b82f6' },
                                { name: 'Tamamlanan', value: dashboardData.projects.completed, fill: '#10b981' },
                                { name: 'Toplam', value: dashboardData.projects.total, fill: '#8b5cf6' }
                            ]}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar 
                                    dataKey="value" 
                                    radius={[8, 8, 0, 0]}
                                    onMouseEnter={(data) => setHoveredBar(data.name)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                >
                                    {[
                                        { name: 'Aktif', fill: '#3b82f6' },
                                        { name: 'Tamamlanan', fill: '#10b981' },
                                        { name: 'Toplam', fill: '#8b5cf6' }
                                    ].map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                            stroke={hoveredBar === entry.name ? getBrightStroke(entry.fill) : 'none'}
                                            strokeWidth={hoveredBar === entry.name ? 3 : 0}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* AKTİF PROJELER */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Devam Eden Projeler</h3>
                    <button
                        onClick={() => navigate('/projects')}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-semibold"
                    >
                        Tümünü Gör <ArrowRight size={16} />
                    </button>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : dashboardData.activeProjects.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Devam eden proje yok.</p>
                    ) : (
                        dashboardData.activeProjects.map((project) => (
                            <div
                                key={project.id}
                                className="flex gap-4 items-center p-4 bg-gradient-to-r from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => { setSelectedProject(project); setShowProjectModal(true) }}
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                                    <Building2 size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{project.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{project.city}, {project.district}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* YOKLAMA MODAL */}
            {showAttendanceModal && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowAttendanceModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold">Bugünkü Yoklama - {selectedStatus}</h2>
                                        <p className="text-primary-100 text-sm mt-1">
                                            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowAttendanceModal(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                                {dashboardData.todayAttendance
                                    .filter(a => {
                                        if (selectedStatus === 'İzinli') {
                                            return a.status === 'İzinli' || a.status === 'Raporlu'
                                        }
                                        return a.status === selectedStatus
                                    })
                                    .length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                                        <p className="text-slate-500">Bu durumda kayıt bulunamadı</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dashboardData.todayAttendance
                                            .filter(a => {
                                                if (selectedStatus === 'İzinli') {
                                                    return a.status === 'İzinli' || a.status === 'Raporlu'
                                                }
                                                return a.status === selectedStatus
                                            })
                                            .map((attendance, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${attendance.status === 'Geldi' ? 'bg-emerald-100 text-emerald-600' :
                                                            attendance.status === 'Gelmedi' ? 'bg-red-100 text-red-600' :
                                                                'bg-amber-100 text-amber-600'
                                                            }`}>
                                                            {attendance.status === 'Geldi' ? <CheckCircle2 size={20} /> :
                                                                attendance.status === 'Gelmedi' ? <AlertCircle size={20} /> :
                                                                    <Clock size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {attendance.Employee?.first_name || ''} {attendance.Employee?.last_name || 'Bilinmeyen Çalışan'}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{attendance.Project?.name || 'Proje Bilinmiyor'}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${attendance.status === 'Geldi' ? 'bg-emerald-100 text-emerald-700' :
                                                        attendance.status === 'Gelmedi' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {attendance.status}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                                <button
                                    onClick={() => setShowAttendanceModal(false)}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                >
                                    Kapat
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAttendanceModal(false)
                                        navigate(`/attendance?status=${selectedStatus}`)
                                    }}
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                >
                                    Tüm Detayları Gör
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* HARCAMA DETAY MODAL */}
            {showExpenseModal && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowExpenseModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-violet-600 to-violet-700 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-1">Proje Bazında Harcamalar</h2>
                                        <p className="text-violet-100 text-sm">Projelere göre toplam harcama dağılımı</p>
                                    </div>
                                    <button
                                        onClick={() => setShowExpenseModal(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-4"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                                {/* İstatistikler */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-violet-50 p-4 rounded-xl border border-violet-200">
                                        <p className="text-xs text-violet-600 mb-1 font-semibold uppercase">Toplam Harcama</p>
                                        <p className="text-2xl font-bold text-violet-700">
                                            {dashboardData.expenses.total.toLocaleString('tr-TR')} ₺
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                        <p className="text-xs text-blue-600 mb-1 font-semibold uppercase">Proje Sayısı</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {dashboardData.activeProjects.length}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                        <p className="text-xs text-emerald-600 mb-1 font-semibold uppercase">Ortalama Harcama</p>
                                        <p className="text-2xl font-bold text-emerald-700">
                                            {dashboardData.activeProjects.length > 0
                                                ? (dashboardData.expenses.total / dashboardData.activeProjects.length).toLocaleString('tr-TR')
                                                : 0} ₺
                                        </p>
                                    </div>
                                </div>

                                {/* Sütun Grafiği */}
                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Proje Bazında Harcama Dağılımı</h3>
                                    {dashboardData.allProjects && dashboardData.allProjects.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={(() => {
                                                return dashboardData.allProjects.map((project, index) => {
                                                    // Her proje için gerçek harcamaları topla
                                                    const projectExpenses = (dashboardData.expenses.allExpenses || []).filter(
                                                        exp => exp.ProjectId === project.id
                                                    )
                                                    const projectTotal = projectExpenses.reduce(
                                                        (sum, exp) => sum + parseFloat(exp.amount || 0),
                                                        0
                                                    )
                                                    return {
                                                        name: project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name,
                                                        fullName: project.name,
                                                        harcama: projectTotal,
                                                        fill: COLORS[index % COLORS.length]
                                                    }
                                                })
                                            })()}>
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={80}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis
                                                    tickFormatter={(value) => `${(value / 1000).toLocaleString('tr-TR')}K`}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    formatter={(value) => [`${value.toLocaleString('tr-TR')} ₺`, 'Harcama']}
                                                    labelFormatter={(label) => {
                                                        const item = dashboardData.allProjects.find(p =>
                                                            (p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name) === label
                                                        )
                                                        return item ? item.name : label
                                                    }}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                />
                                                <Bar 
                                                    dataKey="harcama" 
                                                    radius={[8, 8, 0, 0]}
                                                    onMouseEnter={(data) => setHoveredBar(data.name)}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                >
                                                    {(() => {
                                                        return dashboardData.allProjects.map((project, index) => {
                                                            const barData = dashboardData.allProjects.map((p, i) => {
                                                                const projectExpenses = (dashboardData.expenses.allExpenses || []).filter(
                                                                    exp => exp.ProjectId === p.id
                                                                )
                                                                return {
                                                                    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name
                                                                }
                                                            })
                                                            const isHovered = hoveredBar === barData[index]?.name
                                                            const fillColor = COLORS[index % COLORS.length]
                                                            return (
                                                                <Cell 
                                                                    key={`cell-${index}`}
                                                                    fill={fillColor}
                                                                    stroke={isHovered ? getBrightStroke(fillColor) : 'none'}
                                                                    strokeWidth={isHovered ? 3 : 0}
                                                                />
                                                            )
                                                        })
                                                    })()}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-slate-400">
                                            <p>Aktif proje bulunamadı</p>
                                        </div>
                                    )}
                                </div>

                                {/* Detaylı Liste */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Proje Detayları</h3>
                                    <div className="space-y-3">
                                        {dashboardData.allProjects && dashboardData.allProjects.map((project, index) => {
                                            // Her proje için gerçek harcamaları topla
                                            const projectExpenses = (dashboardData.expenses.allExpenses || []).filter(
                                                exp => exp.ProjectId === project.id
                                            )
                                            const projectTotal = projectExpenses.reduce(
                                                (sum, exp) => sum + parseFloat(exp.amount || 0),
                                                0
                                            )

                                            return (
                                                <div key={project.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-slate-800">{project.name}</h4>
                                                            <p className="text-xs text-slate-500 mt-1">{project.city}, {project.district}</p>
                                                            <p className="text-xs text-slate-600 mt-1">{projectExpenses.length} harcama kaydı</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                                                                {Math.floor(projectTotal).toLocaleString('tr-TR')} ₺
                                                            </p>
                                                            <p className="text-xs text-slate-500">Toplam Harcama</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                                                            {project.status}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                            Bütçe: {project.budget ? parseFloat(project.budget).toLocaleString('tr-TR') : '0'} ₺
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                <button
                                    onClick={() => setShowExpenseModal(false)}
                                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                >
                                    Kapat
                                </button>
                                <button
                                    onClick={() => { setShowExpenseModal(false); navigate('/expenses') }}
                                    className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-semibold flex items-center gap-2"
                                >
                                    Tüm Harcamalar
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* PROJE DETAY MODAL */}
            {showProjectModal && selectedProject && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowProjectModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                                                <Building2 size={16} />
                                                {selectedProject.city}, {selectedProject.district}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full font-semibold text-sm ${selectedProject.status === 'Devam Ediyor' ? 'bg-emerald-100 text-emerald-700' :
                                                selectedProject.status === 'Tamamlandı' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {selectedProject.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowProjectModal(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-4"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-220px)]">
                                {/* Proje Bilgileri Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Başlangıç Tarihi */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Başlangıç Tarihi</p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {new Date(selectedProject.start_date).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>

                                    {/* Bütçe */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Bütçe</p>
                                        <p className="text-lg font-bold text-primary-600">
                                            {parseFloat(selectedProject.budget).toLocaleString('tr-TR')} ₺
                                        </p>
                                    </div>
                                </div>

                                {/* Adres Bilgisi */}
                                {selectedProject.address && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                                        <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Adres</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">{selectedProject.address}</p>
                                    </div>
                                )}

                                {/* Proje İstatistikleri */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                        <p className="text-xs text-emerald-600 font-semibold mb-1">Durum</p>
                                        <p className="text-2xl font-bold text-emerald-700">{selectedProject.status}</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-xs text-blue-600 font-semibold mb-1">Konum</p>
                                        <p className="text-sm font-bold text-blue-700">{selectedProject.city}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                                <button
                                    onClick={() => setShowProjectModal(false)}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                >
                                    Kapat
                                </button>
                                <button
                                    onClick={() => {
                                        setShowProjectModal(false)
                                        navigate('/projects')
                                    }}
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                >
                                    Tüm Projelere Git
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* ÇALIŞAN LİSTESİ MODAL */}
            {showEmployeesModal && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setShowEmployeesModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-1">Çalışan Listesi</h2>
                                        <p className="text-emerald-100 text-sm">Tüm çalışanlar ve detayları</p>
                                    </div>
                                    <button
                                        onClick={() => setShowEmployeesModal(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-4"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                                {/* İstatistikler */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                        <p className="text-xs text-emerald-600 mb-1 font-semibold uppercase">Toplam Çalışan</p>
                                        <p className="text-2xl font-bold text-emerald-700">
                                            {dashboardData.employees.total}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                        <p className="text-xs text-blue-600 mb-1 font-semibold uppercase">Aktif Çalışan</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {dashboardData.employees.active}
                                        </p>
                                    </div>
                                    <div className="bg-violet-50 p-4 rounded-xl border border-violet-200">
                                        <p className="text-xs text-violet-600 mb-1 font-semibold uppercase">Pasif Çalışan</p>
                                        <p className="text-2xl font-bold text-violet-700">
                                            {dashboardData.employees.total - dashboardData.employees.active}
                                        </p>
                                    </div>
                                </div>

                                {/* Tablo */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Çalışan</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rol</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İletişim</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Günlük Ücret</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {dashboardData.employees.allEmployees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-4 py-12 text-center text-slate-500">
                                                            <Users className="mx-auto text-slate-300 mb-2" size={48} />
                                                            Kayıtlı çalışan bulunamadı
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    dashboardData.employees.allEmployees.map((employee) => (
                                                        <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                                                                        {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-800">
                                                                            {employee.first_name} {employee.last_name}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">
                                                                            {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('tr-TR') : '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                                    {employee.Role?.name || 'Rol Yok'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="text-sm">
                                                                    <p className="text-slate-700">{employee.phone || '-'}</p>
                                                                    <p className="text-xs text-slate-500">{employee.email || '-'}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="font-semibold text-slate-800">
                                                                    {employee.daily_rate ? `${employee.daily_rate} ₺` : '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'aktif'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {employee.status === 'aktif' ? 'Aktif' : 'Pasif'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                <button
                                    onClick={() => setShowEmployeesModal(false)}
                                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                                >
                                    Kapat
                                </button>
                                <button
                                    onClick={() => { setShowEmployeesModal(false); navigate('/team') }}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-2"
                                >
                                    Tüm Çalışanlara Git
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    )
}