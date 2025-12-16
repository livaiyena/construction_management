import { Shield, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LogStats({ logs }) {
    const total = logs.length
    const errors = logs.filter(l => l.type === 'error').length
    const warnings = logs.filter(l => l.type === 'warning').length
    const success = logs.filter(l => l.type === 'success').length

    const StatCard = ({ label, value, icon: Icon, color, bg }) => (
        <div className={`p-4 rounded-xl border ${bg} border-opacity-50 flex items-center gap-4`}>
            <div className={`p-3 rounded-lg ${color} bg-white bg-opacity-60`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium opacity-80">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    )

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                label="Toplam Kayıt"
                value={total}
                icon={Activity}
                color="text-slate-600"
                bg="bg-slate-50 border-slate-200"
            />
            <StatCard
                label="Başarılı İşlem"
                value={success}
                icon={CheckCircle2}
                color="text-emerald-600"
                bg="bg-emerald-50 border-emerald-200"
            />
            <StatCard
                label="Hatalar"
                value={errors}
                icon={Shield}
                color="text-red-600"
                bg="bg-red-50 border-red-200"
            />
            <StatCard
                label="Uyarılar"
                value={warnings}
                icon={AlertCircle}
                color="text-amber-600"
                bg="bg-amber-50 border-amber-200"
            />
        </div>
    )
}
