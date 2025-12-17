import { Shield, Activity, PlusCircle, Edit, Trash2 } from 'lucide-react'

export default function LogStats({ logs, total }) {
    const displayTotal = total || logs.length
    const creates = logs.filter(l => l.action === 'CREATE').length
    const updates = logs.filter(l => l.action === 'UPDATE').length
    const deletes = logs.filter(l => l.action === 'DELETE').length

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
                value={displayTotal}
                icon={Activity}
                color="text-slate-600"
                bg="bg-slate-50 border-slate-200"
            />
            <StatCard
                label="Oluşturma"
                value={creates}
                icon={PlusCircle}
                color="text-emerald-600"
                bg="bg-emerald-50 border-emerald-200"
            />
            <StatCard
                label="Güncelleme"
                value={updates}
                icon={Edit}
                color="text-blue-600"
                bg="bg-blue-50 border-blue-200"
            />
            <StatCard
                label="Silme"
                value={deletes}
                icon={Trash2}
                color="text-red-600"
                bg="bg-red-50 border-red-200"
            />
        </div>
    )
}
