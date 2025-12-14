import { useState, useEffect } from 'react'
import { Plus, Calendar as CalIcon, CloudSun, Users, FileText, Trash2, Search } from 'lucide-react'
import { siteDiaryService } from '../services/modules'
import { useToast } from '../context/ToastContext'
import api from '../services/api' // Fallback for projects

export default function SiteDiary() {
    const { showToast } = useToast()
    const [entries, setEntries] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({ projectId: '', date: '' })

    // Form State
    const [showModal, setShowModal] = useState(false)
    const [newEntry, setNewEntry] = useState({
        ProjectId: '',
        date: new Date().toISOString().split('T')[0],
        weather_condition: 'Güneşli',
        temperature: '',
        worker_count: '',
        work_summary: '',
        notes: ''
    })

    useEffect(() => {
        fetchData()
        fetchProjects()
    }, [filter])

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) { console.error(err) }
    }

    const fetchData = async () => {
        try {
            const data = await siteDiaryService.getAll(filter);
            setEntries(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await siteDiaryService.create(newEntry);
            showToast('Günlük rapor oluşturuldu.', 'success');
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast('Hata oluştu', 'error');
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await siteDiaryService.delete(id);
            showToast('Silindi', 'success');
            setEntries(entries.filter(e => e.id !== id));
        } catch (err) { showToast('Hata', 'error'); }
    }

    if (loading) return <div className="p-8">Yükleniyor...</div>

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Şantiye Günlüğü</h1>
                    <p className="text-slate-500">Günlük saha raporlarını buradan takip edebilirsiniz.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary py-2 px-4 flex items-center gap-2">
                    <Plus size={18} /> Yeni Rapor Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50">
                    <Search size={18} className="text-slate-400" />
                    <select
                        className="bg-transparent outline-none text-sm min-w-[200px]"
                        value={filter.projectId}
                        onChange={(e) => setFilter({ ...filter, projectId: e.target.value })}
                    >
                        <option value="">Tüm Projeler</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <input
                    type="date"
                    className="input-field py-2"
                    value={filter.date}
                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">Kayıt bulunamadı.</p>
                    </div>
                ) : entries.map(entry => (
                    <div key={entry.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{entry.Project?.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                    <CalIcon size={14} />
                                    {new Date(entry.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(entry.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <span className="text-xs text-blue-600 font-bold uppercase">Hava Durumu</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <CloudSun size={20} className="text-blue-500" />
                                    <span className="font-semibold text-slate-700">{entry.weather_condition} ({entry.temperature}°C)</span>
                                </div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <span className="text-xs text-orange-600 font-bold uppercase">Personel</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <Users size={20} className="text-orange-500" />
                                    <span className="font-semibold text-slate-700">{entry.worker_count} Kişi</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <FileText size={16} className="text-primary-500" /> Yapılan İşler
                                </h4>
                                <p className="text-slate-600 text-sm mt-1 bg-slate-50 p-3 rounded-lg">{entry.work_summary}</p>
                            </div>
                            {entry.notes && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900">Notlar</h4>
                                    <p className="text-slate-500 text-sm mt-1 italic">"{entry.notes}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold">Yeni Günlük Rapor</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Proje</label>
                                    <select required className="input-field w-full" value={newEntry.ProjectId} onChange={e => setNewEntry({ ...newEntry, ProjectId: e.target.value })}>
                                        <option value="">Seçiniz...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Tarih</label>
                                    <input type="date" required className="input-field w-full" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Hava Durumu</label>
                                    <select className="input-field w-full" value={newEntry.weather_condition} onChange={e => setNewEntry({ ...newEntry, weather_condition: e.target.value })}>
                                        <option>Güneşli</option>
                                        <option>Parçalı Bulutlu</option>
                                        <option>Yağmurlu</option>
                                        <option>Karlı</option>
                                        <option>Rüzgarlı</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Sıcaklık (°C)</label>
                                    <input type="number" className="input-field w-full" value={newEntry.temperature} onChange={e => setNewEntry({ ...newEntry, temperature: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Çalışan Sayısı</label>
                                    <input type="number" required className="input-field w-full" value={newEntry.worker_count} onChange={e => setNewEntry({ ...newEntry, worker_count: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="label">Yapılan İşler</label>
                                <textarea required rows="4" className="input-field w-full" value={newEntry.work_summary} onChange={e => setNewEntry({ ...newEntry, work_summary: e.target.value })} placeholder="Bugün sahada neler yapıldı..." />
                            </div>

                            <div>
                                <label className="label">Notlar (Opsiyonel)</label>
                                <textarea rows="2" className="input-field w-full" value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 py-3 rounded-xl font-medium">İptal</button>
                                <button type="submit" className="flex-1 btn-primary py-3">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
