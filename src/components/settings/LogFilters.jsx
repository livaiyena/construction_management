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
                    <option value="">Tüm Kategoriler</option>
                    <option value="PROJECT">Projeler</option>
                    <option value="EMPLOYEE">Çalışanlar</option>
                    <option value="ATTENDANCE">Yoklama</option>
                    <option value="EXPENSE">Harcamalar</option>
                    <option value="INVENTORY">Envanter</option>
                    <option value="REPORT">Raporlar</option>
                    <option value="SYSTEM">Sistem</option>
                </select>

                <select
                    className="input-field py-2 w-full md:w-48"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">Tüm Durumlar</option>
                    <option value="success">Başarılı</option>
                    <option value="error">Hata</option>
                    <option value="warning">Uyarı</option>
                    <option value="info">Bilgi</option>
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
