import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { taskService } from '../services/modules'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function ProjectSchedule() {
    const { showToast } = useToast()
    const [tasks, setTasks] = useState([])
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState('')
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [newTask, setNewTask] = useState({
        ProjectId: '',
        name: '',
        start_date: '',
        end_date: '',
        status: 'Planlandı',
        progress: 0
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) fetchTasks()
    }, [selectedProject])

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
            if (res.data.length > 0) setSelectedProject(res.data[0].id);
        } catch (err) { console.error(err) }
    }

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const data = await taskService.getAll(selectedProject)
            setTasks(data)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await taskService.create({ ...newTask, ProjectId: selectedProject })
            showToast('Görev eklendi', 'success')
            setShowModal(false)
            fetchTasks()
        } catch (error) { showToast('Hata', 'error') }
    }

    const handleDelete = async (id) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await taskService.delete(id)
            setTasks(tasks.filter(t => t.id !== id))
            showToast('Silindi', 'success')
        } catch (error) { showToast('Hata', 'error') }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Tamamlandı': return 'bg-green-100 text-green-700 border-green-200'
            case 'Devam Ediyor': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'Gecikmiş': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">İş Programı</h1>
                    <p className="text-slate-500">Proje takvimi ve görev takibi.</p>
                </div>
                <button onClick={() => setShowModal(true)} disabled={!selectedProject} className="btn-primary py-2 px-4 flex items-center gap-2">
                    <Plus size={18} /> Yeni Görev
                </button>
            </div>

            {/* Project Selector */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Proje Seçiniz</label>
                <select
                    className="input-field w-full md:w-1/3"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Görev Adı</th>
                                <th className="px-6 py-4">Başlangıç</th>
                                <th className="px-6 py-4">Bitiş</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">İlerleme</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tasks.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Görev bulunamadı.</td></tr>
                            ) : tasks.map(task => (
                                <tr key={task.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{task.name}</td>
                                    <td className="px-6 py-4">{new Date(task.start_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{new Date(task.end_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 w-48">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500 rounded-full"
                                                    style={{ width: `${task.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">%{task.progress}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-xl">Yeni Görev</h3></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Görev Adı</label>
                                <input required type="text" className="input-field w-full" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Başlangıç</label><input required type="date" className="input-field w-full" value={newTask.start_date} onChange={e => setNewTask({ ...newTask, start_date: e.target.value })} /></div>
                                <div><label className="label">Bitiş</label><input required type="date" className="input-field w-full" value={newTask.end_date} onChange={e => setNewTask({ ...newTask, end_date: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Durum</label>
                                    <select className="input-field w-full" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                                        <option>Planlandı</option>
                                        <option>Devam Ediyor</option>
                                        <option>Tamamlandı</option>
                                        <option>Gecikmiş</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">İlerleme (%)</label>
                                    <input type="number" min="0" max="100" className="input-field w-full" value={newTask.progress} onChange={e => setNewTask({ ...newTask, progress: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 py-3 rounded-xl">İptal</button>
                                <button type="submit" className="flex-1 btn-primary py-3">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
