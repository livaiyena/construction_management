import { Filter, X } from 'lucide-react'

export default function LogFilters({ filters, setFilters, onClear }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <Filter size={20} />
                    <span className="font-semibold text-sm">Filtrele:</span>
                </div>

                <select
                    className="input-field py-2 w-full md:w-64"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="">Tüm Tablolar</option>
                    <option value="Projects">Projeler</option>
                    <option value="Employees">Çalışanlar</option>
                    <option value="Attendance">Yoklama</option>
                    <option value="Expenses">Harcamalar</option>
                    <option value="Materials">Malzemeler</option>
                    <option value="Equipment">Ekipmanlar</option>
                    <option value="Suppliers">Tedarikçiler</option>
                    <option value="Users">Kullanıcılar</option>
                    <option value="Roles">Roller</option>
                </select>

                <select
                    className="input-field py-2 w-full md:w-48"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">Tüm İşlemler</option>
                    <option value="CREATE">Oluşturma</option>
                    <option value="UPDATE">Güncelleme</option>
                    <option value="DELETE">Silme</option>
                    <option value="LOGIN">Giriş</option>
                    <option value="LOGOUT">Çıkış</option>
                </select>

                {(filters.category || filters.type) && (
                    <button
                        onClick={onClear}
                        className="btn-secondary py-2 px-3 flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        <X size={16} />
                        Temizle
                    </button>
                )}
            </div>
        </div>
    )
}
