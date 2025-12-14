import { useState, useEffect } from 'react'
import { File, Download, Trash2, Plus, FileText, ImageIcon, FileCode } from 'lucide-react'
import { docService } from '../services/modules'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Documents() {
    const { showToast } = useToast()
    const [docs, setDocs] = useState([])
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [newDoc, setNewDoc] = useState({
        ProjectId: '',
        title: '',
        type: 'Sözleşme',
        description: '',
        // File upload simulation fields
        file_name: 'ornek_dosya.pdf',
        file_size: 1024 * 500 // 500kb dummy
    })

    useEffect(() => { fetchProjects() }, [])
    useEffect(() => { if (selectedProject) fetchDocs() }, [selectedProject])

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
            if (res.data.length > 0) setSelectedProject(res.data[0].id);
        } catch (err) { console.error(err) }
    }

    const fetchDocs = async () => {
        try {
            const data = await docService.getAll(selectedProject)
            setDocs(data)
        } catch (error) { console.error(error) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await docService.create({ ...newDoc, ProjectId: selectedProject })
            showToast('Döküman eklendi', 'success')
            setShowModal(false)
            fetchDocs()
        } catch (error) { showToast('Hata', 'error') }
    }

    const handleDelete = async (id) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await docService.delete(id)
            setDocs(docs.filter(d => d.id !== id))
            showToast('Silindi', 'success')
        } catch (error) { showToast('Hata', 'error') }
    }

    const getIcon = (type) => { // c:\Users\omer\Downloads\insaat-yonetim-frontend-main\insaat-yonetim-frontend-main\backend\models\Document.js line 25
        if (type.includes('Resim')) return <ImageIcon className="text-purple-500" />
        if (type.includes('Plan')) return <FileCode className="text-blue-500" />
        return <FileText className="text-orange-500" />
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Döküman Yönetimi</h1>
                    <p className="text-slate-500">Projeye ait sözleşme, plan ve ruhsatlar.</p>
                </div>
                <button onClick={() => setShowModal(true)} disabled={!selectedProject} className="btn-primary py-2 px-4 flex items-center gap-2">
                    <Plus size={18} /> Dosya Yükle
                </button>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">Bu projeye ait dosya bulunamadı.</p>
                    </div>
                ) : docs.map(doc => (
                    <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-primary-50 transition-colors">
                                {getIcon(doc.type)}
                            </div>
                            <button onClick={() => handleDelete(doc.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-bold text-slate-800 text-lg truncate" title={doc.title}>{doc.title}</h3>
                            <p className="text-sm text-slate-500 font-medium">{doc.type}</p>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{doc.description}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                            <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                            <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-xl">Dosya Yükle</h3></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="label">Başlık</label><input required className="input-field w-full" value={newDoc.title} onChange={e => setNewDoc({ ...newDoc, title: e.target.value })} /></div>
                            <div>
                                <label className="label">Tip</label>
                                <select className="input-field w-full" value={newDoc.type} onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}>
                                    <option>Sözleşme</option>
                                    <option>Ruhsat</option>
                                    <option>Mimari Plan</option>
                                    <option>Statik Proje</option>
                                    <option>Fatura</option>
                                    <option>Diğer</option>
                                </select>
                            </div>
                            <div><label className="label">Açıklama</label><textarea className="input-field w-full" rows="3" value={newDoc.description} onChange={e => setNewDoc({ ...newDoc, description: e.target.value })} /></div>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                                <p className="text-sm text-slate-500">Dosya seç (Simülasyon)</p>
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
